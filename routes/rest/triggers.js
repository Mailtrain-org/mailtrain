'use strict';

const passport = require('../../lib/passport');
const triggers = require('../../models/triggers');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.postAsync('/triggers-by-campaign-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await triggers.listByCampaignDTAjax(req.context, castToInteger(req.params.campaignId), req.body));
});

router.postAsync('/triggers-by-list-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await triggers.listByListDTAjax(req.context, castToInteger(req.params.listId), req.body));
});

router.getAsync('/triggers/:campaignId/:triggerId', passport.loggedIn, async (req, res) => {
    const entity = await triggers.getById(req.context, castToInteger(req.params.campaignId), req.params.triggerId);
    entity.hash = triggers.hash(entity);
    return res.json(entity);
});

router.postAsync('/triggers/:campaignId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await triggers.create(req.context, castToInteger(req.params.campaignId), req.body));
});

router.putAsync('/triggers/:campaignId/:triggerId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = castToInteger(req.params.triggerId);

    await triggers.updateWithConsistencyCheck(req.context, castToInteger(req.params.campaignId), entity);
    return res.json();
});

router.deleteAsync('/triggers/:campaignId/:triggerId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await triggers.remove(req.context, castToInteger(req.params.campaignId), castToInteger(req.params.triggerId));
    return res.json();
});

module.exports = router;