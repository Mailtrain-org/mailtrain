'use strict';

let config = require('config');
let passport = require('../lib/passport');
let express = require('express');
let router = new express.Router();
let tools = require('../lib/tools');
let nodemailer = require('nodemailer');
let mailer = require('../lib/mailer');
let url = require('url');

let settings = require('../lib/models/settings');

let allowedKeys = ['service_url', 'smtp_hostname', 'smtp_port', 'smtp_encryption', 'smtp_disable_auth', 'smtp_user', 'smtp_pass', 'admin_email', 'smtp_log', 'smtp_max_connections', 'smtp_max_messages', 'smtp_self_signed', 'default_from', 'default_address', 'default_subject', 'default_homepage', 'default_postaddress', 'default_sender', 'verp_hostname', 'verp_use', 'disable_wysiwyg', 'pgp_private_key', 'pgp_passphrase', 'ua_code', 'shoutout'];

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', 'Need to be logged in to access restricted content');
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('/settings');
    next();
});

router.get('/', passport.csrfProtection, (req, res, next) => {
    settings.list((err, configItems) => {
        if (err) {
            return next(err);
        }

        configItems.smtpEncryption = [{
            checked: configItems.smtpEncryption === 'TLS' || !configItems.smtpEncryption,
            key: 'TLS',
            value: 'Use TLS',
            description: 'usually selected for port 465'
        }, {
            checked: configItems.smtpEncryption === 'STARTTLS',
            key: 'STARTTLS',
            value: 'Use STARTTLS',
            description: 'usually selected for port 587 and 25'
        }, {
            checked: configItems.smtpEncryption === 'NONE',
            key: 'NONE',
            value: 'Do not use encryption'
        }];

        let urlparts = url.parse(configItems.serviceUrl);
        configItems.verpHostname = configItems.verpHostname || 'bounces.' + (urlparts.hostname || 'localhost');

        configItems.verpEnabled = config.verp.enabled;
        configItems.csrfToken = req.csrfToken();
        res.render('settings', configItems);
    });
});

router.post('/update', passport.parseForm, passport.csrfProtection, (req, res) => {

    let data = tools.convertKeys(req.body);

    let keys = [];
    let values = [];

    Object.keys(data).forEach(key => {
        let value = data[key].trim();
        key = tools.toDbKey(key);
        // ensure trailing slash for service home page
        if (key === 'service_url' && value && !/\/$/.test(value)) {
            value = value + '/';
        }
        if (allowedKeys.indexOf(key) >= 0) {
            keys.push(key);
            values.push(value);
        }
    });

    // checkboxs are not included in value listing if left unchecked
    ['smtp_log', 'smtp_self_signed', 'smtp_disable_auth', 'verp_use', 'disable_wysiwyg'].forEach(key => {
        if (keys.indexOf(key) < 0) {
            keys.push(key);
            values.push('');
        }
    });

    let i = 0;
    let storeSettings = () => {
        if (i >= keys.length) {
            mailer.update();
            req.flash('success', 'Settings updated');
            return res.redirect('/settings');
        }
        let key = keys[i];
        let value = values[i];
        i++;

        settings.set(key, value, err => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/settings');
            }
            storeSettings();
        });
    };

    storeSettings();
});

router.post('/smtp-verify', passport.parseForm, passport.csrfProtection, (req, res) => {
    settings.list((err, configItems) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/settings');
        }

        let transport = nodemailer.createTransport({
            host: configItems.smtpHostname,
            port: Number(configItems.smtpPort) || false,
            secure: configItems.smtpEncryption === 'TLS',
            ignoreTLS: configItems.smtpEncryption === 'NONE',
            auth: configItems.smtpDisableAuth ? false : {
                user: configItems.smtpUser,
                pass: configItems.smtpPass
            },
            tls: {
                rejectUnauthorized: !configItems.smtpSelfSigned
            }
        });

        transport.verify(err => {
            if (err) {
                let message = '';
                switch (err.code) {
                    case 'ECONNREFUSED':
                        message = 'Connection refused, check hostname and port.';
                        break;
                    case 'ETIMEDOUT':
                        if ((err.message || '').indexOf('Greeting never received') === 0) {
                            if (configItems.smtpEncryption !== 'TLS') {
                                message = 'Did not receive greeting message from server. This might happen when connecting to a TLS port without using TLS.';
                            } else {
                                message = 'Did not receive greeting message from server.';
                            }
                        } else {
                            message = 'Connection timed out. Check your firewall settings, destination port is probably blocked.';
                        }
                        break;
                    case 'EAUTH':
                        if (/\b5\.7\.0\b/.test(err.message) && configItems.smtpEncryption !== 'STARTTLS') {
                            message = 'Authentication not accepted, server expects STARTTLS to be used.';
                        } else {
                            message = 'Authentication failed, check username and password.';
                        }

                        break;
                }
                req.flash('warning', (message || 'Failed SMTP verification.') + (err.response ? ' Server responded with: "' + err.response + '"' : ''));
            } else {
                req.flash('info', 'SMTP settings verified, ready to send some mail!');
            }
            return res.redirect('/settings');
        });
    });
});

module.exports = router;
