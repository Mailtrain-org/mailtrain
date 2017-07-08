'use strict';

const passport = require('./passport');

function _getConfig() {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal
    }
}

function registerRootRoute(router, title, entryPoint) {
    router.get('/*', passport.csrfProtection, (req, res) => {
        res.render('react-root', {
            title,
            reactEntryPoint: entryPoint,
            reactCsrfToken: req.csrfToken(),
            mailtrainConfig: JSON.stringify(_getConfig())
        });
    });
}

module.exports = {
  registerRootRoute
};

