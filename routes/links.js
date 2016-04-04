'use strict';

let links = require('../lib/models/links');

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

router.get('/:campaign/:list/:subscription/:link', (req, res) => {
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
        res.redirect(url);
    });
});

module.exports = router;
