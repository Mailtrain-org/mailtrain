'use strict';

const passport = require('../../lib/passport');
const blacklist = require('../../models/blacklist');

const router = require('../../lib/router-async').create();


router.postAsync('/blacklist-table', passport.loggedIn, async (req, res) => {
    return res.json(await blacklist.listDTAjax(req.context, req.body));
});

router.postAsync('/blacklist', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await blacklist.add(req.context, req.body.email));
});

router.deleteAsync('/blacklist/:email', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await blacklist.remove(req.context, req.params.email);
    return res.json();
});

router.postAsync('/blacklist-validate', passport.loggedIn, async (req, res) => {
    return res.json(await blacklist.serverValidate(req.context, req.body));
});

module.exports = router;