'use strict';

const passport = require('../../lib/passport');
const users = require('../../models/users');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.getAsync('/users/:userId', passport.loggedIn, async (req, res) => {
    const user = await users.getById(req.context, castToInteger(req.params.userId));
    user.hash = users.hash(user);
    return res.json(user);
});

router.postAsync('/users', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await users.create(req.context, req.body));
});

router.putAsync('/users/:userId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const user = req.body;
    user.id = castToInteger(req.params.userId);

    await users.updateWithConsistencyCheck(req.context, user);
    return res.json();
});

router.deleteAsync('/users/:userId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await users.remove(req.context, castToInteger(req.params.userId));
    return res.json();
});

router.postAsync('/users-validate', passport.loggedIn, async (req, res) => {
    return res.json(await users.serverValidate(req.context, req.body));
});

router.postAsync('/users-table', passport.loggedIn, async (req, res) => {
    return res.json(await users.listDTAjax(req.context, req.body));
});


module.exports = router;