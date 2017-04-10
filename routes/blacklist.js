'use strict';
let express = require('express');
let router = new express.Router();
let passport = require('../lib/passport');
let htmlescape = require('escape-html');
let blacklist = require('../lib/models/blacklist');
let tools = require('../lib/tools');
let helpers = require('../lib/helpers');
let _ = require('../lib/translate')._;

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('blacklist');
    next();
});

router.get('/', passport.csrfProtection, (req, res) => {
    res.render('blacklist', {csrfToken: req.csrfToken()});
});

router.post('/ajax/', (req, res) => {
    let start = parseInt(req.body.start || 0, 10);
    let limit = parseInt(req.body.length || 50, 10);
    let search = req.body.search.value || '';
    blacklist.get(start, limit, search, (err, data, total) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }
        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                htmlescape(row),
                '<button class="btn btn-danger btn-sm" onclick="document.getElementById(\'delete-email-input\').value = \'' + row + '\'; document.getElementById(\'delete-email-form\').submit();">Delete</button>'
            ])
        });
    });
});

router.post('/ajax/add', passport.csrfProtection, (req, res) => {
    let email = req.body.email;
    blacklist.add(email, (err) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect(req.body.next);
        }
        return res.redirect(req.body.next)
    });
});

router.post('/ajax/delete', passport.csrfProtection, (req, res) => {
    let email = req.body.email;
    blacklist.delete(email, (err) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect(req.body.next);
        }
        return res.redirect(req.body.next);
    });
});

module.exports = router;
