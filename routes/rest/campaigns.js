'use strict';

const passport = require('../../lib/passport');
const campaigns = require('../../models/campaigns');

const router = require('../../lib/router-async').create();


router.postAsync('/campaigns-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listDTAjax(req.context, req.body));
});

router.postAsync('/campaigns-with-content-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listWithContentDTAjax(req.context, req.body));
});

router.postAsync('/campaigns-others-by-list-table/:campaignId/:listIds', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listOthersWhoseListsAreIncludedDTAjax(req.context, req.params.campaignId, req.params.listIds.split(';'), req.body));
});


router.getAsync('/campaigns-settings/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, req.params.campaignId, true, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    campaign.hash = campaigns.hash(campaign, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    return res.json(campaign);
});

router.getAsync('/campaigns-content/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, req.params.campaignId, true, campaigns.Content.ONLY_SOURCE_CUSTOM);
    campaign.hash = campaigns.hash(campaign, campaigns.Content.ONLY_SOURCE_CUSTOM);
    return res.json(campaign);
});

router.postAsync('/campaigns', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.create(req.context, req.body));
});

router.putAsync('/campaigns-settings/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.campaignId);

    await campaigns.updateWithConsistencyCheck(req.context, entity, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    return res.json();
});

router.putAsync('/campaigns-content/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.campaignId);

    await campaigns.updateWithConsistencyCheck(req.context, entity, campaigns.Content.ONLY_SOURCE_CUSTOM);
    return res.json();
});

router.deleteAsync('/campaigns/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await campaigns.remove(req.context, req.params.campaignId);
    return res.json();
});


module.exports = router;