'use strict';

let log = require('npmlog');
let config = require('config');
let settings = require('../lib/models/settings');
let campaigns = require('../lib/models/campaigns');
let BounceHandler = require('bounce-handler').BounceHandler;
let SMTPServer = require('smtp-server').SMTPServer;

// Setup server
let server = new SMTPServer({

    // log to console
    logger: false,

    banner: 'Mailtrain VERP bouncer',

    disabledCommands: ['AUTH', 'STARTTLS'],

    onRcptTo: (address, session, callback) => {

        settings.list(['verpHostname'], (err, configItems) => {
            if (err) {
                err = new Error('Failed to load configuration');
                err.responseCode = 421;
                return callback(err);
            }

            let user = address.address.split('@').shift();
            let host = address.address.split('@').pop();

            if (host !== configItems.verpHostname || !/^[a-z0-9_\-]+\.[a-z0-9_\-]+\.[a-z0-9_\-]+$/i.test(user)) {
                err = new Error('Unknown user ' + address.address);
                err.responseCode = 510;
                return callback(err);
            }

            campaigns.findMailByCampaign(user, (err, message) => {
                if (err) {
                    err = new Error('Failed to load user data');
                    err.responseCode = 421;
                    return callback(err);
                }

                if (!message) {
                    err = new Error('Unknown user ' + address.address);
                    err.responseCode = 510;
                    return callback(err);
                }

                session.campaignId = user;
                session.message = message;

                log.verbose('VERP', 'Incoming message for Campaign %s, List %s, Subscription %s', message.campaign, message.list, message.subscription);

                callback();
            });
        });
    },

    // Handle message stream
    onData: (stream, session, callback) => {
        let chunks = [];
        let chunklen = 0;
        stream.on('data', chunk => {
            if (!chunk || !chunk.length || chunklen > 60 * 1024) {
                return;
            }
            chunks.push(chunk);
            chunklen += chunk.length;
        });
        stream.on('end', () => {

            let body = Buffer.concat(chunks, chunklen).toString();

            let bh = new BounceHandler();
            let bounceResult;

            try {
                bounceResult = [].concat(bh.parse_email(body) || []).shift();
            } catch (E) {
                log.error('Bounce', 'Failed parsing bounce message');
                log.error('Bounce', JSON.stringify(body));
            }

            if (!bounceResult || ['failed', 'transient'].indexOf(bounceResult.action) < 0) {
                return callback(null, 'Message accepted');
            } else {
                campaigns.updateMessage(session.message, 'bounced', bounceResult.action === 'failed', (err, updated) => {
                    if (err) {
                        log.error('VERP', 'Failed updating message: %s', err);
                    } else if (updated) {
                        log.verbose('VERP', 'Marked message %s as unsubscribed', session.campaignId);
                    }
                    callback(null, 'Message accepted');
                });
            }
        });
    }
});

server.on('error', err => {
    log.error('VERP', err);
    server.close();
});

module.exports = callback => {
    if (!config.verp.enabled) {
        return setImmediate(callback);
    }
    let hosts;
    if (typeof config.verp.host === 'string' && config.verp.host) {
        hosts = config.verp.host.trim().split(',').map(host => host.trim()).filter(host => host.trim());
        if (hosts.indexOf('*') >= 0 || hosts.indexOf('all') >= 0) {
            hosts = [false];
        }
    } else {
        hosts = [false];
    }

    let pos = 0;
    let startNextHost = () => {
        if (pos >= hosts.length) {
            return setImmediate(callback);
        }
        let host = hosts[pos++];
        server.listen(config.verp.port, host, () => {
            log.info('VERP', 'Server listening on %s:%s', host || '*', config.verp.port);
            setImmediate(startNextHost);
        });
    };

    startNextHost();
};
