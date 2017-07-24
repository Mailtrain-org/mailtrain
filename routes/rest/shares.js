'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const shares = require('../../models/shares');
const permissions = require('../../lib/permissions')

const router = require('../../lib/router-async').create();

router.postAsync('/shares-table/:entityTypeId/:entityId', passport.loggedIn, async (req, res) => {
    return res.json(await shares.listDTAjax(req.params.entityTypeId, req.params.entityId, req.body));
});

router.postAsync('/shares-users-table/:entityTypeId/:entityId', passport.loggedIn, async (req, res) => {
    return res.json(await shares.listUnassignedUsersDTAjax(req.params.entityTypeId, req.params.entityId, req.body));
});

router.putAsync('/shares', passport.loggedIn, async (req, res) => {
    // FIXME: Check that the user has the right to assign the role

    const body = req.body;
    await shares.assign(body.entityTypeId, body.entityId, body.userId, body.role);

    return res.json();
});

module.exports = router;