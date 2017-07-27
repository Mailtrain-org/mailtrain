'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const namespaces = require('../../models/namespaces');

const router = require('../../lib/router-async').create();


router.getAsync('/namespaces/:nsId', passport.loggedIn, async (req, res) => {
    const ns = await namespaces.getById(req.context, req.params.nsId);

    ns.hash = namespaces.hash(ns);

    return res.json(ns);
});

router.postAsync('/namespaces', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await namespaces.create(req.context, req.body);
    return res.json();
});

router.putAsync('/namespaces/:nsId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const ns = req.body;
    ns.id = parseInt(req.params.nsId);

    await namespaces.updateWithConsistencyCheck(req.context, ns);
    return res.json();
});

router.deleteAsync('/namespaces/:nsId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await namespaces.remove(req.context, req.params.nsId);
    return res.json();
});

router.getAsync('/namespaces-tree', passport.loggedIn, async (req, res) => {

    const tree = await namespaces.listTree(req.context);

    return res.json(tree);
});


module.exports = router;
