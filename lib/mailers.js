'use strict';

const log = require('./log');
const config = require('config');

const Handlebars = require('handlebars');
const util = require('util');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const openpgpEncrypt = require('nodemailer-openpgp').openpgpEncrypt;
const sendConfigurations = require('../models/send-configurations');

const contextHelpers = require('./context-helpers');
const settings = require('../models/settings');
const tools = require('./tools');
const htmlToText = require('html-to-text');

const bluebird = require('bluebird');

const _ = require('./translate')._;

Handlebars.registerHelper('translate', function (context, options) { // eslint-disable-line prefer-arrow-callback
    if (typeof options === 'undefined' && context) {
        options = context;
        context = false;
    }

    let result = _(options.fn(this)); // eslint-disable-line no-invalid-this

    if (Array.isArray(context)) {
        result = util.format(result, ...context);
    }
    return new Handlebars.SafeString(result);
});

const transports = new Map();

async function getOrCreateMailer(sendConfigurationId) {
    let sendConfiguration;

    if (!sendConfiguration) {
        sendConfiguration = await sendConfigurations.getSystemSendConfiguration();
    } else {
        sendConfiguration = await sendConfigurations.getById(contextHelpers.getAdminContext(), sendConfigurationId, false, true);
    }

    const transport = transports.get(sendConfiguration.id) || await _createTransport(sendConfiguration);
    return transport.mailer;
}

function invalidateMailer(sendConfigurationId) {
    transports.delete(sendConfigurationId);
}




async function _sendMail(transport, mail, template) {
    let tryCount = 0;
    const trySend = (callback) => {
        tryCount++;
        transport.sendMail(mail, (err, info) => {
            if (err) {
                log.error('Mail', err);
                if (err.responseCode && err.responseCode >= 400 && err.responseCode < 500 && tryCount <= 5) {
                    // temporary error, try again
                    log.verbose('Mail', 'Retrying after %s sec. ...', tryCount);
                    return setTimeout(trySend, tryCount * 1000);
                }
                return callback(err);
            }
            return callback(null, info);
        });
    };

    const trySendAsync = bluebird.promisify(trySend);
    return await trySendAsync();
}

async function _sendTransactionalMail(transport, mail, template) {
    if (!mail.headers) {
        mail.headers = {};
    }
    mail.headers['X-Sending-Zone'] = 'transactional';

    const htmlRenderer = await tools.getTemplate(template.html);

    if (htmlRenderer) {
        mail.html = htmlRenderer(template.data || {});
    }

    const preparedHtml = await tools.prepareHtml(mail.html);

    if (preparedHtml) {
        mail.html = preparedHtml;
    }

    const textRenderer = await tools.getTemplate(template.text);

    if (textRenderer) {
        mail.text = textRenderer(template.data || {});
    } else if (mail.html) {
        mail.text = htmlToText.fromString(mail.html, {
            wordwrap: 130
        });
    }

    return await _sendMail(transport, mail);
}

async function _createTransport(sendConfiguration) {
    const mailerSettings = sendConfiguration.mailer_settings;
    const mailerType = sendConfiguration.mailer_type;
    const configItems = await settings.get(contextHelpers.getAdminContext(), ['pgpPrivateKey', 'pgpPassphrase']);

    const existingTransport = transports.get(sendConfiguration.id);

    let existingListeners = [];
    if (existingTransport) {
        existingListeners = existingTransport.listeners('idle');
        existingTransport.removeAllListeners('idle');
        existingTransport.removeAllListeners('stream');
        existingTransport.throttleWait = null;
    }

    const logFunc = (...args) => {
        const level = args.shift();
        args.shift();
        args.unshift('Mail');
        log[level](...args);
    };


    let transportOptions;

    if (mailerType === sendConfigurations.MailerType.GENERIC_SMTP || mailerType === sendConfigurations.MailerType.ZONE_MTA) {
        transportOptions = {
            pool: true,
            host: mailerSettings.hostname,
            port: mailerSettings.port || false,
            secure: mailerSettings.encryption === 'TLS',
            ignoreTLS: mailerSettings.encryption === 'NONE',
            auth: mailerSettings.useAuth ? {
                user: mailerSettings.user,
                pass: mailerSettings.password
            } : false,
            debug: mailerSettings.logTransactions,
            logger: mailerSettings.logTransactions ? {
                debug: logFunc.bind(null, 'verbose'),
                info: logFunc.bind(null, 'info'),
                error: logFunc.bind(null, 'error')
            } : false,
            maxConnections: mailerSettings.maxConnections,
            maxMessages: mailerSettings.maxMessages,
            tls: {
                rejectUnauthorized: !mailerSettings.allowSelfSigned
            }
        };

    } else if (mailerType === sendConfigurations.MailerType.AWS_SES) {
        const sendingRate = mailerSettings.throttling / 3600;  // convert to messages/second

        transportOptions = {
            SES: new aws.SES({
                apiVersion: '2010-12-01',
                accessKeyId: mailerSettings.key,
                secretAccessKey: mailerSettings.secret,
                region: mailerSettings.region
            }),
            debug: mailerSettings.logTransactions,
            logger: mailerSettings.logTransactions ? {
                debug: logFunc.bind(null, 'verbose'),
                info: logFunc.bind(null, 'info'),
                error: logFunc.bind(null, 'error')
            } : false,
            maxConnections: mailerSettings.maxConnections,
            sendingRate
        };

    } else {
        throw new Error('Invalid mail transport');
    }

    const transport = nodemailer.createTransport(transportOptions, config.nodemailer);

    transport.use('stream', openpgpEncrypt({
        signingKey: configItems.pgpPrivateKey,
        passphrase: configItems.pgpPassphrase
    }));

    if (existingListeners.length) {
        log.info('Mail', 'Reattaching %s idle listeners', existingListeners.length);
        existingListeners.forEach(listener => transport.on('idle', listener));
    }

    let throttleWait;

    if (mailerType === sendConfigurations.MailerType.GENERIC_SMTP || mailerType === sendConfigurations.MailerType.ZONE_MTA) {
        let throttling = mailerSettings.throttling;
        if (throttling) {
            throttling = 1 / (throttling / (3600 * 1000));
        }

        let lastCheck = Date.now();

        throttleWait = function (next) {
            if (!throttling) {
                return next();
            }
            let nextCheck = Date.now();
            let checkDiff = (nextCheck - lastCheck);
            if (checkDiff < throttling) {
                log.verbose('Mail', 'Throttling next message in %s sec.', (throttling - checkDiff) / 1000);
                setTimeout(() => {
                    lastCheck = Date.now();
                    next();
                }, throttling - checkDiff);
            } else {
                lastCheck = nextCheck;
                next();
            }
        };
    } else {
        throttleWait = next => next();
    }

    transport.mailer = {
        throttleWait: bluebird.promisify(throttleWait),
        sendTransactionalMail: async (mail, template) => await _sendTransactionalMail(transport, mail, template),
        sendMassMail: async (mail, template) => await _sendMail(transport, mail)
    };

    transports.set(sendConfiguration.id, transport);
    return transport;
}

class MailerError extends Error {
    constructor(msg, responseCode) {
        super(msg);
        this.responseCode = responseCode;
    }
}

module.exports.getOrCreateMailer = getOrCreateMailer;
module.exports.invalidateMailer = invalidateMailer;
module.exports.MailerError = MailerError;
