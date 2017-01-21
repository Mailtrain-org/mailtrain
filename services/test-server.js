'use strict';

let log = require('npmlog');
let config = require('config');
let crypto = require('crypto');
let humanize = require('humanize');

let SMTPServer = require('smtp-server').SMTPServer;

let totalMessages = 0;
let received = 0;

// Setup server
let server = new SMTPServer({

    // log to console
    logger: config.testserver.logger,

    // not required but nice-to-have
    banner: 'Welcome to My Awesome SMTP Server',

    // disable STARTTLS to allow authentication in clear text mode
    disabledCommands: ['STARTTLS'],

    // By default only PLAIN and LOGIN are enabled
    authMethods: ['PLAIN', 'LOGIN'],

    // Accept messages up to 10 MB
    size: 10 * 1024 * 1024,

    // Setup authentication
    onAuth: (auth, session, callback) => {
        let username = config.testserver.username;
        let password = config.testserver.password;

        // check username and password
        if (auth.username === username && auth.password === password) {
            return callback(null, {
                user: 'userdata' // value could be an user id, or an user object etc. This value can be accessed from session.user afterwards
            });
        }

        return callback(new Error('Authentication failed'));
    },

    // Validate MAIL FROM envelope address. Example allows all addresses that do not start with 'deny'
    // If this method is not set, all addresses are allowed
    onMailFrom: (address, session, callback) => {
        if (/^deny/i.test(address.address)) {
            return callback(new Error('Not accepted'));
        }
        callback();
    },

    // Validate RCPT TO envelope address. Example allows all addresses that do not start with 'deny'
    // If this method is not set, all addresses are allowed
    onRcptTo: (address, session, callback) => {
        let err;

        if (/^deny/i.test(address.address)) {
            return callback(new Error('Not accepted'));
        }

        // Reject messages larger than 100 bytes to an over-quota user
        if (/^full/i.test(address.address) && Number(session.envelope.mailFrom.args.SIZE) > 100) {
            err = new Error('Insufficient channel storage: ' + address.address);
            err.responseCode = 452;
            return callback(err);
        }

        callback();
    },

    // Handle message stream
    onData: (stream, session, callback) => {
        let hash = crypto.createHash('md5');
        stream.on('data', chunk => {
            hash.update(chunk);
        });
        stream.on('end', () => {
            let err;
            if (stream.sizeExceeded) {
                err = new Error('Error: message exceeds fixed maximum message size 10 MB');
                err.responseCode = 552;
                return callback(err);
            }
            received++;
            callback(null, 'Message queued as ' + hash.digest('hex')); // accept the message once the stream is ended
        });
    }
});

server.on('error', err => {
    log.error('Test SMTP', err.stack);
});

module.exports = callback => {
    if (config.testserver.enabled) {
        server.listen(config.testserver.port, config.testserver.host, () => {
            log.info('Test SMTP', 'Server listening on port %s', config.testserver.port);

            setInterval(() => {
                if (received) {
                    totalMessages += received;
                    log.verbose(
                        'Test SMTP',
                        'Received %s new message%s in last 60 sec. (total %s messages)',
                        humanize.numberFormat(received, 0), received === 1 ? '' : 's',
                        humanize.numberFormat(totalMessages, 0)
                    );
                    received = 0;
                }
            }, 60 * 1000);

            setImmediate(callback);
        });
    } else {
        setImmediate(callback);
    }
};
