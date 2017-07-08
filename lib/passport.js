'use strict';

let config = require('config');
let log = require('npmlog');
let _ = require('./translate')._;
let util = require('util');

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let csrf = require('csurf');
let bodyParser = require('body-parser');

const users = require('../models/users');
const { nodeifyFunction, nodeifyPromise } = require('./nodeify');
const interoperableErrors = require('../shared/interoperable-errors');

let LdapStrategy;
try {
    LdapStrategy = require('passport-ldapjs').Strategy; // eslint-disable-line global-require
} catch (E) {
    if (config.ldap.enabled) {
        log.info('LDAP', 'Module "passport-ldapjs" not installed. LDAP auth will fail.');
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

module.exports.setup = app => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports.restLogout = (req, res) => {
    req.logout();
    res.json();
};

module.exports.restLogin = (req, res, next) => {
    passport.authenticate(config.ldap.enabled ? 'ldap' : 'local', (err, user, info) => {
        return next(err);

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

if (config.ldap.enabled && LdapStrategy) {
    log.info('Using LDAP auth');
    module.exports.authMethod = 'ldap';
    module.exports.isAuthMethodLocal = false;

    let opts = {
        server: {
            url: 'ldap://' + config.ldap.host + ':' + config.ldap.port
        },
        base: config.ldap.baseDN,
        search: {
            filter: config.ldap.filter,
            attributes: [config.ldap.uidTag, config.ldap.nameTag, 'mail'],
            scope: 'sub'
        },
        uidTag: config.ldap.uidTag
    };

    passport.use(new LdapStrategy(opts, nodeifyFunction(async (profile) => {
        try {
            const user = await users.getByUsername(profile[config.ldap.uidTag]);

            return {
                id: user.id,
                username: user.username,
                name: profile[config.ldap.nameTag],
                email: profile.mail
            };

        } catch (err) {
            if (err instanceof interoperableErrors.NotFoundError) {
                const userId = await users.createExternal({
                    username: profile[config.ldap.uidTag],
                });

                return {
                    id: userId,
                    username: profile[config.ldap.uidTag],
                    name: profile[config.ldap.nameTag],
                    email: profile.mail
                };
            } else {
                throw err;
            }

        }
    })));

    passport.serializeUser((user, done) => { /* FIXME */ console.log(user); done(null, user); });
    passport.deserializeUser((user, done) => done(null, user));

} else {
    log.info('Using local auth');
    module.exports.authMethod = 'local';
    module.exports.isAuthMethodLocal = true;

    passport.use(new LocalStrategy(nodeifyFunction(async (username, password) => {
        return await users.getByUsernameIfPasswordMatch(username, password);
    })));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => nodeifyPromise(users.getById(id), done));
}

