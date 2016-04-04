'use strict';

let settings = require('../lib/models/settings');
let campaigns = require('../lib/models/campaigns');
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
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

module.exports = router;
