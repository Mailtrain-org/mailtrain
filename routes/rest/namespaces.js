'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const namespaces = require('../../models/namespaces');
const interoperableErrors = require('../../shared/interoperable-errors');

const router = require('../../lib/router-async').create();


router.getAsync('/namespaces/:nsId', passport.loggedIn, async (req, res) => {
    const ns = await namespaces.getById(req.params.nsId);

    ns.hash = namespaces.hash(ns);

    return res.json(ns);
});

router.postAsync('/namespaces', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await namespaces.create(req.body);
    return res.json();
});

router.putAsync('/namespaces/:nsId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const ns = req.body;
    ns.id = parseInt(req.params.nsId);

    await namespaces.updateWithConsistencyCheck(ns);
    return res.json();
});

router.deleteAsync('/namespaces/:nsId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await namespaces.remove(req.params.nsId);
    return res.json();
});

router.getAsync('/namespaces-tree', passport.loggedIn, async (req, res) => {
    const entries = {};
    let root; // Only the Root namespace is without a parent
    const rows = await namespaces.list();

    for (let row of rows) {
        let entry;
        if (!entries[row.id]) {
            entry = {
                children: []
            };
            entries[row.id] = entry;
        } else {
            entry = entries[row.id];
        }

        if (row.parent) {
            if (!entries[row.parent]) {
                entries[row.parent] = {
                    children: []
                };
            }

            entries[row.parent].children.push(entry);

        } else {
            root = entry;
        }

        entry.title = row.name;
        entry.key = row.id;
    }

    return res.json(root);
});


module.exports = router;
