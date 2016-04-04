'use strict';

let log = require('npmlog');
let config = require('config');
let crypto = require('crypto');

// Replace '../lib/smtp-server' with 'smtp-server' when running this script outside this directory
let SMTPServer = require('smtp-server').SMTPServer;

// Setup server
let server = new SMTPServer({

    // log to console
    logger: false,

    // not required but nice-to-have
    banner: 'Welcome to My Awesome SMTP Server',

    // disable STARTTLS to allow authentication in clear text mode
    disabledCommands: ['STARTTLS'],

    // By default only PLAIN and LOGIN are enabled
    authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],

    // Accept messages up to 10 MB
    size: 10 * 1024 * 1024,

    // Setup authentication
    // Allow only users with username 'testuser' and password 'testpass'
    onAuth: (auth, session, callback) => {
        let username = 'testuser';
        let password = 'testpass';

        // check username and password
        if (auth.username === username &&
            (
                auth.method === 'CRAM-MD5' ?
                auth.validatePassword(password) : // if cram-md5, validate challenge response
                auth.password === password // for other methods match plaintext passwords
            )
        ) {
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
            callback(null, 'Message queued as ' + hash.digest('hex')); // accept the message once the stream is ended
        });
    }
});

server.on('error', err => {
    log.error('TESTSERV', err.stack);
});

if (config.testserver.enabled) {
    server.listen(config.testserver.port, () => {
        log.info('TESTSERV', 'Server listening on port %s', config.testserver.port);
    });
}
