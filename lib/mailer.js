'use strict';

let log = require('npmlog');

let nodemailer = require('nodemailer');
let openpgpEncrypt = require('nodemailer-openpgp').openpgpEncrypt;
let settings = require('./models/settings');
let tools = require('./tools');
let caches = require('./caches');
let Handlebars = require('handlebars');
let fs = require('fs');
let path = require('path');
let templates = new Map();
let htmlToText = require('html-to-text');

module.exports.transport = false;

module.exports.update = () => {
    createMailer(() => false);
};

module.exports.getMailer = callback => {
    if (!module.exports.transport) {
        return createMailer(callback);
    }
    callback(null, module.exports.transport);
};

module.exports.sendMail = (mail, template, callback) => {
    if (!callback && typeof template === 'function') {
        callback = template;
        template = false;
    }

    if (!module.exports.transport) {
        return createMailer(err => {
            if (err) {
                return callback(err);
            }
            return module.exports.sendMail(mail, template, callback);
        });
    }

    if (!mail.headers) {
        mail.headers = {};
    }
    mail.headers['X-Sending-Zone'] = 'transactional';

    getTemplate(template.html, (err, htmlRenderer) => {
        if (err) {
            return callback(err);
        }

        if (htmlRenderer) {
            mail.html = htmlRenderer(template.data || {});
        }

        tools.prepareHtml(mail.html, (err, prepareHtml) => {
            if (err) {
                // ignore
            }

            if (prepareHtml) {
                mail.html = prepareHtml;
            }

            getTemplate(template.text, (err, textRenderer) => {
                if (err) {
                    return callback(err);
                }

                if (textRenderer) {
                    mail.text = textRenderer(template.data || {});
                } else if (mail.html) {
                    mail.text = htmlToText.fromString(mail.html, {
                        wordwrap: 130
                    });
                }

                let tryCount = 0;
                let trySend = () => {
                    tryCount++;

                    module.exports.transport.sendMail(mail, (err, info) => {
                        if (err) {
                            log.error('Mail', err.stack);
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
                setImmediate(trySend);
            });
        });
    });

};

function getTemplate(template, callback) {
    if (!template) {
        return callback(null, false);
    }

    if (templates.has(template)) {
        return callback(null, templates.get(template));
    }

    fs.readFile(path.join(__dirname, '..', 'views', template), 'utf-8', (err, source) => {
        if (err) {
            return callback(err);
        }
        let renderer = Handlebars.compile(source);
        templates.set(template, renderer);
        return callback(null, renderer);
    });
}

function createMailer(callback) {
    settings.list(['smtpHostname', 'smtpPort', 'smtpEncryption', 'smtpUser', 'smtpPass', 'smtpLog', 'smtpDisableAuth', 'smtpMaxConnections', 'smtpMaxMessages', 'smtpSelfSigned', 'pgpPrivateKey', 'pgpPassphrase', 'smtpThrottling'], (err, configItems) => {
        if (err) {
            return callback(err);
        }

        let oldListeners = [];
        if (module.exports.transport) {
            oldListeners = module.exports.transport.listeners('idle');
            module.exports.transport.removeAllListeners('idle');
            module.exports.transport.removeAllListeners('stream');
            module.exports.transport.checkThrottling = null;
        }

        module.exports.transport = nodemailer.createTransport({
            pool: true,
            host: configItems.smtpHostname,
            port: Number(configItems.smtpPort) || false,
            secure: configItems.smtpEncryption === 'TLS',
            ignoreTLS: configItems.smtpEncryption === 'NONE',
            auth: configItems.smtpDisableAuth ? false : {
                user: configItems.smtpUser,
                pass: configItems.smtpPass
            },
            debug: !!configItems.smtpLog,
            logger: !configItems.smtpLog ? false : {
                debug: log.verbose.bind(log, 'Mail'),
                info: log.info.bind(log, 'Mail'),
                error: log.error.bind(log, 'Mail')
            },
            maxConnections: Number(configItems.smtpMaxConnections),
            maxMessages: Number(configItems.smtpMaxMessages),
            tls: {
                rejectUnauthorized: !configItems.smtpSelfSigned
            }
        });
        module.exports.transport.use('stream', openpgpEncrypt({
            signingKey: configItems.pgpPrivateKey,
            passphrase: configItems.pgpPassphrase
        }));

        if (oldListeners.length) {
            log.info('Mail', 'Reattaching %s idle listeners', oldListeners.length);
            oldListeners.forEach(listener => module.exports.transport.on('idle', listener));
        }

        let throttling = Number(configItems.smtpThrottling) || 0;
        if (throttling) {
            // convert to messages/second
            throttling = 1 / (throttling / (3600 * 1000));
        }
        let lastCheck = Date.now();
        module.exports.transport.checkThrottling = function (next) {
            if (!throttling) {
                return next();
            }
            let nextCheck = Date.now();
            let checkDiff = (nextCheck - lastCheck);
            lastCheck = nextCheck;
            if (checkDiff < throttling) {
                log.verbose('Mail', 'Throttling next message in %s sec.', (throttling - checkDiff) / 1000);
                setTimeout(next, throttling - checkDiff);
            } else {
                next();
            }
        };

        caches.cache.delete('sender queue');
        return callback(null, module.exports.transport);
    });
}

module.exports.getTemplate = getTemplate;
