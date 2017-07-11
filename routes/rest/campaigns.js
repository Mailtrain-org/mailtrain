'use strict';

const passport = require('../../lib/passport');
const campaigns = require('../../models/campaigns');

const router = require('../../lib/router-async').create();


router.postAsync('/campaigns-table', passport.loggedIn, async (req, res) => {
    return res.json(await campaigns.listDTAjax(req.body));
});


module.exports = router;