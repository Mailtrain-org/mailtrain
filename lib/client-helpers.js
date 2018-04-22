'use strict';

const passport = require('./passport');
const config = require('config');
const permissions = require('./permissions');
const forms = require('../models/forms');
const shares = require('../models/shares');
const urls = require('./urls');

async function getAnonymousConfig(context, trusted) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        isAuthenticated: !!context.user,
        trustedUrlBase: urls.getTrustedUrl(),
        trustedUrlBaseDir: urls.getTrustedUrlBaseDir(),
        sandboxUrlBase: urls.getSandboxUrl(),
        sandboxUrlBaseDir: urls.getSandboxUrlBaseDir(),
        trusted
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
        editors: config.editors,
        verpEnabled: config.verp.enabled
    }
}

module.exports = {
    getAuthenticatedConfig,
    getAnonymousConfig
};
