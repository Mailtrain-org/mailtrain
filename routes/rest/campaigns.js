'use strict';

const passport = require('../../lib/passport');
const campaigns = require('../../models/campaigns');

const router = require('../../lib/router-async').create();


router.postAsync('/campaigns-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listDTAjax(req.context, req.body));
});

router.getAsync('/campaigns/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, req.params.campaignId);
    campaign.hash = campaigns.hash(campaign);
    return res.json(campaign);
});

router.postAsync('/campaigns', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.create(req.context, req.body));
});

router.putAsync('/campaigns/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.campaignId);

    await campaigns.updateWithConsistencyCheck(req.context, entity);
    return res.json();
});

router.deleteAsync('/campaigns/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await campaigns.remove(req.context, req.params.campaignId);
    return res.json();
});


module.exports = router;