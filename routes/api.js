'use strict';

let users = require('../lib/models/users');
let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let blacklist = require('../lib/models/blacklist');
let subscriptions = require('../lib/models/subscriptions');
let confirmations = require('../lib/models/confirmations');
let tools = require('../lib/tools');
let express = require('express');
let log = require('npmlog');
let router = new express.Router();
let mailHelpers = require('../lib/subscription-mail-helpers');

const handleErrorResponse = (res, log, err, code = 500, message = false) => {
    if (typeof err != 'undefined')
        log.error('API', err);
    res.status(code);
    return res.json({
        error: message || err.message || err,
        data: []
    });
}

router.all('/*', (req, res, next) => {
    if (!req.query.access_token) {
        return handleErrorResponse(res, log, false, 403, 'Missing access_token');
    }

    users.findByAccessToken(req.query.access_token, (err, user) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        if (!user) {
            return handleErrorResponse(res, log, false, 403, 'Invalid or expired access_token');
        }
        next();
    });

});

router.post('/subscribe/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            return handleErrorResponse(res, log, false, 403, 'Invalid or expired access_token');
        }
        if (!list) {
            return handleErrorResponse(res, log, false, 404, 'Selected listId not found');
        }
        if (!input.EMAIL) {
            return handleErrorResponse(res, log, false, 400, 'Missing EMAIL');
        }
        tools.validateEmail(input.EMAIL, false, err => {
            if (err) {
                return handleErrorResponse(res, log, err, 400);
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
                            return handleErrorResponse(res, log, err);
                        }

                        mailHelpers.sendConfirmSubscription(list, input.EMAIL, confirmCid, subscription, (err) => {
                            if (err) {
                                return handleErrorResponse(res, log, err);
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
                            return handleErrorResponse(res, log, err);
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
            return handleErrorResponse(res, log, err);
        }
        if (!list) {
            return handleErrorResponse(res, log, false, 404, 'Selected listId not found');
        }
        if (!input.EMAIL) {
            return handleErrorResponse(res, log, false, 400, 'Missing EMAIL');
        }

        subscriptions.getByEmail(list.id, input.EMAIL, (err, subscription) => {
            if (err) {
                return handleErrorResponse(res, log, err);
            }
            if (!subscription) {
                return handleErrorResponse(res, log, false, 404, 'Subscription with given email not found');
            }

            subscriptions.changeStatus(list.id, subscription.id, false, subscriptions.Status.UNSUBSCRIBED, (err, found) => {
                if (err) {
                    return handleErrorResponse(res, log, err);
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
            return handleErrorResponse(res, log, err);
        }
        if (!list) {
            return handleErrorResponse(res, log, false, 404, 'Selected listId not found');
        }
        if (!input.EMAIL) {
            return handleErrorResponse(res, log, false, 400, 'Missing EMAIL');
        }
        subscriptions.getByEmail(list.id, input.EMAIL, (err, subscription) => {
            if (err) {
                return handleErrorResponse(res, log, err);
            }
            if (!subscription) {
                return handleErrorResponse(res, log, false, 404, 'Subscription not found');
            }
            subscriptions.delete(list.id, subscription.cid, (err, subscription) => {
                if (err) {
                    return handleErrorResponse(res, log, err);
                }
                if (!subscription) {
                    return handleErrorResponse(res, log, false, 404, 'Subscription not found');
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

router.get('/subscriptions/:listId', (req, res) => {
    let start = parseInt(req.query.start || 0, 10);
    let limit = parseInt(req.query.limit || 10000, 10);

    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        subscriptions.list(list.id, start, limit, (err, rows, total) => {
            if (err) {
                return handleErrorResponse(res, log, err);
            }
            res.status(200);
            res.json({
                data: {
                    total: total,
                    start: start,
                    limit: limit,
                    subscriptions: rows
                }
            });
        });
    });
});

router.get('/lists', (req, res) => {
    lists.quicklist((err, lists) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        res.status(200);
        res.json({
            data: lists
        });
    });
});

router.get('/list/:id', (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        res.status(200);
        res.json({
            data: list
        });
    });
});

router.get('/lists/:email', (req, res) => {
    lists.getListsWithEmail(req.params.email, (err, lists) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        res.status(200);
        res.json({
            data: lists
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
            return handleErrorResponse(res, log, err);
        }
        if (!list) {
            return handleErrorResponse(res, log, false, 404, 'Selected listId not found');
        }

        let field = {
            name: (input.NAME || '').toString().trim(),
            description: (input.DESCRIPTION || '').toString().trim(),
            defaultValue: (input.DEFAULT || '').toString().trim() || null,
            type: (input.TYPE || '').toString().toLowerCase().trim(),
            group: Number(input.GROUP) || null,
            groupTemplate: (input.GROUP_TEMPLATE || '').toString().toLowerCase().trim(),
            visible: ['false', 'no', '0', ''].indexOf((input.VISIBLE || '').toString().toLowerCase().trim()) < 0
        };

        fields.create(list.id, field, (err, id, tag) => {
            if (err) {
                return handleErrorResponse(res, log, err);
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

router.post('/blacklist/add', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === ''))  {
        return handleErrorResponse(res, log, err);
    }
    blacklist.add(input.EMAIL, (err) =>{
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        res.status(200);
        res.json({
            data: []
        });
    });
});

router.post('/blacklist/delete', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === ''))  {
        return handleErrorResponse(res, log, false, 500, 'EMAIL argument are required');
    }
    blacklist.delete(input.EMAIL, (err) =>{
      if (err) {
          return handleErrorResponse(res, log, err);
      }
      res.status(200);
      res.json({
          data: []
      });
    });
});

router.get('/blacklist/get', (req, res) => {
    let start = parseInt(req.query.start || 0, 10);
    let limit = parseInt(req.query.limit || 10000, 10);
    let search = req.query.search || '';

    blacklist.get(start, limit, search, (err, data, total) => {
      if (err) {
          return handleErrorResponse(res, log, err);
      }
      res.status(200);
      res.json({
          data: {
            total: total,
            start: start,
            limit: limit,
            emails: data
          }
      });
    });
});

router.post('/changeemail/:listId', (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAILOLD) || (input.EMAILOLD === ''))  {
        return handleErrorResponse(res, log, false, 500, 'EMAILOLD argument is required');
    }
    if (!(input.EMAILNEW) || (input.EMAILNEW === ''))  {
        return handleErrorResponse(res, log, false, 500, 'EMAILNEW argument is required');
    }
    lists.getByCid(req.params.listId, (err, list) => {
        if (err) {
            return handleErrorResponse(res, log, err);
        }
        if (!list) {
            return handleErrorResponse(res, log, false, 404, 'Selected listId not found');
        }
        blacklist.isblacklisted(input.EMAILNEW, (err, blacklisted) => {
            if (err) {
                return handleErrorResponse(res, log, err);
            }
            if (blacklisted) {
                return handleErrorResponse(res, log, false, 500, 'New email is blacklisted');
            }

            subscriptions.getByEmail(list.id, input.EMAILOLD, (err, subscription) => {
                if (err) {
                    return handleErrorResponse(res, log, err);
                }

                if (!subscription) {
                    return handleErrorResponse(res, log, false, 404, 'Subscription with given old email not found');
                }

                subscriptions.updateAddressCheck(list, subscription.cid, input.EMAILNEW, null, (err, old, valid) => {
                    if (err) {
                        return handleErrorResponse(res, log, err);
                    }

                    if (!valid) {
                        return handleErrorResponse(res, log, false, 500, 'New email not valid');
                    }

                    subscriptions.updateAddress(list.id, subscription.id, input.EMAILNEW, (err) => {
                        if (err) {
                            return handleErrorResponse(res, log, err);
                        }
                        res.status(200);
                        res.json({
                            data: {
                                id: subscription.id,
                                changedemail: true
                            }
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
