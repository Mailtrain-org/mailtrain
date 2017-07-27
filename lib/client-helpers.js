'use strict';

const passport = require('./passport');
const config = require('config');
const permissions = require('./permissions');

function getAnonymousConfig(context) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        isAuthenticated: !!context.user
    }
}

function getAuthenticatedConfig(context) {
    return {
        userId: context.user.id
    }
}

function registerRootRoute(router, entryPoint, title) {
    router.get('/*', passport.csrfProtection, (req, res) => {
        const mailtrainConfig = getAnonymousConfig(req.context);
        if (req.user) {
            Object.assign(mailtrainConfig, getAuthenticatedConfig(req.context));
        }

        res.render('react-root', {
            title,
            reactEntryPoint: entryPoint,
            reactCsrfToken: req.csrfToken(),
            mailtrainConfig: JSON.stringify(mailtrainConfig)
        });
    });
}

module.exports = {
  registerRootRoute,
    getAuthenticatedConfig
};

