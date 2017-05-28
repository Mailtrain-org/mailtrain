'use strict';

const passport = require('../lib/passport');
const router = require('../lib/router-async').create();
const _ = require('../lib/translate')._;
const namespaces = require('../lib/models/namespaces');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
//    res.setSelectedMenu('namespaces');
    next();
});

router.getAsync('/', async (req, res) => {
    res.render('react-root', {
        title: _('Namespaces'),
        reactEntryPoint: 'namespaces'
    });
});

router.getAsync('/list/ajax', async (req, res) => {
    const entries = {};
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

router.getAsync('')

module.exports = router;
