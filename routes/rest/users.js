'use strict';

const config = require('config');
const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const users = require('../../models/users');
const shares = require('../../models/shares');

const router = require('../../lib/router-async').create();


router.getAsync('/users/:userId', passport.loggedIn, async (req, res) => {
    const user = await users.getById(req.context, req.params.userId);
    user.hash = users.hash(user);
    return res.json(user);
});

router.postAsync('/users', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await users.create(req.body);
    return res.json();
});

router.putAsync('/users/:userId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const user = req.body;
    user.id = parseInt(req.params.userId);

    await users.updateWithConsistencyCheck(user);
    return res.json();
});

router.deleteAsync('/users/:userId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await users.remove(req.context, req.params.userId);
    return res.json();
});

router.postAsync('/users-validate', passport.loggedIn, async (req, res) => {
    return res.json(await users.serverValidate(req.context, req.body));
});

router.postAsync('/users-table', passport.loggedIn, async (req, res) => {
    return res.json(await users.listDTAjax(req.context, req.body));
});


module.exports = router;