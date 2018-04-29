'use strict';

const passport = require('../../lib/passport');
const sendConfigurations = require('../../models/send-configurations');

const router = require('../../lib/router-async').create();


router.getAsync('/send-configurations/:sendConfigurationId', passport.loggedIn, async (req, res) => {
    const sendConfiguration = await sendConfigurations.getById(req.context, req.params.sendConfigurationId);
    sendConfiguration.hash = sendConfigurations.hash(sendConfiguration);
    return res.json(sendConfiguration);
});

router.postAsync('/send-configurations', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await sendConfigurations.create(req.context, req.body));
});

router.putAsync('/send-configurations/:sendConfigurationId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const sendConfiguration = req.body;
    sendConfiguration.id = parseInt(req.params.sendConfigurationId);

    await sendConfigurations.updateWithConsistencyCheck(req.context, sendConfiguration);
    return res.json();
});

router.deleteAsync('/send-configurations/:sendConfigurationId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await sendConfigurations.remove(req.context, req.params.sendConfigurationId);
    return res.json();
});

router.postAsync('/send-configurations-table', passport.loggedIn, async (req, res) => {
    return res.json(await sendConfigurations.listDTAjax(req.context, req.body));
});

module.exports = router;