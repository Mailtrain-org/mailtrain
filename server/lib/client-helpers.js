'use strict';

const passport = require('./passport');
const config = require('config');
const forms = require('../models/forms');
const shares = require('../models/shares');
const urls = require('./urls');


async function getAnonymousConfig(context, appType) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        language: config.language || 'en',
        isAuthenticated: !!context.user,
        trustedUrlBase: urls.getTrustedUrlBase(),
        trustedUrlBaseDir: urls.getTrustedUrlBaseDir(),
        sandboxUrlBase: urls.getSandboxUrlBase(),
        sandboxUrlBaseDir: urls.getSandboxUrlBaseDir(),
        publicUrlBase: urls.getPublicUrlBase(),
        publicUrlBaseDir: urls.getPublicUrlBaseDir(),
        appType
    }
}

async function getAuthenticatedConfig(context) {
    const globalPermissions = {};
    for (const perm of shares.getGlobalPermissions(context)) {
        globalPermissions[perm] = true;
    }

    return {
        defaultCustomFormValues: await forms.getDefaultCustomFormValues(),
        user: {
            id: context.user.id,
            username: context.user.username,
            namespace: context.user.namespace
        },
        globalPermissions,
        editors: config.editors,
        mosaico: config.mosaico,
        verpEnabled: config.verp.enabled
    }
}


module.exports.getAuthenticatedConfig = getAuthenticatedConfig;
module.exports.getAnonymousConfig = getAnonymousConfig;

