'use strict';

let settings = require('../lib/models/settings');
let campaigns = require('../lib/models/campaigns');
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
let fields = require('../lib/models/fields');
let tools = require('../lib/tools');
let express = require('express');
let router = new express.Router();

router.get('/:campaign/:list/:subscription', (req, res, next) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        campaigns.getByCid(req.params.campaign, (err, campaign) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/');
            }

            if (!campaign) {
                err = new Error('Not Found');
                err.status = 404;
                return next(err);
            }

            lists.getByCid(req.params.list, (err, list) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/');
                }

                if (!list) {
                    err = new Error('Not Found');
                    err.status = 404;
                    return next(err);
                }

                subscriptions.get(list.id, req.params.subscription, (err, subscription) => {
                    if (err) {
                        req.flash('danger', err.message || err);
                        return res.redirect('/');
                    }

                    if (!subscription) {
                        err = new Error('Not Found');
                        err.status = 404;
                        return next(err);
                    }

                    fields.list(list.id, (err, fieldList) => {
                        if (err || !fieldList) {
                            return fieldList = [];
                        }

                        subscription.mergeTags = {
                            EMAIL: subscription.email,
                            FIRST_NAME: subscription.firstName,
                            LAST_NAME: subscription.lastName,
                            FULL_NAME: [].concat(subscription.firstName || []).concat(subscription.lastName || []).join(' ')
                        };

                        fields.getRow(fieldList, subscription, true, true).forEach(field => {
                            if (field.mergeTag) {
                                subscription.mergeTags[field.mergeTag] = field.mergeValue || '';
                            }
                            if (field.options) {
                                field.options.forEach(subField => {
                                    if (subField.mergeTag) {
                                        subscription.mergeTags[subField.mergeTag] = subField.mergeValue || '';
                                    }
                                });
                            }
                        });

                        campaigns.getMail(campaign.id, list.id, subscription.id, (err, mail) => {
                            if (err) {
                                req.flash('danger', err.message || err);
                                return res.redirect('/');
                            }

                            if (!mail) {
                                err = new Error('Not Found');
                                err.status = 404;
                                return next(err);
                            }

                            res.render('archive/view', {
                                layout: 'archive/layout',
                                message: tools.formatMessage(serviceUrl, campaign, list, subscription, campaign.html),
                                campaign,
                                list,
                                subscription
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
