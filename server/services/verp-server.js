'use strict';

const { nodeifyFunction, nodeifyPromise } = require('../lib/nodeify');
const log = require('../lib/log');
const config = require('../lib/config');
const {MailerError} = require('../lib/mailers');
const campaigns = require('../models/campaigns');
const contextHelpers = require('../lib/context-helpers');
const {CampaignMessageStatus} = require('../../shared/campaigns');
const bluebird = require('bluebird');

const BounceHandler = require('bounce-handler').BounceHandler;
const SMTPServer = require('smtp-server').SMTPServer;

async function onRcptTo(address, session) {
    const addrSplit = address.address.split('@');

    if (addrSplit.length !== 2) {
        throw new MailerError('Unknown user ' + address.address, 510);
    }

    const [user, host] = addrSplit;

    const message = await campaigns.getMessageByCid(user, true);

    if (!message) {
        throw new MailerError('Unknown user ' + address.address, 510);
    }

    if (message.verp_hostname !== host) {
        throw new MailerError('Unknown user ' + address.address, 510);
    }

    session.message = message;

    log.verbose('VERP', 'Incoming message for campaign:%s, list:%s, subscription:%s', message.campaign, message.list, message.subscription);
}

function onData(stream, session, callback) {
    let chunks = [];
    let totalLen = 0;

    const onStreamEnd = async () => {
        const body = Buffer.concat(chunks, totalLen).toString();

        const bh = new BounceHandler();
        let bounceResult;

        try {
            bounceResult = [].concat(bh.parse_email(body) || []).shift();
        } catch (err) {
            log.error('Bounce', 'Failed parsing bounce message');
            log.error('Bounce', JSON.stringify(body));
        }

        if (!bounceResult || ['failed', 'transient'].indexOf(bounceResult.action) < 0) {
            return 'Message accepted';
        } else {
            await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), session.message, CampaignMessageStatus.BOUNCED, bounceResult.action === 'failed');
            log.verbose('VERP', 'Marked message (campaign:%s, list:%s, subscription:%s) as unsubscribed', session.message.campaign, session.message.list, session.message.subscription);
        }
    };

    stream.on('data', chunk => {
        if (!chunk || !chunk.length || totalLen > 60 * 1024) {
            return;
        }
        chunks.push(chunk);
        totalLen += chunk.length;
    });

    stream.on('end', () => nodeifyPromise(onStreamEnd(), callback));
}

// Setup server
const server = new SMTPServer({

    // log to console
    logger: false,

    banner: 'Mailtrain VERP bouncer',

    disabledCommands: ['AUTH', 'STARTTLS'],

    onRcptTo: nodeifyFunction(onRcptTo),
    onData: onData
});

function start(callback) {
    if (!config.verp.enabled) {
        return setImmediate(callback);
    }

    let started = false;

    server.on('error', err => {
        const port = config.verp.port;
        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        switch (err.code) {
            case 'EACCES':
                log.error('VERP', '%s requires elevated privileges', bind);
                break;
            case 'EADDRINUSE':
                log.error('VERP', '%s is already in use', bind);
                break;
            case 'ECONNRESET': // Usually happens when a client does not disconnect cleanly
            case 'EPIPE': // Remote connection was closed before the server attempted to send data
            default:
                log.error('VERP', err);
        }

        if (!started) {
            started = true;
            return callback(err);
        }
    });

    let hosts;
    if (typeof config.verp.host === 'string' && config.verp.host) {
        hosts = config.verp.host.trim().split(',').map(host => host.trim()).filter(host => !!host);
        if (hosts.indexOf('*') >= 0 || hosts.indexOf('all') >= 0) {
            hosts = [false];
        }
    } else {
        hosts = [false];
    }

    let pos = 0;
    const startNextHost = () => {
        if (pos >= hosts.length) {
            started = true;
            return setImmediate(callback);
        }
        const host = hosts[pos++];
        server.listen(config.verp.port, host, () => {
            if (started) {
                return server.close();
            }
            log.info('VERP', 'Server listening on %s:%s', host || '*', config.verp.port);
            setImmediate(startNextHost);
        });
    };

    startNextHost();
}

module.exports.start = bluebird.promisify(start);
