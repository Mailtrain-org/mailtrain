'use strict';

const log = require('./log');
const config = require('config');

const Handlebars = require('handlebars');
const util = require('util');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const openpgpEncrypt = require('nodemailer-openpgp').openpgpEncrypt;
const sendConfigurations = require('../models/send-configurations');
const { ZoneMTAType, MailerType } = require('../../shared/send-configurations');
const builtinZoneMta = require('./builtin-zone-mta');

const contextHelpers = require('./context-helpers');
const settings = require('../models/settings');
const tools = require('./tools');
const htmlToText = require('html-to-text');

const bluebird = require('bluebird');

const transports = new Map();

async function getOrCreateMailer(sendConfigurationId) {
    let sendConfiguration;

    if (!sendConfigurationId) {
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



function _addDkimKeys(transport, mail) {
    const sendConfiguration = transport.mailer.sendConfiguration;

    if (sendConfiguration.mailer_type === MailerType.ZONE_MTA) {
        const mailerSettings = sendConfiguration.mailer_settings;

        if (mailerSettings.zoneMtaType === ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF || mailerSettings.zoneMtaType === ZoneMTAType.BUILTIN) {
            if (!mail.headers) {
                mail.headers = {};
            }

            const dkimDomain = mailerSettings.dkimDomain;
            const dkimSelector = (mailerSettings.dkimSelector || '').trim();
            const dkimPrivateKey = (mailerSettings.dkimPrivateKey || '').trim();

            if (dkimSelector && dkimPrivateKey) {
                const from = (mail.from.address || '').trim();
                const domain = from.split('@').pop().toLowerCase().trim();

                mail.headers['x-mailtrain-dkim'] = JSON.stringify({
                    domainName: dkimDomain || domain,
                    keySelector: dkimSelector,
                    privateKey: dkimPrivateKey
                });
            }
        }
    }
}


async function _sendMail(transport, mail, template) {
    _addDkimKeys(transport, mail);

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
    const sendConfiguration = transport.mailer.sendConfiguration;

    if (!mail.headers) {
        mail.headers = {};
    }
    mail.headers['X-Sending-Zone'] = 'transactional';

    mail.from = {
        name: sendConfiguration.from_name,
        address: sendConfiguration.from_email
    };

    const htmlRenderer = await tools.getTemplate(template.html, template.locale);

    if (htmlRenderer) {
        mail.html = htmlRenderer(template.data || {});
    }

    const preparedHtml = await tools.prepareHtml(mail.html);

    if (preparedHtml) {
        mail.html = preparedHtml;
    }

    const textRenderer = await tools.getTemplate(template.text, template.locale);

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

    if (mailerType === MailerType.GENERIC_SMTP || mailerType === MailerType.ZONE_MTA) {
        transportOptions = {
            pool: true,
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

        if (mailerType === MailerType.ZONE_MTA && mailerSettings.zoneMtaType === ZoneMTAType.BUILTIN) {
            transportOptions.host = config.builtinZoneMTA.host;
            transportOptions.port = config.builtinZoneMTA.port;
            transportOptions.secure = false;
            transportOptions.ignoreTLS = true;
            transportOptions.auth = {
                user: builtinZoneMta.getUsername(),
                pass: builtinZoneMta.getPassword()
            };
        } else {
            transportOptions.host = mailerSettings.hostname;
            transportOptions.port = mailerSettings.port || false;
            transportOptions.secure = mailerSettings.encryption === 'TLS';
            transportOptions.ignoreTLS = mailerSettings.encryption === 'NONE';
            transportOptions.auth = mailerSettings.useAuth ? {
                user: mailerSettings.user,
                pass: mailerSettings.password
            } : false;
        }

    } else if (mailerType === MailerType.AWS_SES) {
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

    if (mailerType === MailerType.GENERIC_SMTP || mailerType === MailerType.ZONE_MTA) {
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
        sendConfiguration,
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
