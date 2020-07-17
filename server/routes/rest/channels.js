'use strict';

const passport = require('../../lib/passport');
const channels = require('../../models/channels');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.postAsync('/channels-table', passport.loggedIn, async (req, res) => {
    return res.json(await channels.listDTAjax(req.context, req.body));
});

router.postAsync('/channels-with-create-campaign-permission-table', passport.loggedIn, async (req, res) => {
    return res.json(await channels.listWithCreateCampaignPermissionDTAjax(req.context, req.body));
});

router.getAsync('/channels/:channelId', passport.loggedIn, async (req, res) => {
    const channel = await channels.getById(req.context, castToInteger(req.params.channelId), true);
    channel.hash = channels.hash(channel);
    return res.json(channel);
});

router.postAsync('/channels', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await channels.create(req.context, req.body));
});

router.putAsync('/channels/:channelId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = castToInteger(req.params.channelId);

    await channels.updateWithConsistencyCheck(req.context, entity);
    return res.json();
});

router.deleteAsync('/channels/:channelId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await channels.remove(req.context, castToInteger(req.params.channelId));
    return res.json();
});


module.exports = router;