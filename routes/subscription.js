'use strict';

let log = require('npmlog');

let tools = require('../lib/tools');
let mailer = require('../lib/mailer');
let passport = require('../lib/passport');
let express = require('express');
let urllib = require('url');
let router = new express.Router();
let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let subscriptions = require('../lib/models/subscriptions');
let settings = require('../lib/models/settings');
let openpgp = require('openpgp');

router.get('/subscribe/:cid', (req, res, next) => {
    subscriptions.subscribe(req.params.cid, req.ip, (err, subscription) => {
        if (!err && !subscription) {
            err = new Error('Selected subscription not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        lists.get(subscription.list, (err, list) => {
            if (!err && !list) {
                err = new Error('Selected list not found');
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            settings.list(['defaultHomepage', 'serviceUrl', 'pgpPrivateKey', 'defaultAddress', 'defaultFrom', 'disableConfirmations'], (err, configItems) => {
                if (err) {
                    return next(err);
                }

                res.render('subscription/subscribed', {
                    title: list.name,
                    layout: 'subscription/layout',
                    homepage: configItems.defaultHomepage || configItems.serviceUrl,
                    preferences: '/subscription/' + list.cid + '/manage/' + subscription.cid,
                    hasPubkey: !!configItems.pgpPrivateKey
                });

                if (configItems.disableConfirmations) {
                    return;
                }

                fields.list(list.id, (err, fieldList) => {
                    if (err) {
                        return log.error('Fields', err);
                    }

                    let encryptionKeys = [];
                    fields.getRow(fieldList, subscription).forEach(field => {
                        if (field.type === 'gpg' && field.value) {
                            encryptionKeys.push(field.value.trim());
                        }
                    });

                    mailer.sendMail({
                        from: {
                            name: configItems.defaultFrom,
                            address: configItems.defaultAddress
                        },
                        to: {
                            name: [].concat(subscription.firstName || []).concat(subscription.lastName || []).join(' '),
                            address: subscription.email
                        },
                        subject: list.name + ': Subscription Confirmed',
                        encryptionKeys
                    }, {
                        html: 'emails/subscription-confirmed-html.hbs',
                        text: 'emails/subscription-confirmed-text.hbs',
                        data: {
                            title: list.name,
                            contactAddress: configItems.defaultAddress,
                            preferencesUrl: urllib.resolve(configItems.serviceUrl, '/subscription/' + list.cid + '/manage/' + subscription.cid),
                            unsubscribeUrl: urllib.resolve(configItems.serviceUrl, '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid)
                        }
                    }, err => {
                        if (err) {
                            log.error('Subscription', err.stack);
                        }
                    });
                });
            });
        });
    });
});

router.get('/:cid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        let data = tools.convertKeys(req.query, {
            skip: ['layout']
        });
        data.layout = 'subscription/layout';
        data.title = list.name;
        data.cid = list.cid;
        data.csrfToken = req.csrfToken();

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            data.customFields = fields.getRow(fieldList, data);
            data.useEditor = true;

            settings.list(['pgpPrivateKey'], (err, configItems) => {
                if (err) {
                    return next(err);
                }
                data.hasPubkey = !!configItems.pgpPrivateKey;
                res.render('subscription/subscribe', data);
            });
        });
    });
});

router.get('/:cid/confirm-notice', (req, res, next) => {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultHomepage', 'serviceUrl'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            res.render('subscription/confirm-notice', {
                title: list.name,
                layout: 'subscription/layout',
                homepage: configItems.defaultHomepage || configItems.serviceUrl
            });
        });
    });
});

router.get('/:cid/updated-notice', (req, res, next) => {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultHomepage', 'serviceUrl'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            res.render('subscription/updated-notice', {
                title: list.name,
                layout: 'subscription/layout',
                homepage: configItems.defaultHomepage || configItems.serviceUrl
            });
        });
    });
});

router.get('/:cid/unsubscribe-notice', (req, res, next) => {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultHomepage', 'serviceUrl'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            res.render('subscription/unsubscribe-notice', {
                title: list.name,
                layout: 'subscription/layout',
                homepage: configItems.defaultHomepage || configItems.serviceUrl
            });
        });
    });
});

router.post('/:cid/subscribe', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    let email = (req.body.email || '').toString().trim();

    if (!email) {
        req.flash('danger', 'Email address not set');
        return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
    }

    // Check if the subscriber seems legit. This is a really simple check, the only requirement is that
    // the subsciber has JavaScript turned on and thats it. If Mailtrain gets more targeted then this
    // simple check should be replaced with an actual captcha
    let subTime = Number(req.body.sub) || 0;
    // allow clock skew 24h in the past and 24h to the future
    let subTimeTest = !!(subTime > Date.now() - 24 * 3600 * 1000 && subTime < Date.now() + 24 * 3600 * 1000);
    let addressTest = !req.body.address;
    let testsPass = subTimeTest && addressTest;

    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        let data = {};
        Object.keys(req.body).forEach(key => {
            if (key !== 'email' && key.charAt(0) !== '_') {
                data[key] = (req.body[key] || '').toString().trim();
            }
        });

        data = tools.convertKeys(data);

        data._address = req.body.address;
        data._sub = req.body.sub;
        data._skip = !testsPass;

        subscriptions.addConfirmation(list, email, req.ip, data, (err, confirmCid) => {
            if (!err && !confirmCid) {
                err = new Error('Could not store confirmation data');
            }
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
            }

            res.redirect('/subscription/' + req.params.cid + '/confirm-notice');
        });
    });
});

router.get('/:lcid/manage/:ucid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        fields.list(list.id, (err, fieldList) => {
            if (err) {
                return next(err);
            }
            subscriptions.get(list.id, req.params.ucid, (err, subscription) => {
                if (!err && !subscription) {
                    err = new Error('Subscription not found from this list');
                    err.status = 404;
                }

                if (err) {
                    return next(err);
                }

                subscription.lcid = req.params.lcid;
                subscription.title = list.name;
                subscription.csrfToken = req.csrfToken();
                subscription.layout = 'subscription/layout';

                subscription.customFields = fields.getRow(fieldList, subscription);

                subscription.useEditor = true;

                settings.list(['pgpPrivateKey'], (err, configItems) => {
                    if (err) {
                        return next(err);
                    }
                    subscription.hasPubkey = !!configItems.pgpPrivateKey;

                    res.render('subscription/manage', subscription);
                });
            });
        });
    });
});

router.post('/:lcid/manage', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        subscriptions.update(list.id, req.body.cid, req.body, false, err => {
            if (err) {
                req.flash('danger', err.message || err);
                log.error('Subscription', err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/manage/' + encodeURIComponent(req.body.cid) + '?' + tools.queryParams(req.body));
            }
            res.redirect('/subscription/' + req.params.lcid + '/updated-notice');
        });
    });
});

router.get('/:lcid/unsubscribe/:ucid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        subscriptions.get(list.id, req.params.ucid, (err, subscription) => {
            if (!err && !subscription) {
                err = new Error('Subscription not found from this list');
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            subscription.lcid = req.params.lcid;
            subscription.title = list.name;
            subscription.csrfToken = req.csrfToken();
            subscription.layout = 'subscription/layout';
            subscription.autosubmit = !!req.query.auto;
            subscription.campaign = req.query.c;
            res.render('subscription/unsubscribe', subscription);
        });
    });
});

router.post('/:lcid/unsubscribe', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error('Selected list not found');
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        let email = req.body.email;

        subscriptions.unsubscribe(list.id, email, req.body.campaign, (err, subscription) => {
            if (err) {
                req.flash('danger', err.message || err);
                log.error('Subscription', err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/unsubscribe/' + encodeURIComponent(req.body.cid) + '?' + tools.queryParams(req.body));
            }
            res.redirect('/subscription/' + req.params.lcid + '/unsubscribe-notice');

            fields.list(list.id, (err, fieldList) => {
                if (err) {
                    return log.error('Fields', err);
                }

                let encryptionKeys = [];
                fields.getRow(fieldList, subscription).forEach(field => {
                    if (field.type === 'gpg' && field.value) {
                        encryptionKeys.push(field.value.trim());
                    }
                });

                settings.list(['defaultHomepage', 'defaultFrom', 'defaultAddress', 'serviceUrl', 'disableConfirmations'], (err, configItems) => {
                    if (err) {
                        return log.error('Settings', err);
                    }

                    if (configItems.disableConfirmations) {
                        return;
                    }

                    mailer.sendMail({
                        from: {
                            name: configItems.defaultFrom,
                            address: configItems.defaultAddress
                        },
                        to: {
                            name: [].concat(subscription.firstName || []).concat(subscription.lastName || []).join(' '),
                            address: subscription.email
                        },
                        subject: list.name + ': Subscription Confirmed',
                        encryptionKeys
                    }, {
                        html: 'emails/unsubscribe-confirmed-html.hbs',
                        text: 'emails/unsubscribe-confirmed-text.hbs',
                        data: {
                            title: list.name,
                            contactAddress: configItems.defaultAddress,
                            subscribeUrl: urllib.resolve(configItems.serviceUrl, '/subscription/' + list.cid + '?cid=' + subscription.cid)
                        }
                    }, err => {
                        if (err) {
                            log.error('Subscription', err.stack);
                        }
                    });
                });
            });
        });
    });
});

router.post('/publickey', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    settings.list(['pgpPassphrase', 'pgpPrivateKey'], (err, configItems) => {
        if (err) {
            return next(err);
        }
        if (!configItems.pgpPrivateKey) {
            err = new Error('Public key is not set');
            err.status = 404;
            return next(err);
        }

        let privKey;
        try {
            privKey = openpgp.key.readArmored(configItems.pgpPrivateKey).keys[0];
            if (configItems.pgpPassphrase && !privKey.decrypt(configItems.pgpPassphrase)) {
                privKey = false;
            }
        } catch (E) {
            // just ignore if failed
        }

        if (!privKey) {
            err = new Error('Public key is not set');
            err.status = 404;
            return next(err);
        }

        let pubkey = privKey.toPublic().armor();

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=public.asc'
        });

        res.end(pubkey);
    });
});

module.exports = router;
