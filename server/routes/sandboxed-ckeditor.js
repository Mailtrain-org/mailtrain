'use strict';

const routerFactory = require('../lib/router-async');
const passport = require('../lib/passport');
const clientHelpers = require('../lib/client-helpers');
const users = require('../models/users');

const files = require('../models/files');
const fileHelpers = require('../lib/file-helpers');

const templates = require('../models/templates');

const contextHelpers = require('../lib/context-helpers');

const { getTrustedUrl, getSandboxUrl, getPublicUrl } = require('../lib/urls');
const { AppType } = require('../../shared/app');


users.registerRestrictedAccessTokenMethod('ckeditor', async ({entityTypeId, entityId}) => {
    if (entityTypeId === 'template') {
        const tmpl = await templates.getById(contextHelpers.getAdminContext(), entityId, false);

        if (tmpl.type === 'ckeditor4') {
            return {
                permissions: {
                    'template': {
                        [entityId]: new Set(['manageFiles', 'view'])
                    }
                }
            };
        }
    }
});


async function getRouter(appType) {
    const router = routerFactory.create();

    if (appType === AppType.SANDBOXED) {
        router.getAsync('/editor', passport.csrfProtection, async (req, res) => {
            const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context, appType);

            res.render('ckeditor/root', {
                layout: 'ckeditor/layout',
                reactCsrfToken: req.csrfToken(),
                mailtrainConfig: JSON.stringify(mailtrainConfig),
                scriptFiles: [
                    getSandboxUrl('client/ckeditor-root.js')
                ],
                publicPath: getSandboxUrl()
            });
        });
    }

    return router;
}

module.exports.getRouter = getRouter;
