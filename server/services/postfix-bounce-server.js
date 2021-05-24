'use strict';

const log = require('../lib/log');
const config = require('../lib/config');
const net = require('net');
const campaigns = require('../models/campaigns');
const contextHelpers = require('../lib/context-helpers');
const { CampaignMessageStatus } = require('../../shared/campaigns');
const bluebird = require('bluebird');

const seenIds = new Set();

let remainder = '';
let reading = false;

async function readNextChunks(socket) {
    if (reading) {
        return false;
    }

    reading = true;

    while (true) {
        const chunk = socket.read();
        if (chunk === null) {
            reading = false;
            return;
        }

        const lines = (remainder + chunk.toString()).split(/\r?\n/);
        remainder = lines.pop();

        for (const line of lines) {
            try {
                const match = /\bstatus=(bounced|sent)\b/.test(line) && line.match(/\bpostfix\/\w+\[\d+\]:\s*([^:]+).*?status=(\w+)/);
                if (match) {
                    const queueId = match[1];
                    let queued = '';
                    let queuedAs = '';

                    if (!seenIds.has(queueId)) {
                        seenIds.add(queueId);

                        // Losacno: Check for local requeue
                        const status = match[2];
                        log.verbose('POSTFIXBOUNCE', 'Checking message %s for local requeue (status: %s)', queueId, status);
                        if (status === 'sent') {
                            // Save new queueId to update message's previous queueId (thanks @mfechner )
                            queued = / relay=/.test(line) && line.match(/status=sent \((.*)\)/);
                            if (queued) {
                                queued = queued[1];
                                queuedAs = queued.match(/ queued as (\w+)/);
                                if (queuedAs) {
                                    queuedAs = queuedAs[1];
                                } else {
                                    queuedAs = '';
                                }
                            }
                        }

                        const message = await campaigns.getMessageByResponseId(queueId);
                        if (message) {
                            if (queuedAs || status === 'sent') {
                                log.verbose('POSTFIXBOUNCE', 'Message %s locally requeued as %s', queueId, queuedAs);
                                // Update message's previous queueId (thanks @mfechner )
                                campaigns.updateMessageResponse(contextHelpers.getAdminContext(), message, queued, queuedAs);
                                log.verbose('POSTFIXBOUNCE', 'Successfully changed message queueId to %s', queuedAs);
                            } else {
                                campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, CampaignMessageStatus.BOUNCED, true);
                                log.verbose('POSTFIXBOUNCE', 'Marked message %s as bounced', queueId);
                            }

                            // No need to keep in memory... free it ( thanks @witzig )
                            seenIds.delete(queueId);
                        }
                    }
                }
            } catch (err) {
                log.error('POSTFIXBOUNCE', err && err.stack);
            }
        }

    }
}

function start(callback) {
    if (!config.postfixBounce.enabled) {
        return setImmediate(callback);
    }

    let started = false; // Not sure why all this magic around "started". But it was there this way in Mailtrain v1, so we kept it.

    const server = net.createServer(socket => {
        socket.on('readable', () => readNextChunks(socket));
    });

    server.on('error', err => {
        const port = config.postfixBounce.port;
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

    server.listen(config.postfixBounce.port, config.postfixBounce.host, () => {
        if (started) {
            return server.close();
        }
        started = true;
        log.info('POSTFIXBOUNCE', 'Server listening on port %s', config.postfixBounce.port);
        setImmediate(callback);
    });
}

module.exports.start = bluebird.promisify(start);

