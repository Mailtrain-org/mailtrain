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


users.registerRestrictedAccessTokenMethod('grapesjs', async ({entityTypeId, entityId}) => {
    if (entityTypeId === 'template') {
        const tmpl = await templates.getById(contextHelpers.getAdminContext(), entityId, false);

        if (tmpl.type === 'grapesjs') {
            return {
                permissions: {
                    'template': {
                        [entityId]: new Set(['viewFiles', 'manageFiles', 'view'])
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

            res.render('grapesjs/root', {
                layout: 'grapesjs/layout',
                reactCsrfToken: req.csrfToken(),
                mailtrainConfig: JSON.stringify(mailtrainConfig),
                scriptFiles: [
                    getSandboxUrl('client/grapesjs-root.js')
                ],
                publicPath: getSandboxUrl()
            });
        });

        fileHelpers.installUploadHandler(router, '/upload/:type/:entityId', files.ReplacementBehavior.RENAME, null, 'file', resp => {
            return {
                data: resp.files.map( f => ({type: 'image', src: f.url}) )
            };
        });

    }

    return router;
}

module.exports.getRouter = getRouter;
