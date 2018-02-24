'use strict';

const config = require('config');
const log = require('npmlog');
const _ = require('./translate')._;
const util = require('util');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const csrf = require('csurf');
const bodyParser = require('body-parser');

const users = require('../models/users');
const { nodeifyFunction, nodeifyPromise } = require('./nodeify');
const interoperableErrors = require('../shared/interoperable-errors');
const contextHelpers = require('./context-helpers');

let LdapStrategy;
let authMode = 'local';
if (config.ldap.enabled) {
    if (config.ldap.method == 'ldapjs') {
        try {
            LdapStrategy = require('passport-ldapjs').Strategy; // eslint-disable-line global-require
            authMode = 'ldapjs';
        } catch (exc) {
            log.info('LDAP', 'Module "passport-ldapjs" not installed. It will not be used for LDAP auth.');
        }
    } else if (config.ldap.method == 'ldapauth') {
        try {
            LdapStrategy = require('passport-ldapauth').Strategy; // eslint-disable-line global-require
            authMode = 'ldapauth';
        } catch (exc) {
            log.info('LDAP', 'Module "passport-ldapauth" not installed. It will not be used for LDAP auth.');
        }
    }
}

module.exports.csrfProtection = csrf({
    cookie: true
});

module.exports.parseForm = bodyParser.urlencoded({
    extended: false,
    limit: config.www.postsize
});

module.exports.loggedIn = (req, res, next) => {
    if (!req.user) {
        next(new interoperableErrors.NotLoggedInError());
    } else {
        next();
    }
};

module.exports.authByAccessToken = (req, res, next) => {
    nodeifyPromise((async () => {
        if (!req.query.access_token) {
            res.status(403);
            return res.json({
                error: 'Missing access_token',
                data: []
            });
        }

        try {
            const user = await users.getByAccessToken(req.query.access_token);
            req.user = user;
            next();
        } catch (err) {
            if (err instanceof interoperableErrors.NotFoundError) {
                res.status(403);
                return res.json({
                    error: 'Invalid or expired access_token',
                    data: []
                });
            } else {
                res.status(500);
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }
        }
    })(), next);
};

module.exports.setup = app => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports.restLogout = (req, res) => {
    req.logout();
    res.json();
};

module.exports.restLogin = (req, res, next) => {
    passport.authenticate(authMode, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return next(new interoperableErrors.IncorrectPasswordError());
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

            return res.json();
        });
    })(req, res, next);
};

if (authMode === 'ldapjs' || authMode === 'ldapauth') {
    log.info('Using LDAP auth (passport-' + authMode + ')');
    module.exports.authMethod = 'ldap';
    module.exports.isAuthMethodLocal = false;

    let opts;
    if (authMode === 'ldapjs') {
        opts = {
            server: {
                url: 'ldap://' + config.ldap.host + ':' + config.ldap.port
            },
            base: config.ldap.baseDN,
            search: {
                filter: config.ldap.filter,
                attributes: [config.ldap.uidTag, config.ldap.nameTag, 'mail'],
                scope: 'sub'
            },
            uidTag: config.ldap.uidTag,
            bindUser: config.ldap.bindUser,
            bindPassword: config.ldap.bindPassword
        };

    } else if (authMode = 'ldapauth') {
        opts = {
            server: {
                url: 'ldap://' + config.ldap.host + ':' + config.ldap.port,
                searchBase: config.ldap.baseDN,
                searchFilter: config.ldap.filter,
                searchAttributes: [config.ldap.uidTag, config.ldap.nameTag, 'mail'],
                bindDN: config.ldap.bindUser,
                bindCredentials: config.ldap.bindPassword
            },
        };
    }

    passport.use(new LdapStrategy(opts, nodeifyFunction(async (profile) => {
        try {
            const user = await users.getByUsername(profile[config.ldap.uidTag]);

            return {
                id: user.id,
                username: user.username,
                name: profile[config.ldap.nameTag],
                email: profile.mail,
                role: user.role
            };

        } catch (err) {
            if (err instanceof interoperableErrors.NotFoundError) {
                const userId = await users.create(null, {
                    username: profile[config.ldap.uidTag],
                    role: config.ldap.newUserRole,
                    namespace: config.ldap.newUserNamespaceId
                });

                return {
                    id: userId,
                    username: profile[config.ldap.uidTag],
                    name: profile[config.ldap.nameTag],
                    email: profile.mail,
                    role: config.ldap.newUserRole
                };
            } else {
                throw err;
            }
        }
    })));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

} else {
    log.info('Using local auth');
    module.exports.authMethod = 'local';
    module.exports.isAuthMethodLocal = true;

    passport.use(new LocalStrategy(nodeifyFunction(async (username, password) => {
        return await users.getByUsernameIfPasswordMatch(username, password);
    })));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => nodeifyPromise(users.getById(contextHelpers.getAdminContext(), id), done));
}

