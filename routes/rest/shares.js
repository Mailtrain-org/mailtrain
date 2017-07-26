'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const shares = require('../../models/shares');
const permissions = require('../../lib/permissions')

const router = require('../../lib/router-async').create();

router.postAsync('/shares-table/:entityTypeId/:entityId', passport.loggedIn, async (req, res) => {
    return res.json(await shares.listDTAjax(req.context, req.params.entityTypeId, req.params.entityId, req.body));
});

router.postAsync('/shares-users-table/:entityTypeId/:entityId', passport.loggedIn, async (req, res) => {
    return res.json(await shares.listUnassignedUsersDTAjax(req.context, req.params.entityTypeId, req.params.entityId, req.body));
});

router.putAsync('/shares', passport.loggedIn, async (req, res) => {
    const body = req.body;
    await shares.assign(req.context, body.entityTypeId, body.entityId, body.userId, body.role);

    return res.json();
});

/*
 Checks if entities with a given permission exist.

 Accepts format:
 {
   XXX1: {
     entityTypeId: ...
     requiredOperations: [ ... ]
   },

   XXX2: {
     entityTypeId: ...
     requiredOperations: [ ... ]
   }
 }

 Returns:
 {
   XXX1: true
   XXX2: false
 }
 */
router.postAsync('/permissions-check', passport.loggedIn, async (req, res) => {
    const body = req.body;
    const result = {};

    for (const reqKey in body) {
        if (body[reqKey].entityId) {
            result[reqKey] = await shares.checkEntityPermission(req.context, body[reqKey].entityTypeId, body[reqKey].entityId, body[reqKey].requiredOperations);
        } else {
            result[reqKey] = await shares.checkTypePermission(req.context, body[reqKey].entityTypeId, body[reqKey].requiredOperations);
        }
    }

    return res.json(result);
});

router.postAsync('/permissions-rebuild', passport.loggedIn, async (req, res) => {
    shares.enforceGlobalPermission(req.context, 'rebuildPermissions');
    shares.rebuildPermissions();
    return res.json(result);
});



module.exports = router;