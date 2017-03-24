'use strict';

let links = require('../lib/models/links');
let settings = require('../lib/models/settings');
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
let tools = require('../lib/tools');
let _ = require('../lib/translate')._;

let log = require('npmlog');
let express = require('express');
let router = new express.Router();

let trackImg = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

router.get('/:campaign/:list/:subscription', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': trackImg.length
    });
    links.countOpen(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, (err, opened) => {
        if (err) {
            log.error('Redirect', err);
        }
        if (opened) {
            log.verbose('Redirect', 'First open for %s:%s:%s', req.params.campaign, req.params.list, req.params.subscription);
        }
    });

    res.end(trackImg);
});

router.get('/:campaign/:list/:subscription/:link', (req, res) => {

    let notFound = () => {
        res.status(404);
        return res.render('archive/view', {
            layout: 'archive/layout',
            message: _('Oops, we couldn\'t find a link for the URL you clicked'),
            campaign: {
                subject: 'Error 404'
            }
        });
    };

    links.resolve(req.params.link, (err, linkId, url) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }
        if (!linkId || !url) {
            log.error('Redirect', 'Unresolved URL: <%s>', req.url);
            return notFound();
        }
        links.countClick(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, linkId, (err, status) => {
            if (err) {
                log.error('Redirect', err);
            }
            if (status) {
                log.verbose('Redirect', 'First click for %s:%s:%s (%s)', req.params.campaign, req.params.list, req.params.subscription, url);
            }
        });

        if (!/\[[^\]]+\]/.test(url)) {
            // no special tags, just pass on the link
            return res.redirect(url);
        }

        // url might include variables, need to rewrite those just as we do with message content
        lists.getByCid(req.params.list, (err, list) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/');
            }

            if (!list) {
                log.error('Redirect', 'Could not resolve list for merge tags: <%s>', req.url);
                return notFound();
            }

            settings.get('serviceUrl', (err, serviceUrl) => {
                if (err) {
                    // ignore
                }
                serviceUrl = (serviceUrl || '').toString().trim();

                subscriptions.getWithMergeTags(list.id, req.params.subscription, (err, subscription) => {
                    if (err) {
                        req.flash('danger', err.message || err);
                        return res.redirect('/');
                    }

                    if (!subscription) {
                        log.error('Redirect', 'Could not resolve subscription for merge tags: <%s>', req.url);
                        return notFound();
                    }

                    url = tools.formatMessage(serviceUrl, {
                        cid: req.params.campaign
                    }, list, subscription, url, str => encodeURIComponent(str));

                    res.redirect(url);
                });
            });
        });
    });
});

module.exports = router;
