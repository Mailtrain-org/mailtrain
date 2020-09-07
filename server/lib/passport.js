'use strict';

const config = require('./config');
const log = require('./log');
const util = require('util');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const csrf = require('csurf');
const bodyParser = require('body-parser');

const users = require('../models/users');
const { nodeifyFunction, nodeifyPromise } = require('./nodeify');
const interoperableErrors = require('../../shared/interoperable-errors');
const contextHelpers = require('./context-helpers');

let authMode = 'local';

let LdapStrategy;
let ldapStrategyOpts;
if (config.ldap.enabled) {
    const ldapProtocol = config.ldap.secure ? 'ldaps' : 'ldap';
    if (!config.ldap.method || config.ldap.method === 'ldapjs') {
        try {
            LdapStrategy = require('passport-ldapjs').Strategy; // eslint-disable-line global-require
            authMode = 'ldap';
            log.info('LDAP', 'Found module "passport-ldapjs". It will be used for LDAP auth.');

            ldapStrategyOpts = {
                server: {
                    url: ldapProtocol + '://' + config.ldap.host + ':' + config.ldap.port
                },
                base: config.ldap.baseDN,
                search: {
                    filter: config.ldap.filter,
                    attributes: [config.ldap.uidTag, config.ldap.nameTag, config.ldap.mailTag],
                    scope: 'sub'
                },
                uidTag: config.ldap.uidTag,
                bindUser: config.ldap.bindUser,
                bindPassword: config.ldap.bindPassword
            };

        } catch (exc) {
            log.info('LDAP', 'Module "passport-ldapjs" not installed. It will not be used for LDAP auth.');
        }
    }

    if (!LdapStrategy && (!config.ldap.method || config.ldap.method === 'ldapauth')) {
        try {
            LdapStrategy = require('passport-ldapauth').Strategy; // eslint-disable-line global-require
            authMode = 'ldapauth';
            log.info('LDAP', 'Found module "passport-ldapauth". It will be used for LDAP auth.');

            ldapStrategyOpts = {
                server: {
                    url: ldapProtocol + '://' + config.ldap.host + ':' + config.ldap.port,
                    searchBase: config.ldap.baseDN,
                    searchFilter: config.ldap.filter,
                    searchAttributes: [config.ldap.uidTag, config.ldap.nameTag, config.ldap.mailTag],
                    bindDN: config.ldap.bindUser,
                    bindCredentials: config.ldap.bindPassword
                },
            };
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
    limit: config.www.postSize
});

module.exports.loggedIn = (req, res, next) => {
    if (!req.user) {
        next(new interoperableErrors.NotLoggedInError());
    } else {
        next();
    }
};

module.exports.authByAccessToken = (req, res, next) => {
    const accessToken = req.get('access-token') || req.query.access_token

    if (!accessToken) {
        res.status(403);
        res.json({
            error: 'Missing access_token',
            data: []
        });
        return;
    }

    users.getByAccessToken(accessToken).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        if (err instanceof interoperableErrors.PermissionDeniedError) {
            res.status(403);
            res.json({
                error: 'Invalid or expired access_token',
                data: []
            });
        } else {
            res.status(500);
            res.json({
                error: err.message || err,
                data: []
            });
        }
    });
};

module.exports.tryAuthByRestrictedAccessToken = (req, res, next) => {
    const pathComps = req.url.split('/');

    pathComps.shift();
    const restrictedAccessToken = pathComps.shift();
    pathComps.unshift('');

    const url = pathComps.join('/');

    req.url = url;

    users.getByRestrictedAccessToken(restrictedAccessToken).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        next();
    });
};


module.exports.setupRegularAuth = app => {
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
let CasStrategy;
if (config.cas && config.cas.enabled === true) {
  try {
    CasStrategy = require('passport-cas2').Strategy;
    authMode = 'cas';
    log.info('CAS', 'Found module "passport-cas2". It will be used for CAS auth.');
  } catch (exc) {
    log.info('CAS', 'Module passport-cas2 not installed.');
  }
}
if (CasStrategy) {
    log.info('Using CAS auth (passport-cas2)');
    module.exports.authMethod = 'cas';
    module.exports.isAuthMethodLocal = false;

    const cas = new CasStrategy({
        casURL: config.cas.url,
        propertyMap: {
            displayName: config.cas.nameTag,
            emails: config.cas.mailTag
        }
    }, 
    nodeifyFunction(async (username, profile) => { 
      try {
        const user = await users.getByUsername(username);

        log.info('CAS', 'Old User: '+JSON.stringify(profile));
        return {
            id: user.id,
            username: username,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: user.role
        };
      } catch (err) {
        if (err instanceof interoperableErrors.NotFoundError) {
            const userId = await users.create(contextHelpers.getAdminContext(), {
                username: username,
                role: config.cas.newUserRole,
                namespace: config.cas.newUserNamespaceId,
                name: profile.displayName,
                email: profile.emails[0].value
            });
            log.info('CAS', 'New User: '+JSON.stringify(profile));

            return {
                id: userId,
                username: username,
                name: profile.displayName,
                email: profile.emails[0].value,
                role: config.cas.newUserRole
            };
        } else {
            throw err;
        }
      }
    }));
    passport.use(cas);
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    module.exports.authenticateCas = passport.authenticate('cas', { failureRedirect: '/login?cas-login-error' });
    module.exports.logoutCas = function (req, res) {
        cas.logout(req, res, config.www.trustedUrlBase+'/?cas-logout-success');
    };

} else if (LdapStrategy) {
    log.info('Using LDAP auth (passport-' + authMode === 'ldap' ? 'ldapjs' : authMode + ')');
    module.exports.authMethod = 'ldap';
    module.exports.isAuthMethodLocal = false;

    passport.use(new LdapStrategy(ldapStrategyOpts, nodeifyFunction(async (profile) => {
        try {
            const user = await users.getByUsername(profile[config.ldap.uidTag]);

            return {
                id: user.id,
                username: profile[config.ldap.uidTag],
                name: profile[config.ldap.nameTag],
                email: profile[config.ldap.mailTag],
                role: user.role
            };

        } catch (err) {
            if (err instanceof interoperableErrors.NotFoundError) {
                const userId = await users.create(contextHelpers.getAdminContext(), {
                    username: profile[config.ldap.uidTag],
                    role: config.ldap.newUserRole,
                    namespace: config.ldap.newUserNamespaceId
                });

                return {
                    id: userId,
                    username: profile[config.ldap.uidTag],
                    name: profile[config.ldap.nameTag],
                    email: profile[config.ldap.mailTag],
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
        return await users.getByUsernameIfPasswordMatch(contextHelpers.getAdminContext(), username, password);
    })));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => nodeifyPromise(users.getById(contextHelpers.getAdminContext(), id), done));
}

