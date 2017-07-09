'use strict';

const passport = require('./passport');
const config = require('config');

function _getConfig(context) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        userId: context.user ? context.user.id : undefined
    }
}

function registerRootRoute(router, entryPoint, title) {
    router.get('/*', passport.csrfProtection, (req, res) => {
        res.render('react-root', {
            title,
            reactEntryPoint: entryPoint,
            reactCsrfToken: req.csrfToken(),
            mailtrainConfig: JSON.stringify(_getConfig(req.context))
        });
    });
}

module.exports = {
  registerRootRoute
};

