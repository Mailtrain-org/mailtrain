'use strict';

const passport = require('../../lib/passport');
const campaigns = require('../../models/campaigns');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.postAsync('/campaigns-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listDTAjax(req.context, req.body));
});

router.postAsync('/campaigns-by-channel-table/:channelId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listByChannelDTAjax(req.context, castToInteger(req.params.channelId), req.body));
});

router.postAsync('/campaigns-with-content-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listWithContentDTAjax(req.context, req.body));
});

router.postAsync('/campaigns-others-by-list-table/:campaignId/:listIds', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listOthersWhoseListsAreIncludedDTAjax(req.context, castToInteger(req.params.campaignId), req.params.listIds.split(';').map(x => castToInteger(x)), req.body));
});

router.postAsync('/campaigns-by-namespace-table/:namespaceId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listByNamespaceDTAjax(req.context, castToInteger(req.params.namespaceId), req.body));
});

router.postAsync('/campaigns-children/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listChildrenDTAjax(req.context, castToInteger(req.params.campaignId), req.body));
});

router.postAsync('/campaigns-test-users-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listTestUsersDTAjax(req.context, castToInteger(req.params.campaignId), req.body));
});

router.getAsync('/campaigns-settings/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, castToInteger(req.params.campaignId), true, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    campaign.hash = campaigns.hash(campaign, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    return res.json(campaign);
});

router.getAsync('/campaigns-stats/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, castToInteger(req.params.campaignId), true, campaigns.Content.SETTINGS_WITH_STATS);
    return res.json(campaign);
});

router.getAsync('/campaigns-content/:campaignId', passport.loggedIn, async (req, res) => {
    const campaign = await campaigns.getById(req.context, castToInteger(req.params.campaignId), true, campaigns.Content.ONLY_SOURCE_CUSTOM);
    campaign.hash = campaigns.hash(campaign, campaigns.Content.ONLY_SOURCE_CUSTOM);
    return res.json(campaign);
});

router.postAsync('/campaigns', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.create(req.context, req.body));
});

router.putAsync('/campaigns-settings/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = castToInteger(req.params.campaignId);

    await campaigns.updateWithConsistencyCheck(req.context, entity, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
    return res.json();
});

router.putAsync('/campaigns-content/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = castToInteger(req.params.campaignId);

    await campaigns.updateWithConsistencyCheck(req.context, entity, campaigns.Content.ONLY_SOURCE_CUSTOM);
    return res.json();
});

router.deleteAsync('/campaigns/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await campaigns.remove(req.context, castToInteger(req.params.campaignId));
    return res.json();
});

router.postAsync('/campaign-start/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.start(req.context, castToInteger(req.params.campaignId), {startAt: null}));
});

router.postAsync('/campaign-start-at/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const startAt = new Date(req.body.startAt);
    const timezone = req.body.timezone;
    return res.json(await campaigns.start(req.context, castToInteger(req.params.campaignId), {startAt, timezone}));
});


router.postAsync('/campaign-stop/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.stop(req.context, castToInteger(req.params.campaignId)));
});

router.postAsync('/campaign-reset/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.reset(req.context, castToInteger(req.params.campaignId)));
});

router.postAsync('/campaign-enable/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.enable(req.context, castToInteger(req.params.campaignId), null));
});

router.postAsync('/campaign-disable/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await campaigns.disable(req.context, castToInteger(req.params.campaignId), null));
});

router.getAsync('/campaign-statistics/:campaignId/opened', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.getStatisticsOpened(req.context, castToInteger(req.params.campaignId)));
});

router.postAsync('/campaigns-subscribers-by-status-table/:campaignId/:status', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listSentByStatusDTAjax(req.context, castToInteger(req.params.campaignId), castToInteger(req.params.status), req.body));
});

router.postAsync('/campaigns-opens-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listOpensDTAjax(req.context, castToInteger(req.params.campaignId), req.body));
});

router.postAsync('/campaigns-link-clicks-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listLinkClicksDTAjax(req.context, castToInteger(req.params.campaignId), req.body));
});

router.postAsync('/campaign-test-send', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const data = req.body;
    const result = await campaigns.testSend(req.context, data);
    return res.json(result);
});



module.exports = router;