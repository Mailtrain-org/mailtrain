'use strict';

const passport = require('../lib/passport');
const router = require('../lib/router-async').create();
const _ = require('../lib/translate')._;
const users = require('../models/users');
const interoperableErrors = require('../shared/interoperable-errors');
const tools = require('../lib/tools-async');


router.all('/rest/*', (req, res, next) => {
    req.needsJSONResponse = true;

    if (!req.user) {
        throw new interoperableErrors.NotLoggedInError();
    }

    next();
});

router.getAsync('/rest/users/:userId', async (req, res) => {
    const user = await users.getById(req.params.userId);
    return res.json(user);
});

router.postAsync('/rest/users', passport.csrfProtection, async (req, res) => {
    await users.create(req.body);
    return res.json();
});

router.putAsync('/rest/users/:userId', passport.csrfProtection, async (req, res) => {
    const user = req.body;
    user.id = parseInt(req.params.userId);

    await users.updateWithConsistencyCheck(user);
    return res.json();
});

router.deleteAsync('/rest/users/:userId', passport.csrfProtection, async (req, res) => {
    await users.remove(req.params.userId);
    return res.json();
});

router.postAsync('/rest/validate', async (req, res) => {
    const data = {};

    if (req.body.username) {
        data.username = {};

        try {
            await users.getByUsername(req.body.username);
            data.username.exists = true;
        } catch (error) {
            if (error instanceof interoperableErrors.NotFoundError) {
                data.username.exists = false;
            } else {
                throw error;
            }
        }
    }

    if (req.body.email) {
        data.email = {};

        try {
            await tools.validateEmail(req.body.email);
            data.email.invalid = false;
        } catch (error) {
            console.log(error);
            data.email.invalid = true;
        }
    }

    return res.json(data);
});


router.postAsync('/rest/usersTable', async (req, res) => {
    return res.json(await users.listDTAjax(req.body));
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
        title: _('Users'),
        reactEntryPoint: 'users',
        reactCsrfToken: req.csrfToken()
    });
});


module.exports = router;
