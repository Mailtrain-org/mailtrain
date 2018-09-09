'use strict';

const passport = require('../../lib/passport');
const lists = require('../../models/lists');

const router = require('../../lib/router-async').create();


router.postAsync('/lists-table', passport.loggedIn, async (req, res) => {
    return res.json(await lists.listDTAjax(req.context, req.body));
});

router.postAsync('/lists-with-segment-by-campaign-table/:campaignId', passport.loggedIn, async (req, res) => {
    return res.json(await lists.listWithSegmentByCampaignDTAjax(req.context, req.params.campaignId, req.body));
});

router.getAsync('/lists/:listId', passport.loggedIn, async (req, res) => {
    const list = await lists.getByIdWithListFields(req.context, req.params.listId);
    list.hash = lists.hash(list);
    return res.json(list);
});

router.postAsync('/lists', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await lists.create(req.context, req.body));
});

router.putAsync('/lists/:listId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.listId);

    await lists.updateWithConsistencyCheck(req.context, entity);
    return res.json();
});

router.deleteAsync('/lists/:listId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await lists.remove(req.context, req.params.listId);
    return res.json();
});


module.exports = router;