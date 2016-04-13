'use strict';

let config = require('config');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let csrf = require('csurf');
let bodyParser = require('body-parser');
let users = require('./models/users');

module.exports.csrfProtection = csrf({
    cookie: true
});

module.exports.parseForm = bodyParser.urlencoded({
    extended: false,
    limit: config.www.postsize
});

module.exports.setup = app => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports.logout = (req, res) => {
    if (req.user) {
        req.flash('info', req.user.username + ' logged out');
        req.logout();
    }
    res.redirect('/');
};

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            req.flash('danger', err.message);
            return next(err);
        }
        if (!user) {
            req.flash('danger', info && info.message || 'Failed to authenticate user');
            return res.redirect('/users/login' + (req.body.next ? '?next=' + encodeURIComponent(req.body.next) : ''));
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }

            if (req.body.remember) {
                // Cookie expires after 30 days
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                // Cookie expires at end of session
                req.session.cookie.expires = false;
            }

            req.flash('success', 'Logged in as ' + user.username);
            return res.redirect(req.body.next || '/');
        });
    })(req, res, next);
};

passport.use(new LocalStrategy((username, password, done) => {
    users.authenticate(username, password, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, {
                message: 'Incorrect username or password'
            });
        }

        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    users.get(id, done);
});
