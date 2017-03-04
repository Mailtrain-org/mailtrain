'use strict';

let config = require('config');
let passport = require('../lib/passport');
let express = require('express');
let router = new express.Router();
let tools = require('../lib/tools');
let nodemailer = require('nodemailer');
let mailer = require('../lib/mailer');
let url = require('url');
let multer = require('multer');
let upload = multer();
let aws = require('aws-sdk');
let util = require('util');
let _ = require('../lib/translate')._;

let settings = require('../lib/models/settings');

let allowedKeys = ['service_url', 'smtp_hostname', 'smtp_port', 'smtp_encryption', 'smtp_disable_auth', 'smtp_user', 'smtp_pass', 'admin_email', 'smtp_log', 'smtp_max_connections', 'smtp_max_messages', 'smtp_self_signed', 'default_from', 'default_address', 'default_subject', 'default_homepage', 'default_postaddress', 'default_sender', 'verp_hostname', 'verp_use', 'disable_wysiwyg', 'pgp_private_key', 'pgp_passphrase', 'ua_code', 'shoutout', 'disable_confirmations', 'smtp_throttling', 'dkim_api_key', 'dkim_private_key', 'dkim_selector', 'dkim_domain', 'mail_transport', 'ses_key', 'ses_secret', 'ses_region'];

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
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
            value: _('Use TLS'),
            description: _('usually selected for port 465')
        }, {
            checked: configItems.smtpEncryption === 'STARTTLS',
            key: 'STARTTLS',
            value: _('Use STARTTLS'),
            description: _('usually selected for port 587 and 25')
        }, {
            checked: configItems.smtpEncryption === 'NONE',
            key: 'NONE',
            value: _('Do not use encryption')
        }];

        configItems.sesRegion = [{
            checked: configItems.sesRegion === 'us-east-1' || !configItems.sesRegion,
            key: 'us-east-1',
            value: 'US-EAST-1'
        }, {
            checked: configItems.sesRegion === 'us-west-2',
            key: 'us-west-2',
            value: 'US-WEST-2'
        }, {
            checked: configItems.sesRegion === 'eu-west-1',
            key: 'eu-west-1',
            value: 'EU-WEST-1'
        }];

        configItems.useSMTP = configItems.mailTransport === 'smtp' || !configItems.mailTransport;
        configItems.useSES = configItems.mailTransport === 'ses';

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
    ['smtp_log', 'smtp_self_signed', 'smtp_disable_auth', 'verp_use', 'disable_wysiwyg', 'disable_confirmations'].forEach(key => {
        if (keys.indexOf(key) < 0) {
            keys.push(key);
            values.push('');
        }
    });

    let i = 0;
    let storeSettings = () => {
        if (i >= keys.length) {
            mailer.update();
            tools.workers.forEach(worker => {
                worker.send({
                    reload: true
                });
            });
            req.flash('success', _('Settings updated'));
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

router.post('/smtp-verify', upload.array(), passport.parseForm, passport.csrfProtection, (req, res) => {

    let data = tools.convertKeys(req.body);

    // checkboxs are not included in value listing if left unchecked
    ['smtpLog', 'smtpSelfSigned', 'smtpDisableAuth'].forEach(key => {
        if (!data.hasOwnProperty(key)) {
            data[key] = false;
        } else {
            data[key] = true;
        }
    });

    let transportOptions;
    if (data.mailTransport === 'smtp') {
        transportOptions = {
            host: data.smtpHostname,
            port: Number(data.smtpPort) || false,
            secure: data.smtpEncryption === 'TLS',
            ignoreTLS: data.smtpEncryption === 'NONE',
            auth: data.smtpDisableAuth ? false : {
                user: data.smtpUser,
                pass: data.smtpPass
            },
            tls: {
                rejectUnauthorized: !data.smtpSelfSigned
            }
        };
    } else if (data.mailTransport === 'ses') {
        transportOptions = {
            SES: new aws.SES({
                apiVersion: '2010-12-01',
                accessKeyId: data.sesKey,
                secretAccessKey: data.sesSecret,
                region: data.sesRegion
            })
        };
    } else {
        return res.json({
            error: _('Invalid mail transport type')
        });
    }

    let transport = nodemailer.createTransport(transportOptions);

    transport.verify(err => {
        if (err) {
            let message = '';
            switch (err.code) {
                case 'InvalidClientTokenId':
                    message = _('Invalid Access Key');
                    break;
                case 'SignatureDoesNotMatch':
                    message = _('Invalid AWS credentials');
                    break;
                case 'ECONNREFUSED':
                    message = _('Connection refused, check hostname and port.');
                    break;
                case 'ETIMEDOUT':
                    if ((err.message || '').indexOf('Greeting never received') === 0) {
                        if (data.smtpEncryption !== 'TLS') {
                            message = _('Did not receive greeting message from server. This might happen when connecting to a TLS port without using TLS.');
                        } else {
                            message = _('Did not receive greeting message from server.');
                        }
                    } else {
                        message = _('Connection timed out. Check your firewall settings, destination port is probably blocked.');
                    }
                    break;
                case 'EAUTH':
                    if (/\b5\.7\.0\b/.test(err.message) && data.smtpEncryption !== 'STARTTLS') {
                        message = _('Authentication not accepted, server expects STARTTLS to be used.');
                    } else {
                        message = _('Authentication failed, check username and password.');
                    }

                    break;
            }
            if (!message && err.reason) {
                message = err.reason;
            }

            res.json({
                error: (message || _('Failed Mailer verification.')) + (err.response ? ' ' + util.format(_('Server responded with: "%s"'), err.response) : '')
            });
        } else {
            res.json({
                message: _('Mailer settings verified, ready to send some mail!')
            });
        }
    });

});

module.exports = router;
