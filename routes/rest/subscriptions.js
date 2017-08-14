'use strict';

const passport = require('../../lib/passport');
const subscriptions = require('../../models/subscriptions');

const router = require('../../lib/router-async').create();


router.postAsync('/subscriptions-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await subscriptions.listDTAjax(req.context, req.params.listId, req.body));
});


module.exports = router;