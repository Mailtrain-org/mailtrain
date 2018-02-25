'use strict';

const passport = require('../lib/passport');
const _ = require('../lib/translate')._;
const clientHelpers = require('../lib/client-helpers');

const router = require('../lib/router-async').create();

router.getAsync('/*', passport.csrfProtection, async (req, res) => {
    const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context);
    if (req.user) {
        Object.assign(mailtrainConfig, await clientHelpers.getAuthenticatedConfig(req.context));
    }

    res.render('root', {
        reactCsrfToken: req.csrfToken(),
        mailtrainConfig: JSON.stringify(mailtrainConfig)
    });
});


module.exports = router;