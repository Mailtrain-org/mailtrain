'use strict';

let links = require('../lib/models/links');
let settings = require('../lib/models/settings');
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
let tools = require('../lib/tools');

let log = require('npmlog');
let express = require('express');
let router = new express.Router();

let trackImg = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

router.get('/:campaign/:list/:subscription', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': trackImg.length
    });

    links.countOpen(req.ip, req.params.campaign, req.params.list, req.params.subscription, (err, opened) => {
        if (err) {
            log.error('Redirect', err.stack || err);
        }
        if (opened) {
            log.verbose('Redirect', 'First open for %s:%s:%s', req.params.campaign, req.params.list, req.params.subscription);
        }
    });

    res.end(trackImg);
});

router.get('/:campaign/:list/:subscription/:link', (req, res, next) => {
    links.resolve(req.params.campaign, req.params.link, (err, linkId, url) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }
        links.countClick(req.ip, req.params.campaign, req.params.list, req.params.subscription, linkId, (err, status) => {
            if (err) {
                log.error('Redirect', err.stack || err);
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
                err = new Error('Not Found');
                err.status = 404;
                return next(err);
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
                        err = new Error('Not Found');
                        err.status = 404;
                        return next(err);
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
