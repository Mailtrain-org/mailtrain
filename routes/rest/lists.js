'use strict';

const passport = require('../../lib/passport');
const lists = require('../../models/lists');

const router = require('../../lib/router-async').create();


router.postAsync('/lists-table', passport.loggedIn, async (req, res) => {
    return res.json(await lists.listDTAjax(req.body));
});


module.exports = router;