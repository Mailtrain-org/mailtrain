'use strict';

const passport = require('../lib/passport');
const clientHelpers = require('../lib/client-helpers');
const { getTrustedUrl } = require('../lib/urls');
const { AppType } = require('../../shared/app');

const routerFactory = require('../lib/router-async');

async function getRouter(appType) {
    const router = routerFactory.create();

    if (appType === AppType.TRUSTED) {
        router.getAsync('/*', passport.csrfProtection, async (req, res) => {
            const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context, appType);
            if (req.user) {
                Object.assign(mailtrainConfig, await clientHelpers.getAuthenticatedConfig(req.context));
            }

            res.render('root', {
                reactCsrfToken: req.csrfToken(),
                mailtrainConfig: JSON.stringify(mailtrainConfig),
                scriptFiles: [
                    getTrustedUrl('client/root.js')
                ],
                publicPath: getTrustedUrl()
            });
        });
    }

    return router;
}


module.exports.getRouter = getRouter;
