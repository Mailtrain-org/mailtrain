'use strict';

const express = require('express');
const passport = require('../lib/passport');
const router = new express.Router();
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

router.get('/', (req, res) => {
    res.render('namespaces/namespaces', {
        title: _('Namespaces'),
        useFancyTree: true
    });
});

router.get('/list/ajax', (req, res, next) => {
    const entries = {};
    const roots = [];

    namespaces.list().then(rows => {
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

        console.log(roots);
        return res.json(roots);

    }).catch(err => {
        return res.json({
            error: err.message || err,
        });
    });
});

module.exports = router;
