'use strict';

const passport = require('./passport');
const config = require('./config');
const forms = require('../models/forms');
const shares = require('../models/shares');
const urls = require('./urls');
const settings = require('../models/settings');
const contextHelpers = require('./context-helpers');


async function getAnonymousConfig(context, appType) {
    return {
        authMethod: passport.authMethod,
        isAuthMethodLocal: passport.isAuthMethodLocal,
        externalPasswordResetLink: config.ldap.passwordresetlink,
        defaultLanguage: config.defaultLanguage,
        enabledLanguages: config.enabledLanguages,
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

    const setts = await settings.get(contextHelpers.getAdminContext(), ['mapsApiKey', 'shoutout']);

    return {
        defaultCustomFormValues: await forms.getDefaultCustomFormValues(),
        user: {
            id: context.user.id,
            username: context.user.username,
            namespace: context.user.namespace
        },
        globalPermissions,
        editors: config.editors,
        tagLanguages: config.tagLanguages,
        mosaico: config.mosaico,
        verpEnabled: config.verp.enabled,
        reportsEnabled: config.reports.enabled,
        mapsApiKey: setts.mapsApiKey,
        builtinZoneMTAEnabled: config.builtinZoneMTA.enabled,
        shoutout: setts.shoutout
    }
}


module.exports.getAuthenticatedConfig = getAuthenticatedConfig;
module.exports.getAnonymousConfig = getAnonymousConfig;

