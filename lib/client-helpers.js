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
    const roles = {};
    for (const entityTypeId in config.roles) {
        const rolesPerEntityType = {};
        for (const roleId in config.roles[entityTypeId]) {
            const roleSpec = config.roles[entityTypeId][roleId];

            rolesPerEntityType[roleId] = {
                name: roleSpec.name,
                description: roleSpec.description
            }
        }
        roles[entityTypeId] = rolesPerEntityType;
    }


    return {
        userId: context.user.id,
        roles
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

