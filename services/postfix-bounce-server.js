'use strict';

let log = require('npmlog');
let config = require('config');
let net = require('net');
let campaigns = require('../lib/models/campaigns');

let seenIds = new Set();

let server = net.createServer(socket => {
    let remainder = '';

    let reading = false;
    let readNextChunk = () => {
        let chunk = socket.read();
        if (chunk === null) {
            reading = false;
            return;
        }
        reading = true;

        let lines = (remainder + chunk.toString()).split(/\r?\n/);
        remainder = lines.pop();

        let pos = 0;
        let checkNextLine = () => {
            if (pos >= lines.length) {
                return readNextChunk();
            }
            let line = lines[pos++];
            let match = /\bstatus=(bounced|sent)\b/.test(line) && line.match(/\bpostfix\/\w+\[\d+\]:\s*([^:]+).*?status=(\w+)/);
            if (match) {
                let queueId = match[1];
                let queued = '';
                let queued_as = '';

                if (seenIds.has(queueId)) {
                    return checkNextLine();
                }
                seenIds.add(queueId);

                // Losacno: Check for local requeue
                let status = match[2];
                log.verbose('POSTFIXBOUNCE', 'Checking message %s for local requeue (status: %s)', queueId, status);
                if ( status === 'sent' ) {
                    // Save new queueId to update message's previous queueId (thanks @mfechner )
                    queued = / relay=/.test(line) && line.match(/status=sent \((.*)\)/);
                    if ( queued ) {
                        queued = queued[1];
                        queued_as = queued.match(/ queued as (\w+)/);
                        if (queued_as) {
                            queued_as = queued_as[1];
                        } else {
                            queued_as = '';
                        }
                    }
                }

                campaigns.findMailByResponse(queueId, (err, message) => {
                    if (err || !message) {
                        return checkNextLine();
                    }
                    if ( queued_as || status === 'sent' ) {
                        log.verbose('POSTFIXBOUNCE', 'Message %s locally requeued as %s', queueId, queued_as);
                        // Update message's previous queueId (thanks @mfechner )
                        campaigns.updateMessageResponse(message, queued, queued_as, (err, updated) => {
                            if (err) {
                                log.error('POSTFIXBOUNCE', 'Failed updating message: %s', err && err.stack);
                            } else if (updated) {
                                log.verbose('POSTFIXBOUNCE', 'Successfully changed message queueId to %s', queued_as);
                            }
                        });

                    } else {
                        campaigns.updateMessage(message, 'bounced', true, (err, updated) => {
                            if (err) {
                                log.error('POSTFIXBOUNCE', 'Failed updating message: %s', err && err.stack);
                            } else if (updated) {
                                log.verbose('POSTFIXBOUNCE', 'Marked message %s as bounced', queueId);
                            }
                        });
                    }

                    // No need to keep in memory... free it ( thanks @witzig )
                    seenIds.delete(queueId);

                    return checkNextLine();
                });
                return;

            } else {
                return checkNextLine();
            }
        };

        checkNextLine();
    };


    socket.on('readable', () => {
        if (reading) {
            return false;
        }
        readNextChunk();

    });
});

module.exports = callback => {
    if (!config.postfixbounce.enabled) {
        return setImmediate(callback);
    }

    let started = false;

    server.on('error', err => {
        const port = config.postfixbounce.port;
        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        switch (err.code) {
            case 'EACCES':
                log.error('POSTFIXBOUNCE', '%s requires elevated privileges.', bind);
                break;
            case 'EADDRINUSE':
                log.error('POSTFIXBOUNCE', '%s is already in use', bind);
                break;
            default:
                log.error('POSTFIXBOUNCE', err);
        }

        if (!started) {
            started = true;
            return callback(err);
        }
    });

    server.listen(config.postfixbounce.port, config.postfixbounce.host, () => {
        if (started) {
            return server.close();
        }
        started = true;
        log.info('POSTFIXBOUNCE', 'Server listening on port %s', config.postfixbounce.port);
        setImmediate(callback);
    });
};
