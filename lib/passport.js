'use strict';

let config = require('config');
let log = require('npmlog');
let _ = require('./translate')._;
let util = require('util');

let passport = require('passport');
let fs = require('fs');
let LocalStrategy = require('passport-local').Strategy;

let csrf = require('csurf');
let bodyParser = require('body-parser');
let users = require('./models/users');

let LdapStrategy;
try {
    LdapStrategy = require('passport-ldapjs').Strategy; // eslint-disable-line global-require
} catch (E) {
    if (config.ldap.enabled) {
        log.info('LDAP', 'Module "passport-ldapjs" not installed. It will not be used for LDAP auth.');
    }
}

let LdapAuthStrategy;
try {
    LdapAuthStrategy = require('passport-ldapauth').Strategy; // eslint-disable-line global-require
} catch (E) {
    if (config.ldapauth.enabled) {
        log.info('LDAP', 'Module "passport-ldapauth" not installed. It will not be used for LDAP auth.');
    }
}

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
        req.flash('info', util.format(_('%s  logged out'), req.user.username));
        req.logout();
    }
    res.redirect('/');
};

module.exports.login = (req, res, next) => {
    let authMode = config.ldapauth.enabled ? 'ldapauth' : config.ldap.enabled ? 'ldap' : 'local';
    passport.authenticate(authMode, (err, user, info) => {
        if (err) {
            req.flash('danger', err.message);
            return next(err);
        }
        if (!user) {
            log.warn('auth', `[client ${req.ip}] authentication failure`);
            req.flash('danger', info && info.message || _('Failed to authenticate user'));
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

            req.flash('success', util.format(_('Logged in as %s'), user.username));
            return res.redirect(req.body.next || '/');
        });
    })(req, res, next);
};

if (config.ldap.enabled && LdapStrategy) {
    log.info('Using LDAP auth (passport-ldapjs)');

    let opts = {
        server: {
            url: config.ldap.url,
            tlsOptions: {
                ca: config.ldap.ca ? [
                    fs.readFileSync(config.ldap.ca)
                ] : undefined
            }
        },
        base: config.ldap.baseDN,
        search: {
            filter: config.ldap.filter,
            attributes: [config.ldap.uidTag, 'mail'],
            scope: 'sub'
        },
        uidTag: config.ldap.uidTag,
        bindUser: config.ldap.bindUser,
        bindPassword: config.ldap.bindPassword
    };

    passport.use(new LdapStrategy(opts, (profile, done) => {
        users.findByUsername(profile[config.ldap.uidTag], (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                // password is empty for ldap
                users.add(profile[config.ldap.uidTag], '', profile.mail, (err, id) => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, {
                        id,
                        username: profile[config.ldap.uidTag]
                    });
                });
            } else {
                return done(null, {
                    id: user.id,
                    username: user.username
                });
            }
        });
    }));
} else if (config.ldapauth.enabled && LdapAuthStrategy) {
    log.info('Using LDAP auth (passport-ldapauth)');
    let opts = {
        server: {
            url: config.ldapauth.url,
            searchBase: config.ldapauth.baseDN,
            searchFilter: config.ldapauth.filter,
            searchAttributes: [config.ldapauth.uidTag, 'mail'],
            bindDN: config.ldapauth.bindUser,
            bindCredentials: config.ldapauth.bindPassword,
            tlsOptions: {
                ca: config.ldapauth.ca ? [
                    fs.readFileSync(config.ldapauth.ca)
                ] : undefined
            }
        }
    };

    passport.use(new LdapAuthStrategy(opts, (profile, done) => {
        users.findByUsername(profile[config.ldapauth.uidTag], (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                // password is empty for ldap
                users.add(profile[config.ldapauth.uidTag], '', profile.mail, (err, id) => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, {
                        id,
                        username: profile[config.ldapauth.uidTag]
                    });
                });
            } else {
                return done(null, {
                    id: user.id,
                    username: user.username
                });
            }
        });
    }));
} else {
    log.info('Using local auth');

    passport.use(new LocalStrategy((username, password, done) => {
        users.authenticate(username, password, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {
                    message: _('Incorrect username or password')
                });
            }

            return done(null, user);
        });
    }));
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    users.get(id, done);
});
