'use strict';

const passport = require('../lib/passport');
const router = require('../lib/router-async').create();
const _ = require('../lib/translate')._;
const users = require('../models/users');
const interoperableErrors = require('../shared/interoperable-errors');


router.all('/rest/*', (req, res, next) => {
    req.needsJSONResponse = true;

    if (!req.user) {
        throw new interoperableErrors.NotLoggedInError();
    }

    next();
});

router.getAsync('/rest/account', async (req, res) => {
    const user = await users.getById(req.user.id);
    return res.json(user);
});

router.postAsync('/rest/account', passport.csrfProtection, async (req, res) => {
    const data = req.body;
    data.id = req.user.id;

    await users.updateWithConsistencyCheck(req.body, true);
    return res.json();
});

router.postAsync('/rest/account-validate', async (req, res) => {
    const data = req.body;
    data.id = req.user.id;

    return res.json(await users.serverValidate(data, true));
});


router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
//    res.setSelectedMenu('users');  FIXME
    next();
});

router.getAsync('/*', passport.csrfProtection, async (req, res) => {
    res.render('react-root', {
        title: _('Account'),
        reactEntryPoint: 'account',
        reactCsrfToken: req.csrfToken()
    });
});


module.exports = router;
