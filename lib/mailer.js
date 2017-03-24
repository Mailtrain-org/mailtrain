'use strict';

let log = require('npmlog');
let config = require('config');
let nodemailer = require('nodemailer');
let openpgpEncrypt = require('nodemailer-openpgp').openpgpEncrypt;
let settings = require('./models/settings');
let tools = require('./tools');
let db = require('./db');
let Handlebars = require('handlebars');
let fs = require('fs');
let path = require('path');
let templates = new Map();
let htmlToText = require('html-to-text');
let aws = require('aws-sdk');
let objectHash = require('object-hash');
let mjml = require('mjml');

let _ = require('./translate')._;
let util = require('util');

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
                setImmediate(trySend);
            });
        });
    });

};

function getTemplate(template, callback) {
    if (!template) {
        return callback(null, false);
    }

    let key = (typeof template === 'object') ? objectHash(template) : template;

    if (templates.has(key)) {
        return callback(null, templates.get(key));
    }

    let done = (source, isMjml = false) => {
        if (isMjml) {
            let compiled;
            try {
                compiled = mjml.mjml2html(source);
            } catch (err) {
                return callback(err);
            }
            if (compiled.errors.length) {
                return callback(compiled.errors[0].message || compiled.errors[0]);
            }
            source = compiled.html;
        }
        let renderer = Handlebars.compile(source);
        templates.set(key, renderer);
        callback(null, renderer);
    };

    if (typeof template === 'object') {
        tools.mergeTemplateIntoLayout(template.template, template.layout, (err, source) => {
            if (err) {
                return callback(err);
            }
            let isMjml = template.type === 'mjml';
            done(source, isMjml);
        });
    } else {
        fs.readFile(path.join(__dirname, '..', 'views', template), 'utf-8', (err, source) => {
            if (err) {
                return callback(err);
            }
            done(source);
        });
    }
}

function createMailer(callback) {
    settings.list(['smtpHostname', 'smtpPort', 'smtpEncryption', 'smtpUser', 'smtpPass', 'smtpLog', 'smtpDisableAuth', 'smtpMaxConnections', 'smtpMaxMessages', 'smtpSelfSigned', 'pgpPrivateKey', 'pgpPassphrase', 'smtpThrottling', 'mailTransport', 'sesKey', 'sesSecret', 'sesRegion'], (err, configItems) => {
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

        let throttling = Number(configItems.smtpThrottling) || 0;
        if (throttling) {
            // convert to messages/second
            throttling = 1 / (throttling / (3600 * 1000));
        }

        let transportOptions;

        let logfunc = function () {
            let args = [].slice.call(arguments);
            let level = args.shift();
            args.shift();
            args.unshift('Mail');
            log[level](...args);
        };

        if (configItems.mailTransport === 'smtp' || !configItems.mailTransport) {
            transportOptions = {
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
                    debug: logfunc.bind(null, 'verbose'),
                    info: logfunc.bind(null, 'info'),
                    error: logfunc.bind(null, 'error')
                },
                maxConnections: Number(configItems.smtpMaxConnections),
                maxMessages: Number(configItems.smtpMaxMessages),
                tls: {
                    rejectUnauthorized: !configItems.smtpSelfSigned
                }
            };
        } else if (configItems.mailTransport === 'ses') {
            transportOptions = {
                SES: new aws.SES({
                    apiVersion: '2010-12-01',
                    accessKeyId: configItems.sesKey,
                    secretAccessKey: configItems.sesSecret,
                    region: configItems.sesRegion
                }),
                debug: !!configItems.smtpLog,
                logger: !configItems.smtpLog ? false : {
                    debug: logfunc.bind(null, 'verbose'),
                    info: logfunc.bind(null, 'info'),
                    error: logfunc.bind(null, 'error')
                },
                maxConnections: Number(configItems.smtpMaxConnections),
                sendingRate: throttling,
                tls: {
                    rejectUnauthorized: !configItems.smtpSelfSigned
                }
            };
        } else {
            return callback(new Error(_('Invalid mail transport')));
        }

        module.exports.transport = nodemailer.createTransport(transportOptions, config.nodemailer);

        module.exports.transport.use('stream', openpgpEncrypt({
            signingKey: configItems.pgpPrivateKey,
            passphrase: configItems.pgpPassphrase
        }));

        if (oldListeners.length) {
            log.info('Mail', 'Reattaching %s idle listeners', oldListeners.length);
            oldListeners.forEach(listener => module.exports.transport.on('idle', listener));
        }

        let lastCheck = Date.now();
        if (configItems.mailTransport === 'smtp' || !configItems.mailTransport) {
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
        } else {
            module.exports.transport.checkThrottling = next => next();
        }

        db.clearCache('sender', () => {
            callback(null, module.exports.transport);
        });
    });
}

module.exports.getTemplate = getTemplate;
