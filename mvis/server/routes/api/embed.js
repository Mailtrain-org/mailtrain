'use strict';

const passport = require('../../../ivis-core/server/lib/passport');
const shares = require('../../../ivis-core/server/models/shares');
const users = require('../../../ivis-core/server/models/users');
const {castToInteger} = require('../../../ivis-core/server/lib/helpers');
const knex = require('../../../ivis-core/server/lib/knex');
const urls = require('../../../ivis-core/server/lib/urls');
const contextHelpers = require('../../../ivis-core/server/lib/context-helpers');

const router = require('../../../ivis-core/server/lib/router-async').create();

router.getAsync('/mt-embedded-panel/:mtUserId/:panelId', passport.loggedIn, async (req, res) => {
    const panelId = castToInteger(req.params.panelId);
    const mtUserId = castToInteger(req.params.mtUserId);
    const userName = `mt-user-${mtUserId}`;
    const user = await users.getByUsername(req.context, userName);

    const restrictedAccessToken = await users.getRestrictedAccessToken(req.context, 'panel', {panelId, renewableBySandbox: true}, user.id);

    return res.json({
        token: restrictedAccessToken,
        ivisSandboxUrlBase: urls.getSandboxUrlBase()
    });
});

module.exports = router;
