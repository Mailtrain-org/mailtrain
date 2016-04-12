'use strict';

let log = require('npmlog');

let nodemailer = require('nodemailer');
let settings = require('./models/settings');
let Handlebars = require('handlebars');
let fs = require('fs');
let path = require('path');
let templates = new Map();

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

    getTemplate(template.html, (err, htmlRenderer) => {
        if (err) {
            return callback(err);
        }

        if (htmlRenderer) {
            mail.html = htmlRenderer(template.data || {});
        }

        getTemplate(template.text, (err, textRenderer) => {
            if (err) {
                return callback(err);
            }

            if (textRenderer) {
                mail.text = textRenderer(template.data || {});
            }

            module.exports.transport.sendMail(mail, callback);
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
    settings.list(['smtpHostname', 'smtpPort', 'smtpEncryption', 'smtpUser', 'smtpPass', 'smtpLog', 'smtpDisableAuth', 'smtpMaxConnections', 'smtpMaxMessages', 'smtpSelfSigned'], (err, configItems) => {
        if (err) {
            return callback(err);
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
                debug: log.info.bind(log, 'Mail'),
                info: log.verbose.bind(log, 'Mail'),
                error: log.info.bind(log, 'Mail')
            },
            maxConnections: Number(configItems.smtpMaxConnections),
            maxMessages: Number(configItems.smtpMaxMessages),
            tls: {
                rejectUnauthorized: !configItems.smtpSelfSigned
            }
        });

        return callback(null, module.exports.transport);
    });
}

module.exports.getTemplate = getTemplate;
