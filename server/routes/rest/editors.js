'use strict';

const passport = require('../../lib/passport');

const bluebird = require('bluebird');
const premailerApi = require('premailer-api');
const premailerPrepareAsync = bluebird.promisify(premailerApi.prepare);

const router = require('../../lib/router-async').create();

router.postAsync('/html-to-text', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    if (!req.body.html) {
        return res.json({text: ''}); // Premailer crashes very hard when html is empty
    }

    const email = await premailerPrepareAsync({
        html: req.body.html,
        fetchHTML: false
    });

    res.json({text: email.text.replace(/%5B/g, '[').replace(/%5D/g, ']')});

});

module.exports = router;
