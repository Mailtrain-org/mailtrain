'use strict';

let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let blacklist = require('../models/blacklist');
let subscriptions = require('../lib/models/subscriptions');
let confirmations = require('../lib/models/confirmations');
let tools = require('../lib/tools');
let log = require('npmlog');
const router = require('../lib/router-async').create();
let mailHelpers = require('../lib/subscription-mail-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

router.post('/subscribe/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            log.error('API', err);
            res.status(500);
            return res.json({
                error: err.message || err,
                data: []
            });
        }
        if (!list) {
            res.status(404);
            return res.json({
                error: 'Selected listId not found',
                data: []
            });
        }
        if (!input.EMAIL) {
            res.status(400);
            return res.json({
                error: 'Missing EMAIL',
                data: []
            });
        }
        tools.validateEmail(input.EMAIL, false, err => {
            if (err) {
                log.error('API', err);
                res.status(400);
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }

            let subscription = {
                email: input.EMAIL
            };

            if (input.FIRST_NAME) {
                subscription.first_name = (input.FIRST_NAME || '').toString().trim();
            }

            if (input.LAST_NAME) {
                subscription.last_name = (input.LAST_NAME || '').toString().trim();
            }

            if (input.TIMEZONE) {
                subscription.tz = (input.TIMEZONE || '').toString().trim();
            }

            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                fieldList.forEach(field => {
                    if (input.hasOwnProperty(field.key) && field.column) {
                        subscription[field.column] = input[field.key];
                    } else if (field.options) {
                        for (let i = 0, len = field.options.length; i < len; i++) {
                            if (input.hasOwnProperty(field.options[i].key) && field.options[i].column) {
                                let value = input[field.options[i].key];
                                if (field.options[i].type === 'option') {
                                    value = ['false', 'no', '0', ''].indexOf((value || '').toString().trim().toLowerCase()) >= 0 ? '' : '1';
                                }
                                subscription[field.options[i].column] = value;
                            }
                        }
                    }
                });

                let meta = {
                    partial: true
                };

                if (/^(yes|true|1)$/i.test(input.FORCE_SUBSCRIBE)) {
                    meta.status = 1;
                }

                if (/^(yes|true|1)$/i.test(input.REQUIRE_CONFIRMATION)) {
                    const data = {
                        email: subscription.email,
                        subscriptionData: subscription
                    };

                    confirmations.addConfirmation(list.id, 'subscribe', req.ip, data, (err, confirmCid) => {
                        if (err) {
                            log.error('API', err);
                            res.status(500);
                            return res.json({
                                error: err.message || err,
                                data: []
                            });
                        }

                        mailHelpers.sendConfirmSubscription(list, input.EMAIL, confirmCid, subscription, (err) => {
                            if (err) {
                                log.error('API', err);
                                res.status(500);
                                return res.json({
                                    error: err.message || err,
                                    data: []
                                });
                            }

                            res.status(200);
                            res.json({
                                data: {
                                    id: confirmCid
                                }
                            });
                        });
                    });
                } else {
                    subscriptions.insert(list.id, meta, subscription, (err, response) => {
                        if (err) {
                            log.error('API', err);
                            res.status(500);
                            return res.json({
                                error: err.message || err,
                                data: []
                            });
                        }
                        res.status(200);
                        res.json({
                            data: {
                                id: response.cid
                            }
                        });
                    });
                }
            });
        });
    });
});

router.post('/unsubscribe/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            res.status(500);
            return res.json({
                error: err.message || err,
                data: []
            });
        }
        if (!list) {
            res.status(404);
            return res.json({
                error: 'Selected listId not found',
                data: []
            });
        }
        if (!input.EMAIL) {
            res.status(400);
            return res.json({
                error: 'Missing EMAIL',
                data: []
            });
        }

        subscriptions.getByEmail(list.id, input.EMAIL, (err, subscription) => {
            if (err) {
                res.status(500);
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }

            if (!subscription) {
                res.status(404);
                return res.json({
                    error: 'Subscription with given email not found',
                    data: []
                });
            }

            subscriptions.changeStatus(list.id, subscription.id, false, subscriptions.Status.UNSUBSCRIBED, (err, found) => {
                if (err) {
                    res.status(500);
                    return res.json({
                        error: err.message || err,
                        data: []
                    });
                }
                res.status(200);
                res.json({
                    data: {
                        id: subscription.id,
                        unsubscribed: true
                    }
                });
            });
        });
    });
});

router.post('/delete/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            res.status(500);
            return res.json({
                error: err.message || err,
                data: []
            });
        }
        if (!list) {
            res.status(404);
            return res.json({
                error: 'Selected listId not found',
                data: []
            });
        }
        if (!input.EMAIL) {
            res.status(400);
            return res.json({
                error: 'Missing EMAIL',
                data: []
            });
        }
        subscriptions.getByEmail(list.id, input.EMAIL, (err, subscription) => {
            if (err) {
                res.status(500);
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }
            if (!subscription) {
                res.status(404);
                return res.json({
                    error: 'Subscription not found',
                    data: []
                });
            }
            subscriptions.delete(list.id, subscription.cid, (err, subscription) => {
                if (err) {
                    res.status(500);
                    return res.json({
                        error: err.message || err,
                        data: []
                    });
                }
                if (!subscription) {
                    res.status(404);
                    return res.json({
                        error: 'Subscription not found',
                        data: []
                    });
                }
                res.status(200);
                res.json({
                    data: {
                        id: subscription.id,
                        deleted: true
                    }
                });
            });
        });
    });
});

router.post('/field/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            log.error('API', err);
            res.status(500);
            return res.json({
                error: err.message || err,
                data: []
            });
        }
        if (!list) {
            res.status(404);
            return res.json({
                error: 'Selected listId not found',
                data: []
            });
        }

        let field = {
            name: (input.NAME || '').toString().trim(),
            defaultValue: (input.DEFAULT || '').toString().trim() || null,
            type: (input.TYPE || '').toString().toLowerCase().trim(),
            group: Number(input.GROUP) || null,
            groupTemplate: (input.GROUP_TEMPLATE || '').toString().toLowerCase().trim(),
            visible: ['false', 'no', '0', ''].indexOf((input.VISIBLE || '').toString().toLowerCase().trim()) < 0
        };

        fields.create(list.id, field, (err, id, tag) => {
            if (err) {
                res.status(500);
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }
            res.status(200);
            res.json({
                data: {
                    id,
                    tag
                }
            });
        });
    });
});

router.postAsync('/blacklist/add', async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === ''))  {
        throw new Error('EMAIL argument is required');
    }

    await blacklist.add(req.context, input.EMAIL);

    res.json({
        data: []
    });
});

router.postAsync('/blacklist/delete', async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === '')) {
        throw new Error('EMAIL argument is required');
    }

    await blacklist.remove(req.oontext, input.EMAIL);

    res.json({
        data: []
    });
});

router.getAsync('/blacklist/get', async (req, res) => {
    let start = parseInt(req.query.start || 0, 10);
    let limit = parseInt(req.query.limit || 10000, 10);
    let search = req.query.search || '';

    const { emails, total } = await blacklist.search(req.context, start, limit, search);

    return res.json({
        data: {
            total,
            start: start,
            limit: limit,
            emails
        }
    });
});

module.exports = router;
