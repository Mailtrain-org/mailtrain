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
let passport = require('../lib/passport');
let marked = require('marked');
let _ = require('../lib/translate')._;
let util = require('util');

router.get('/:campaign/:list/:subscription', passport.csrfProtection, (req, res, next) => {
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
                err = new Error(_('Not Found'));
                err.status = 404;
                return next(err);
            }

            lists.getByCid(req.params.list, (err, list) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/');
                }

                if (!list) {
                    err = new Error(_('Not Found'));
                    err.status = 404;
                    return next(err);
                }

                subscriptions.getWithMergeTags(list.id, req.params.subscription, (err, subscription) => {
                    if (err) {
                        req.flash('danger', err.message || err);
                        return res.redirect('/');
                    }

                    if (!subscription) {
                        err = new Error(_('Not Found'));
                        err.status = 404;
                        return next(err);
                    }

                    campaigns.getAttachments(campaign.id, (err, attachments) => {
                        if (err) {
                            req.flash('danger', err.message || err);
                            return res.redirect('/');
                        }

                        let renderHtml = (html, renderTags) => {
                            let render = (view, layout) => {
                                res.render(view, {
                                    layout,
                                    message: renderTags ? tools.formatMessage(serviceUrl, campaign, list, subscription, html, false, true) : html,
                                    campaign,
                                    list,
                                    subscription,
                                    attachments,
                                    csrfToken: req.csrfToken()
                                });
                            };

                            if (campaign.editorName && campaign.editorName !== 'summernote' && campaign.editorName !== 'codeeditor') {
                                res.render('partials/tracking-scripts', {
                                    layout: 'archive/layout-raw'
                                }, (err, scripts) => {
                                    if (err) {
                                        return next(err);
                                    }
                                    html = scripts ? html.replace(/<\/body\b/i, match => scripts + match) : html;
                                    render('archive/view-raw', 'archive/layout-raw');
                                });
                            } else {
                                render('archive/view', 'archive/layout');
                            }
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
                                    return next(new Error(util.format(_('Received status code %s from %s'), httpResponse.statusCode, campaign.sourceUrl)));
                                }
                                renderAndShow(body && body.toString(), false);
                            });
                        } else {
                            renderAndShow(campaign.html || marked(campaign.text, {
                                breaks: true,
                                sanitize: true,
                                gfm: true,
                                tables: true,
                                smartypants: true
                            }), true);
                        }
                    });
                });
            });
        });
    });
});

router.post('/attachment/download', passport.parseForm, passport.csrfProtection, (req, res) => {
    let url = '/archive/' + encodeURIComponent(req.body.campaign || '') + '/' + encodeURIComponent(req.body.list || '') + '/' + encodeURIComponent(req.body.subscription || '');
    campaigns.getByCid(req.body.campaign, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect(url);
        }
        campaigns.getAttachment(campaign.id, Number(req.body.attachment), (err, attachment) => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect(url);
            } else if (!attachment) {
                req.flash('warning', _('Attachment not found'));
                return res.redirect(url);
            }

            res.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(attachment.filename).replace(/['()]/g, escape) + '"');
            res.set('Content-Type', attachment.contentType);
            res.send(attachment.content);
        });
    });
});

module.exports = router;
