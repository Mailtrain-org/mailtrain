'use strict';

const passport = require('./passport');
const config = require('config');
const permissions = require('./permissions');
const forms = require('../models/forms');

async function getAnonymousConfig(context) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        isAuthenticated: !!context.user
    }
}

async function getAuthenticatedConfig(context) {
    return {
        defaultCustomFormValues: await forms.getDefaultCustomFormValues(),
        userId: context.user.id
    }
}

function registerRootRoute(router, entryPoint, title) {
    router.getAsync('/*', passport.csrfProtection, async (req, res) => {
        const mailtrainConfig = await getAnonymousConfig(req.context);
        if (req.user) {
            Object.assign(mailtrainConfig, await getAuthenticatedConfig(req.context));
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

