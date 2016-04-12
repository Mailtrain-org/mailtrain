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

            settings.list(['defaultHomepage', 'serviceUrl'], (err, configItems) => {
                if (err) {
                    return next(err);
                }

                res.render('subscription/subscribed', {
                    title: list.name,
                    layout: 'subscription/layout',
                    homepage: configItems.defaultHomepage || configItems.serviceUrl,
                    preferences: '/subscription/' + list.cid + '/manage/' + subscription.cid
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

            res.render('subscription/subscribe', data);
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

        subscriptions.addConfirmation(list.id, email, data, (err, confirmCid) => {
            if (!err && !confirmCid) {
                err = new Error('Could not store confirmation data');
            }
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
            }

            settings.list(['defaultHomepage', 'defaultFrom', 'defaultAddress', 'serviceUrl'], (err, configItems) => {
                if (err) {
                    return next(err);
                }

                res.redirect('/subscription/' + req.params.cid + '/confirm-notice');

                mailer.sendMail({
                    from: {
                        name: configItems.defaultFrom,
                        address: configItems.defaultAddress
                    },
                    to: {
                        name: [].concat(data.firstName || []).concat(data.lastName || []).join(' '),
                        address: email
                    },
                    subject: list.name + ': Please Confirm Subscription'
                }, {
                    html: 'emails/confirm-html.hbs',
                    text: 'emails/confirm-text.hbs',
                    data: {
                        title: list.name,
                        contactAddress: configItems.defaultAddress,
                        confirmUrl: urllib.resolve(configItems.serviceUrl, '/subscription/subscribe/' + confirmCid)
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

                res.render('subscription/manage', subscription);
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
            if (!err && !list) {
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

        subscriptions.unsubscribe(list.id, email, req.body.campaign, err => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/unsubscribe/' + encodeURIComponent(req.body.cid) + '?' + tools.queryParams(req.body));
            }
            res.redirect('/subscription/' + req.params.lcid + '/unsubscribe-notice');
        });
    });
});

module.exports = router;
