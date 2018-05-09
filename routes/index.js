'use strict';

const passport = require('../lib/passport');
const _ = require('../lib/translate')._;
const clientHelpers = require('../lib/client-helpers');
const { getTrustedUrl } = require('../lib/urls');

const routerFactory = require('../lib/router-async');

function getRouter(trusted) {
    const router = routerFactory.create();

    if (trusted) {
        router.getAsync('/*', passport.csrfProtection, async (req, res) => {
            const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context, trusted);
            if (req.user) {
                Object.assign(mailtrainConfig, await clientHelpers.getAuthenticatedConfig(req.context));
            }

            res.render('root', {
                reactCsrfToken: req.csrfToken(),
                mailtrainConfig: JSON.stringify(mailtrainConfig),
                scriptFiles: [
                    getTrustedUrl('mailtrain/common.js'),
                    getTrustedUrl('mailtrain/root.js')
                ]
            });
        });
    }

    return router;
}


module.exports = {
    getRouter
};