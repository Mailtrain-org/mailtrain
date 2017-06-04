'use strict';

const passport = require('../lib/passport');
const router = require('../lib/router-async').create();
const _ = require('../lib/translate')._;
const namespaces = require('../lib/models/namespaces');
const interoperableErrors = require('../lib/interoperable-errors');

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
   console.log(req.body);
    // await namespaces.create(req.body);
    return res.json();
});

router.putAsync('/rest/namespaces/:nsId', passport.csrfProtection, async (req, res) => {
    console.log(req.body);
    ns = req.body;
    ns.id = req.params.nsId;

    // await namespaces.updateWithConsistencyCheck(ns);
    return res.json();
});

router.deleteAsync('/rest/namespaces/:nsId', passport.csrfProtection, async (req, res) => {
    console.log(req.body);
    // await namespaces.remove(req.params.nsId);
    return res.json();
});

router.getAsync('/rest/namespacesTree', async (req, res) => {
    const entries = {};

    /* Example of roots:
    [
        {title: 'A', key: '1', expanded: true},
        {title: 'B', key: '2', expanded: true, folder: true, children: [
            {title: 'BA', key: '3', expanded: true, folder: true, children: [
                {title: 'BAA', key: '4', expanded: true},
                {title: 'BAB', key: '5', expanded: true}
            ]},
            {title: 'BB', key: '6', expanded: true, folder: true, children: [
                {title: 'BBA', key: '7', expanded: true},
                {title: 'BBB', key: '8', expanded: true}
            ]}
        ]}
    ]
    */
    const roots = [];

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
            if (entries[row.parent]) {
                entries[row.parent] = {
                    children: []
                };
            }

            entries[row.parent].children.push(entry);

        } else {
            roots.push(entry);
        }

        entry.title = row.name;
        entry.key = row.id;
    }

    return res.json(roots);
});

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
//    res.setSelectedMenu('namespaces');
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
