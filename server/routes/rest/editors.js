'use strict';

const passport = require('../../lib/passport');

const bluebird = require('bluebird');
const htmlToText = require('html-to-text');

const router = require('../../lib/router-async').create();

router.postAsync('/html-to-text', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const email = htmlToText.fromString(req.body.html, {wordwrap: 130});

    res.json({text: email});
});

module.exports = router;
