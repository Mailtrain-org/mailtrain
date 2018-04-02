'use strict';

const passport = require('./passport');
const config = require('config');
const permissions = require('./permissions');
const forms = require('../models/forms');
const shares = require('../models/shares');

async function getAnonymousConfig(context) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        isAuthenticated: !!context.user,
        urlBase: config.www.urlBase,
        sandboxUrlBase: config.www.sandboxUrlBase,
        port: config.www.port,
        sandboxPort: config.www.sandboxPort
    }
}

async function getAuthenticatedConfig(context) {
    return {
        defaultCustomFormValues: await forms.getDefaultCustomFormValues(),
        user: {
            id: context.user.id,
            username: context.user.username,
            namespace: context.user.namespace
        },
        globalPermissions: shares.getGlobalPermissions(context),
        editors: config.editors
    }
}

module.exports = {
    getAuthenticatedConfig,
    getAnonymousConfig
};

