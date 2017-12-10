'use strict';

let log = require('npmlog');
let config = require('config');
let tools = require('../lib/tools');
let helpers = require('../lib/helpers');
let passport = require('../lib/passport');
let express = require('express');
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
let geoip = require('geoip-ultralight');
let confirmations = require('../lib/models/confirmations');
let mailHelpers = require('../lib/subscription-mail-helpers');

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

function checkAndExecuteConfirmation(req, action, errorMsg, next, exec) {
    confirmations.takeConfirmation(req.params.cid, (err, confirmation) => {
        if (!err && (!confirmation || confirmation.action !== action)) {
            err = new Error(_(errorMsg));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        lists.get(confirmation.listId, (err, list) => {
            if (!err && !list) {
                err = new Error(_('Selected list not found'));
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            exec(confirmation, list);
        });
    });
}

router.get('/confirm/subscribe/:cid', (req, res, next) => {
    checkAndExecuteConfirmation(req, 'subscribe', 'Request invalid or already completed. If your subscription request is still pending, please subscribe again.', next, (confirmation, list) => {
        const data = confirmation.data;
        let optInCountry = geoip.lookupCountry(confirmation.ip) || null;

        const meta = {
            cid: req.params.cid,
            email: data.email,
            optInIp: confirmation.ip,
            optInCountry,
            status: subscriptions.Status.SUBSCRIBED
        };

        subscriptions.insert(list.id, meta, data.subscriptionData, (err, result) => {
            if (err) {
                return next(err);
            }

            if (!result.entryId) {
                return next(new Error(_('Could not save subscription')));
            }

            subscriptions.getById(list.id, result.entryId, (err, subscription) => {
                if (err) {
                    return next(err);
                }

                mailHelpers.sendSubscriptionConfirmed(list, data.email, subscription, err => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/subscription/' + list.cid + '/subscribed-notice');
                });
            });
        });
    });
});

router.get('/confirm/change-address/:cid', (req, res, next) => {
    checkAndExecuteConfirmation(req, 'change-address', 'Request invalid or already completed. If your address change request is still pending, please change the address again.', next, (confirmation, list) => {
        const data = confirmation.data;

        if (!data.subscriptionId) { // Something went terribly wrong and we don't have data that we have originally provided
            return next(new Error(_('Subscriber info corrupted or missing')));
        }

        subscriptions.updateAddress(list.id, data.subscriptionId, data.emailNew, err => {
            if (err) {
                return next(err);
            }

            subscriptions.getById(list.id, data.subscriptionId, (err, subscription) => {
                if (err) {
                    return next(err);
                }

                mailHelpers.sendSubscriptionConfirmed(list, data.emailNew, subscription, err => {
                    if (err) {
                        return next(err);
                    }

                    req.flash('info', _('Email address changed'));
                    res.redirect('/subscription/' + list.cid + '/manage/' + subscription.cid);
                });
            });
        });
    });
});

router.get('/confirm/unsubscribe/:cid', (req, res, next) => {
    checkAndExecuteConfirmation(req, 'unsubscribe', 'Request invalid or already completed. If your unsubscription request is still pending, please unsubscribe again.', next, (confirmation, list) => {
        const data = confirmation.data;

        subscriptions.changeStatus(list.id, confirmation.data.subscriptionId, confirmation.data.campaignId, subscriptions.Status.UNSUBSCRIBED, (err, found) => {
            if (err) {
                return next(err);
            }

            // TODO: Shall we do anything with "found"?

            subscriptions.getById(list.id, confirmation.data.subscriptionId, (err, subscription) => {
                if (err) {
                    return next(err);
                }

                mailHelpers.sendUnsubscriptionConfirmed(list, subscription.email, subscription, err => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/subscription/' + list.cid + '/unsubscribed-notice');
                });
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

        // TODO: process subscriber cid param for resubscription requests

        let data = tools.convertKeys(req.query, {
            skip: ['layout']
        });
        data.layout = 'subscription/layout';
        data.title = list.name;
        data.cid = list.cid;
        data.csrfToken = req.csrfToken();


        function nextStep() {
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
        }


        const ucid = req.query.cid;
        if (ucid) {
            subscriptions.get(list.id, ucid, (err, subscription) => {
                if (err) {
                    return next(err);
                }

                for (let key in subscription) {
                    if (!(key in data)) {
                        data[key] = subscription[key];
                    }
                }

                nextStep();
            });
        } else {
            nextStep();
        }
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
        // the subscriber has JavaScript turned on and thats it. If Mailtrain gets more targeted then this
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

            let subscriptionData = {};
            Object.keys(req.body).forEach(key => {
                if (key !== 'email' && key.charAt(0) !== '_') {
                    subscriptionData[key] = (req.body[key] || '').toString().trim();
                }
            });
            subscriptionData = tools.convertKeys(subscriptionData);

            subscriptions.getByEmail(list.id, email, (err, subscription) => {
                if (err) {
                    return req.xhr ? sendJsonError(err) : next(err);
                }

                if (subscription && subscription.status === subscriptions.Status.SUBSCRIBED) {
                    mailHelpers.sendAlreadySubscribed(list, email, subscription, (err) => {
                        if (err) {
                            return req.xhr ? sendJsonError(err) : next(err);
                        }
                        res.redirect('/subscription/' + req.params.cid + '/confirm-subscription-notice');
                    });
                } else {
                    const data = {
                        email,
                        subscriptionData
                    };

                    confirmations.addConfirmation(list.id, 'subscribe', req.ip, data, (err, confirmCid) => {
                        if (err) {
                            if (req.xhr) {
                                return sendJsonError(err);
                            }
                            req.flash('danger', err.message || err);
                            return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
                        }

                        function sendWebResponse() {
                            if (req.xhr) {
                                return res.status(200).json({
                                    msg: _('Please Confirm Subscription')
                                });
                            }
                            res.redirect('/subscription/' + req.params.cid + '/confirm-subscription-notice');
                        }

                        if (!testsPass) {
                            log.info('Subscription', 'Confirmation message for %s marked to be skipped (%s)', email, JSON.stringify(data));
                            sendWebResponse();
                        } else {
                            mailHelpers.sendConfirmSubscription(list, email, confirmCid, subscriptionData, (err) => {
                                if (err) {
                                    return req.xhr ? sendJsonError(err) : sendWebResponse(err);
                                }
                                sendWebResponse();
                            })
                        }
                    });
                }
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
                if (!err && (!subscription || subscription.status !== subscriptions.Status.SUBSCRIBED)) {
                    err = new Error(_('Subscription not found in this list'));
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

        subscriptions.get(list.id, req.body.cid, (err, subscription) => {
            if (!err && (!subscription || subscription.status !== subscriptions.Status.SUBSCRIBED)) {
                err = new Error(_('Subscription not found in this list'));
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            subscriptions.update(list.id, subscription.cid, req.body, false, err => {
                if (err) {
                    return next(err);
                }
                res.redirect('/subscription/' + req.params.lcid + '/updated-notice');
            });
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
                if (!err && (!subscription || subscription.status !== subscriptions.Status.SUBSCRIBED)) {
                    err = new Error(_('Subscription not found in this list'));
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

        let bodyData = tools.convertKeys(req.body); // This is here to convert "email-new" to "emailNew"
        const emailOld = (bodyData.email || '').toString().trim();
        const emailNew = (bodyData.emailNew || '').toString().trim();

        if (emailOld === emailNew) {
            req.flash('info', _('Nothing seems to be changed'));
            res.redirect('/subscription/' + req.params.lcid + '/manage/' + req.body.cid);

        } else {
            subscriptions.updateAddressCheck(list, req.body.cid, emailNew, req.ip, (err, subscription, newEmailAvailable) => {
                if (err) {
                    return next(err);
                }

                function sendWebResponse(err) {
                    if (err) {
                        return next(err);
                    }

                    req.flash('info', _('An email with further instructions has been sent to the provided address'));
                    res.redirect('/subscription/' + req.params.lcid + '/manage/' + req.body.cid);
                }

                if (newEmailAvailable) {
                    const data = {
                        subscriptionId: subscription.id,
                        emailNew
                    };

                    confirmations.addConfirmation(list.id, 'change-address', req.ip, data, (err, confirmCid) => {
                        if (err) {
                            return next(err);
                        }

                        mailHelpers.sendConfirmAddressChange(list, emailNew, confirmCid, subscription, sendWebResponse);
                    });

                } else {
                    mailHelpers.sendAlreadySubscribed(list, emailNew, subscription, sendWebResponse);
                }
            });
        }
    });
});

router.get('/:lcid/unsubscribe/:ucid', passport.csrfProtection, (req, res, next) => {
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
                if (!err && (!subscription || subscription.status !== subscriptions.Status.SUBSCRIBED)) {
                    err = new Error(_('Subscription not found in this list'));
                    err.status = 404;
                }

                if (err) {
                    return next(err);
                }


                const autoUnsubscribe = req.query.auto === 'yes';

                if (autoUnsubscribe) {
                    handleUnsubscribe(list, subscription, autoUnsubscribe, req.query.c, req.ip, res, next);

                } else if (req.query.formTest ||
                    list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP_WITH_FORM ||
                    list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM) {

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
                } else { // UnsubscriptionMode.ONE_STEP || UnsubscriptionMode.TWO_STEP || UnsubscriptionMode.MANUAL
                    handleUnsubscribe(list, subscription, autoUnsubscribe, req.query.c, req.ip, res, next);
                }
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

        const campaignId = (req.body.campaign || '').toString().trim() || false;

        subscriptions.get(list.id, req.body.ucid, (err, subscription) => {
            if (!err && (!subscription || subscription.status !== subscriptions.Status.SUBSCRIBED)) {
                err = new Error(_('Subscription not found in this list'));
                err.status = 404;
            }

            if (err) {
                return next(err);
            }

            handleUnsubscribe(list, subscription, false, campaignId, req.ip, res, next);
        });
    });
});

function handleUnsubscribe(list, subscription, autoUnsubscribe, campaignId, ip, res, next) {
    if ((list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP_WITH_FORM) ||
        (autoUnsubscribe && (list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM)) ) {

        subscriptions.changeStatus(list.id, subscription.id, campaignId, subscriptions.Status.UNSUBSCRIBED, (err, found) => {
            if (err) {
                return next(err);
            }

            // TODO: Shall we do anything with "found"?

            mailHelpers.sendUnsubscriptionConfirmed(list, subscription.email, subscription, err => {
                if (err) {
                    return next(err);
                }

                res.redirect('/subscription/' + list.cid + '/unsubscribed-notice');
            });
        });

    } else if (list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM) {

        const data = {
            subscriptionId: subscription.id,
            campaignId
        };

        confirmations.addConfirmation(list.id, 'unsubscribe', ip, data, (err, confirmCid) => {
            if (err) {
                return next(err);
            }

            mailHelpers.sendConfirmUnsubscription(list, subscription.email, confirmCid, subscription, err => {
                if (err) {
                    return next(err);
                }

                res.redirect('/subscription/' + list.cid + '/confirm-unsubscription-notice');
            });
        });

    } else { // UnsubscriptionMode.MANUAL
        res.redirect('/subscription/' + list.cid + '/manual-unsubscribe-notice');
    }
}

router.get('/:cid/confirm-subscription-notice', (req, res, next) => {
    webNotice('confirm-subscription', req, res, next);
});

router.get('/:cid/confirm-unsubscription-notice', (req, res, next) => {
    webNotice('confirm-unsubscription', req, res, next);
});

router.get('/:cid/subscribed-notice', (req, res, next) => {
    webNotice('subscribed', req, res, next);
});

router.get('/:cid/updated-notice', (req, res, next) => {
    webNotice('updated', req, res, next);
});

router.get('/:cid/unsubscribed-notice', (req, res, next) => {
    webNotice('unsubscribed', req, res, next);
});

router.get('/:cid/manual-unsubscribe-notice', (req, res, next) => {
    webNotice('manual-unsubscribe', req, res, next);
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


function webNotice(type, req, res, next) {
    lists.getByCid(req.params.cid, (err, list) => {
        if (!err && !list) {
            err = new Error(_('Selected list not found'));
            err.status = 404;
        }

        if (err) {
            return next(err);
        }

        settings.list(['defaultHomepage', 'serviceUrl', 'defaultAddress', 'defaultPostaddress', 'adminEmail'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            let data = {
                title: list.name,
                homepage: configItems.defaultHomepage || configItems.serviceUrl,
                defaultAddress: configItems.defaultAddress,
                defaultPostaddress: configItems.defaultPostaddress,
                contactAddress: configItems.defaultAddress,
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
