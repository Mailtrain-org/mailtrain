'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const users = require('../../models/users');

const router = require('../../lib/router-async').create();


router.getAsync('/account', passport.loggedIn, async (req, res) => {
    const user = await users.getById(req.user.id);
    return res.json(user);
});

router.postAsync('/account', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const data = req.body;
    data.id = req.user.id;

    await users.updateWithConsistencyCheck(req.body, true);
    return res.json();
});

router.postAsync('/account-validate', passport.loggedIn, async (req, res) => {
    const data = req.body;
    data.id = req.user.id;

    return res.json(await users.serverValidate(data, true));
});

router.getAsync('/access-token', passport.loggedIn, async (req, res) => {
    const accessToken = await users.getAccessToken(req.user.id);
    return res.json(accessToken);

});

router.postAsync('/access-token-reset', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const accessToken = await users.resetAccessToken(req.user.id);
    return res.json(accessToken);
});


router.post('/login', passport.restLogin);
router.post('/logout', passport.restLogout); // TODO - this endpoint is currently not in use. It will become relevant once we switch to SPA

router.postAsync('/password-reset-send', async (req, res) => {
    await users.sendPasswordReset(req.body.username);
    return res.json();
});

router.getAsync('/password-reset-validate', async (req, res) => {
    const isValid = await users.isPasswordResetTokenValid(req.body.username, req.body.resetToken);
    return res.json(isValid);
})

router.getAsync('/password-reset', async (req, res) => {
    await users.resetPassword(req.body.username, req.body.resetToken, req.body.password);
    return res.json();
})


module.exports = router;
