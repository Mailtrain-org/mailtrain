'use strict';

let log = require('npmlog');
let config = require('config');
let tools = require('../lib/tools');
let helpers = require('../lib/helpers');
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
let _ = require('../lib/translate')._;
let util = require('util');
let cors = require('cors');
let cache = require('memory-cache');

let originWhitelist = config.cors && config.cors.origins || [];

let corsOptions = {
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'X-Requested-With'],
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200, // IE11 chokes on 204
    origin: (origin, callback) => {
        if (originWhitelist.includes(origin)) {
            callback(null, true);
        } else {
            let err = new Error(_('Not allowed by CORS'));
            err.status = 403;
            callback(err);
        }
    }
};

let corsOrCsrfProtection = (req, res, next) => {
    if (req.get('X-Requested-With') === 'XMLHttpRequest') {
        cors(corsOptions)(req, res, next);
    } else {
        passport.csrfProtection(req, res, next);
    }
};

router.get('/confirm/:cid', (req, res, next) => {
    subscriptions.processConfirmation(req.params.cid, req.ip, (err, subscription, action) => {
        if (!err && !subscription) {
            err = new Error(_('Selected subscription not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        lists.get(subscription.list, (err, list) => {
            if (!err && !list) {
                err = new Error(_('Selected list not found'));
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            // FIXME - differentiate email based on action

            const relativeUrls = {
                preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
                unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
            };

            subscriptions.sendMail(list, subscription.email, 'subscription-confirmed', _('%s: Subscription Confirmed'), relativeUrls, {}, subscription, (err) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    log.error('Subscription', err);
                    return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/unsubscribe/' + encodeURIComponent(req.body.cid) + '?' + tools.queryParams(req.body));
                }

                res.redirect('/subscription/' + list.cid + '/subscribed-notice');
            });

        });
    });
});

router.get('/:cid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err) {
            if (!list) {
                err = new Error(_('Selected list not found'));
                err.status = 404;
            } else if (!list.publicSubscribe) {
                err = new Error(_('The list does not allow public subscriptions.'));
                err.status = 403;
            }
        }

        if (err) {
            return next(err);
        }

        // FIXME: process subscriber cid param for resubscription requests

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

            settings.list(['pgpPrivateKey', 'defaultAddress', 'defaultPostaddress'], (err, configItems) => {
                if (err) {
                    return next(err);
                }
                data.hasPubkey = !!configItems.pgpPrivateKey;
                data.defaultAddress = configItems.defaultAddress;
                data.defaultPostaddress = configItems.defaultPostaddress;

                data.template = {
                    template: 'subscription/web-subscribe.mjml.hbs',
                    layout: 'subscription/layout.mjml.hbs'
                };

                helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-subscribe', data, (err, data) => {
                    if (err) {
                        return next(err);
                    }

                    helpers.getMjmlTemplate(data.template, (err, htmlRenderer) => {
                        if (err) {
                            return next(err);
                        }

                        helpers.captureFlashMessages(req, res, (err, flash) => {
                            if (err) {
                                return next(err);
                            }

                            data.isWeb = true;
                            data.needsJsWarning = true;
                            data.flashMessages = flash;
                            res.send(htmlRenderer(data));
                        });
                    });
                });
            });
        });
    });
});

router.options('/:cid/widget', cors(corsOptions));

router.get('/:cid/widget', cors(corsOptions), (req, res, next) => {
    let cached = cache.get(req.path);
    if (cached) {
        return res.status(200).json(cached);
    }

    let sendError = err => {
        res.status(err.status || 500);
        res.json({
            error: err.message || err
        });
    };

    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return sendError(err);
        }

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            settings.list(['serviceUrl', 'pgpPrivateKey'], (err, configItems) => {
                if (err) {
                    return sendError(err);
                }

                let data = {
                    title: list.name,
                    cid: list.cid,
                    serviceUrl: configItems.serviceUrl,
                    hasPubkey: !!configItems.pgpPrivateKey,
                    customFields: fields.getRow(fieldList),
                    template: {},
                    layout: null,
                };

                helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-subscribe', data, (err, data) => {
                    if (err) {
                        return sendError(err);
                    }

                    res.render('subscription/widget-subscribe', data, (err, html) => {
                        if (err) {
                            return sendError(err);
                        }

                        let response = {
                            data: {
                                title: data.title,
                                cid: data.cid,
                                html
                            }
                        };

                        cache.put(req.path, response, 30000); // ms
                        res.status(200).json(response);
                    });
                });
            });
        });
    });
});

router.options('/:cid/subscribe', cors(corsOptions));

router.post('/:cid/subscribe', passport.parseForm, corsOrCsrfProtection, (req, res, next) => {
    let sendJsonError = (err, status) => {
        res.status(status || err.status || 500);
        res.json({
            error: err.message || err
        });
    };

    let email = (req.body.email || '').toString().trim();

    if (!email) {
        if (req.xhr) {
            return sendJsonError(_('Email address not set'), 400);
        }
        req.flash('danger', _('Email address not set'));
        return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
    }

    tools.validateEmail(email, false, err => {
        if (err) {
            if (req.xhr) {
                return sendJsonError(err.message, 400);
            }
            req.flash('danger', err.message);
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
            if (!err) {
                if (!list) {
                    err = new Error(_('Selected list not found'));
                    err.status = 404;
                } else if (!list.publicSubscribe) {
                    err = new Error(_('The list does not allow public subscriptions.'));
                    err.status = 403;
                }
            }

            if (err) {
                return req.xhr ? sendJsonError(err) : next(err);
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
            data._action = 'subscribe';

            subscriptions.addConfirmation(list, email, req.ip, data, (err, confirmCid) => {
                if (!err && !confirmCid) {
                    err = new Error(_('Could not store confirmation data'));
                }

                if (err) {
                    if (req.xhr) {
                        return sendJsonError(err);
                    }
                    req.flash('danger', err.message || err);
                    return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
                }

                if (req.xhr) {
                    return res.status(200).json({
                        msg: _('Please Confirm Subscription')
                    });
                }
                res.redirect('/subscription/' + req.params.cid + '/confirm-subscription-notice');
            });
        });
    });
});

router.get('/:lcid/manage/:ucid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
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
                    err = new Error(_('Subscription not found from this list'));
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

                settings.list(['pgpPrivateKey', 'defaultAddress', 'defaultPostaddress'], (err, configItems) => {
                    if (err) {
                        return next(err);
                    }
                    subscription.hasPubkey = !!configItems.pgpPrivateKey;
                    subscription.defaultAddress = configItems.defaultAddress;
                    subscription.defaultPostaddress = configItems.defaultPostaddress;

                    subscription.template = {
                        template: 'subscription/web-manage.mjml.hbs',
                        layout: 'subscription/layout.mjml.hbs'
                    };

                    helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-manage', subscription, (err, data) => {
                        if (err) {
                            return next(err);
                        }

                        helpers.getMjmlTemplate(data.template, (err, htmlRenderer) => {
                            if (err) {
                                return next(err);
                            }

                            helpers.captureFlashMessages(req, res, (err, flash) => {
                                if (err) {
                                    return next(err);
                                }

                                data.isWeb = true;
                                data.needsJsWarning = true;
                                data.isManagePreferences = true;
                                data.flashMessages = flash;
                                res.send(htmlRenderer(data));
                            });
                        });
                    });
                });
            });
        });
    });
});

router.post('/:lcid/manage', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
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

router.get('/:lcid/manage-address/:ucid', passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultAddress', 'defaultPostaddress'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            subscriptions.get(list.id, req.params.ucid, (err, subscription) => {
                if (!err && !subscription) {
                    err = new Error(_('Subscription not found from this list'));
                    err.status = 404;
                }

                subscription.lcid = req.params.lcid;
                subscription.title = list.name;
                subscription.csrfToken = req.csrfToken();
                subscription.defaultAddress = configItems.defaultAddress;
                subscription.defaultPostaddress = configItems.defaultPostaddress;

                subscription.template = {
                    template: 'subscription/web-manage-address.mjml.hbs',
                    layout: 'subscription/layout.mjml.hbs'
                };

                helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-manage-address', subscription, (err, data) => {
                    if (err) {
                        return next(err);
                    }

                    helpers.getMjmlTemplate(data.template, (err, htmlRenderer) => {
                        if (err) {
                            return next(err);
                        }

                        helpers.captureFlashMessages(req, res, (err, flash) => {
                            if (err) {
                                return next(err);
                            }

                            data.isWeb = true;
                            data.needsJsWarning = true;
                            data.flashMessages = flash;
                            res.send(htmlRenderer(data));
                        });
                    });
                });
            });
        });
    });
});

router.post('/:lcid/manage-address', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        subscriptions.updateAddress(list, req.body.cid, req.body, req.ip, err => {
            if (err) {
                req.flash('danger', err.message || err);
                log.error('Subscription', err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/manage-address/' + encodeURIComponent(req.body.cid) + '?' + tools.queryParams(req.body));
            }

            req.flash('info', _('An email with further instructions has been sent to the provided address'));
            res.redirect('/subscription/' + req.params.lcid + '/manage/' + req.body.cid);
        });
    });
});

router.get('/:lcid/unsubscribe/:ucid', passport.csrfProtection, (req, res, next) => {
    // FIXME: handle different subscription options. The one below is currently "One-step with unsubscribe form"

    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultAddress', 'defaultPostaddress'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            subscriptions.get(list.id, req.params.ucid, (err, subscription) => {
                if (!err && !subscription) {
                    err = new Error(_('Subscription not found from this list'));
                    err.status = 404;
                }

                if (err) {
                    return next(err);
                }

                subscription.lcid = req.params.lcid;
                subscription.ucid = req.params.ucid;
                subscription.title = list.name;
                subscription.csrfToken = req.csrfToken();
                subscription.campaign = req.query.c;
                subscription.defaultAddress = configItems.defaultAddress;
                subscription.defaultPostaddress = configItems.defaultPostaddress;

                subscription.template = {
                    template: 'subscription/web-unsubscribe.mjml.hbs',
                    layout: 'subscription/layout.mjml.hbs'
                };

                helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-unsubscribe', subscription, (err, data) => {
                    if (err) {
                        return next(err);
                    }

                    helpers.getMjmlTemplate(data.template, (err, htmlRenderer) => {
                        if (err) {
                            return next(err);
                        }

                        helpers.captureFlashMessages(req, res, (err, flash) => {
                            if (err) {
                                return next(err);
                            }

                            data.isWeb = true;
                            data.flashMessages = flash;
                            res.send(htmlRenderer(data));
                        });
                    });
                });
            });
        });
    });
});

router.post('/:lcid/unsubscribe', passport.parseForm, passport.csrfProtection, (req, res, next) => {
    lists.getByCid(req.params.lcid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        subscriptions.unsubscribe(list.id, req.body.ucid, req.body.campaign, (err, subscription) => {
            if (err) {
                req.flash('danger', err.message || err);
                log.error('Subscription', err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/unsubscribe/' + encodeURIComponent(req.body.ucid) + '?' + tools.queryParams(req.body));
            }

            const relativeUrls = {
                subscribeUrl: '/subscription/' + list.cid + '?cid=' + subscription.cid
            };
            subscriptions.sendMail(list, subscription.email, 'unsubscription-confirmed', _('%s: Unsubscribe Confirmed'), relativeUrls, {}, subscription, (err) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    log.error('Subscription', err);
                    return res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/unsubscribe/' + encodeURIComponent(subscription.cid) + '?' + tools.queryParams(req.body));
                }

                res.redirect('/subscription/' + req.params.lcid + '/unsubscribed-notice');
            });
        });
    });
});

router.get('/:cid/confirm-subscription-notice', (req, res, next) => {
    notice('confirm-subscription', req, res, next);
});

router.get('/:cid/confirm-unsubscription-notice', (req, res, next) => {
    notice('confirm-unsubscription', req, res, next);
});

router.get('/:cid/subscribed-notice', (req, res, next) => {
    notice('subscribed', req, res, next);
});

router.get('/:cid/updated-notice', (req, res, next) => {
    notice('updated', req, res, next);
});

router.get('/:cid/unsubscribed-notice', (req, res, next) => {
    notice('unsubscribed', req, res, next);
});

router.post('/publickey', passport.parseForm, (req, res, next) => {
    settings.list(['pgpPassphrase', 'pgpPrivateKey'], (err, configItems) => {
        if (err) {
            return next(err);
        }
        if (!configItems.pgpPrivateKey) {
            err = new Error(_('Public key is not set'));
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
            err = new Error(_('Public key is not set'));
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


function notice(type, req, res, next) {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultHomepage', 'serviceUrl', 'defaultAddress', 'defaultPostaddress'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            let data = {
                title: list.name,
                homepage: configItems.defaultHomepage || configItems.serviceUrl,
                defaultAddress: configItems.defaultAddress,
                defaultPostaddress: configItems.defaultPostaddress,
                template: {
                    template: 'subscription/web-' + type + '-notice.mjml.hbs',
                    layout: 'subscription/layout.mjml.hbs'
                }
            };

            helpers.injectCustomFormData(req.query.fid || list.defaultForm, 'subscription/web-' + type + '-notice', data, (err, data) => {
                if (err) {
                    return next(err);
                }

                helpers.getMjmlTemplate(data.template, (err, htmlRenderer) => {
                    if (err) {
                        return next(err);
                    }

                    helpers.captureFlashMessages(req, res, (err, flash) => {
                        if (err) {
                            return next(err);
                        }

                        data.isWeb = true;
                        data.isConfirmNotice = true;
                        data.flashMessages = flash;
                        res.send(htmlRenderer(data));
                    });
                });
            });
        });
    });
}


module.exports = router;
