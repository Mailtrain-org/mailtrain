'use strict';

const passport = require('../../lib/passport');
const settings = require('../../models/settings');

const router = require('../../lib/router-async').create();


router.getAsync('/settings', passport.loggedIn, async (req, res) => {
    const configItems = await settings.get(req.context);
    configItems.hash = settings.hash(configItems);
    return res.json(configItems);
});

router.putAsync('/settings', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const configItems = req.body;
    await settings.set(req.context, configItems);
    return res.json();
});


module.exports = router;