'use strict';

let passport = require('../lib/passport');
let express = require('express');
let router = new express.Router();
let users = require('../lib/models/users');
let fields = require('../lib/models/fields');
let settings = require('../lib/models/settings');
let _ = require('../lib/translate')._;

router.get('/logout', (req, res) => passport.logout(req, res));

router.post('/login', passport.parseForm, (req, res, next) => passport.login(req, res, next));
router.get('/login', (req, res) => {
    res.render('users/login', {
        next: req.query.next
    });
});

router.get('/forgot', passport.csrfProtection, (req, res) => {
    res.render('users/forgot', {
        csrfToken: req.csrfToken()
    });
});

router.post('/forgot', passport.parseForm, passport.csrfProtection, (req, res) => {
    users.sendReset(req.body.username, err => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/users/forgot');
        } else {
            req.flash('success', _('An email with password reset instructions has been sent to your email address, if it exists on our system.'));
        }
        return res.redirect('/users/login');
    });
});

router.get('/reset', passport.csrfProtection, (req, res) => {
    users.checkResetToken(req.query.username, req.query.token, (err, status) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/users/login');
        }

        if (!status) {
            req.flash('danger', _('Unknown or expired reset token'));
            return res.redirect('/users/login');
        }

        res.render('users/reset', {
            csrfToken: req.csrfToken(),
            username: req.query.username,
            resetToken: req.query.token
        });
    });
});

router.post('/reset', passport.parseForm, passport.csrfProtection, (req, res) => {
    users.resetPassword(req.body, (err, status) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/users/reset?username=' + encodeURIComponent(req.body.username) + '&token=' + encodeURIComponent(req.body['reset-token']));
        } else if (!status) {
            req.flash('danger', _('Unknown or expired reset token'));
        } else {
            req.flash('success', _('Your password has been changed successfully'));
        }

        return res.redirect('/users/login');
    });
});

router.all('/api', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    next();
});

router.get('/api', passport.csrfProtection, (req, res, next) => {
    users.get(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error(_('User data not found')));
        }
        settings.list(['serviceUrl'], (err, configItems) => {
            if (err) {
                return next(err);
            }
            user.serviceUrl = configItems.serviceUrl;
            user.csrfToken = req.csrfToken();
            user.allowedTypes = Object.keys(fields.types).map(key => ({
                type: key,
                description: fields.types[key]
            }));
            res.render('users/api', user);
        });
    });

});

router.post('/api/reset-token', passport.parseForm, passport.csrfProtection, (req, res) => {
    users.resetToken(Number(req.user.id), (err, success) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (success) {
            req.flash('success', _('Access token updated'));
        } else {
            req.flash('info', _('Access token not updated'));
        }
        return res.redirect('/users/api');
    });
});

router.all('/account', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    next();
});

router.get('/account', passport.csrfProtection, (req, res) => {
    let data = {
        csrfToken: req.csrfToken(),
        email: req.user.email
    };
    res.render('users/account', data);
});

router.post('/account', passport.parseForm, passport.csrfProtection, (req, res) => {
    users.update(Number(req.user.id), req.body, (err, success) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (success) {
            req.flash('success', _('Account information updated'));
        } else {
            req.flash('info', _('Account information not updated'));
        }
        return res.redirect('/users/account');
    });
});

module.exports = router;
