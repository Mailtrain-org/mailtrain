'use strict';

const passport = require('../lib/passport');
const router = require('../lib/router-async').create();
const _ = require('../lib/translate')._;
const namespaces = require('../lib/models/namespaces');
const interoperableErrors = require('../shared/interoperable-errors');

router.all('/rest/*', (req, res, next) => {
    req.needsJSONResponse = true;

    if (!req.user) {
        throw new interoperableErrors.NotLoggedInError();
    }

    next();
});

router.getAsync('/rest/namespaces/:nsId', async (req, res) => {
    const ns = await namespaces.getById(req.params.nsId);
    return res.json(ns);
});

router.postAsync('/rest/namespaces', passport.csrfProtection, async (req, res) => {
    await namespaces.create(req.body);
    return res.json();
});

router.putAsync('/rest/namespaces/:nsId', passport.csrfProtection, async (req, res) => {
    const ns = req.body;
    ns.id = parseInt(req.params.nsId);

    await namespaces.updateWithConsistencyCheck(ns);
    return res.json();
});

router.deleteAsync('/rest/namespaces/:nsId', passport.csrfProtection, async (req, res) => {
    await namespaces.remove(req.params.nsId);
    return res.json();
});

router.getAsync('/rest/namespacesTree', async (req, res) => {
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

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
//    res.setSelectedMenu('namespaces');  FIXME
    next();
});

router.getAsync('/*', passport.csrfProtection, async (req, res) => {
    res.render('react-root', {
        title: _('Namespaces'),
        reactEntryPoint: 'namespaces',
        reactCsrfToken: req.csrfToken()
    });
});

module.exports = router;
