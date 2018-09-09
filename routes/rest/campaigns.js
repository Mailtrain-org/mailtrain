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

router.postAsync('/campaigns-test-users-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listTestUsersDTAjax(req.context, req.params.campaignId, req.body));
});

router.getAsync('/campaigns-settings/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, req.params.campaignId, true, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    campaign.hash = campaigns.hash(campaign, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    return res.json(campaign);
});

router.getAsync('/campaigns-stats/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, req.params.campaignId, true, campaigns.Content.SETTINGS_WITH_STATS);
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

router.postAsync('/campaign-start/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.start(req.context, req.params.campaignId, null));
});

router.postAsync('/campaign-start-at/:campaignId/:dateTime', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.start(req.context, req.params.campaignId, new Date(req.params.dateTime)));
});


router.postAsync('/campaign-stop/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.stop(req.context, req.params.campaignId));
});

router.postAsync('/campaign-reset/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.reset(req.context, req.params.campaignId));
});

module.exports = router;