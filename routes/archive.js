'use strict';

let settings = require('../lib/models/settings');
let campaigns = require('../lib/models/campaigns');
let links = require('../lib/models/links');
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
let tools = require('../lib/tools');
let express = require('express');
let request = require('request');
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

                subscriptions.getWithMergeTags(list.id, req.params.subscription, (err, subscription) => {
                    if (err) {
                        req.flash('danger', err.message || err);
                        return res.redirect('/');
                    }

                    if (!subscription) {
                        err = new Error('Not Found');
                        err.status = 404;
                        return next(err);
                    }

                    let renderHtml = (html, renderTags) => {
                        res.render('archive/view', {
                            layout: 'archive/layout',
                            message: renderTags ? tools.formatMessage(serviceUrl, campaign, list, subscription, html) : html,
                            campaign,
                            list,
                            subscription
                        });
                    };

                    let renderAndShow = (html, renderTags) => {
                        if (req.query.track === 'no') {
                            return renderHtml(html, renderTags);
                        }
                        // rewrite links to count clicks
                        links.updateLinks(campaign, list, subscription, serviceUrl, html, (err, html) => {
                            if (err) {
                                req.flash('danger', err.message || err);
                                return res.redirect('/');
                            }
                            renderHtml(html, renderTags);
                        });
                    };

                    if (campaign.sourceUrl) {
                        let form = tools.getMessageLinks(serviceUrl, campaign, list, subscription);
                        Object.keys(subscription.mergeTags).forEach(key => {
                            form[key] = subscription.mergeTags[key];
                        });
                        request.post({
                            url: campaign.sourceUrl,
                            form
                        }, (err, httpResponse, body) => {
                            if (err) {
                                return next(err);
                            }
                            if (httpResponse.statusCode !== 200) {
                                return next(new Error('Received status code ' + httpResponse.statusCode + ' from ' + campaign.sourceUrl));
                            }
                            renderAndShow(body && body.toString(), false);
                        });
                    } else {
                        renderAndShow(campaign.html, true);
                    }
                });
            });
        });
    });
});

module.exports = router;
