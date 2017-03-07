'use strict';

let express = require('express');
let router = new express.Router();
let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let tools = require('../lib/tools');
let passport = require('../lib/passport');
let _ = require('../lib/translate')._;

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('lists');
    next();
});

router.get('/:list', (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        fields.list(list.id, (err, rows) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/fields/' + encodeURIComponent(req.params.list));
            }

            let index = 0;
            res.render('lists/fields/fields', {
                rows: rows.map(row => {
                    row.index = ++index;
                    row.type = fields.types[row.type];
                    if (Array.isArray(row.options)) {
                        row.options.forEach(option => {
                            option.index = ++index;
                        });
                    }
                    return row;
                }),
                list
            });
        });
    });
});

router.get('/:list/create', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        fields.list(list.id, (err, rows) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/fields/' + encodeURIComponent(req.params.list));
            }

            let data = tools.convertKeys(req.query, {
                skip: ['layout']
            });

            data.csrfToken = req.csrfToken();
            data.list = list;

            if (data.type) {
                data['selected' + (data.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())] = true;
            }

            if (!('visible' in data) && !data.name) {
                data.visible = true;
            }

            data.groups = rows.filter(row => fields.grouped.indexOf(row.type) >= 0).map(row => {
                row.selected = Number(req.query.group) === row.id;
                return row;
            });

            res.render('lists/fields/create', data);
        });
    });
});

router.post('/:list/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    fields.create(req.params.list, req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create custom field'));
            return res.redirect('/fields/' + encodeURIComponent(req.params.list) + '/create?' + tools.queryParams(req.body));
        }
        req.flash('success', 'Custom field created');
        res.redirect('/fields/' + encodeURIComponent(req.params.list));
    });
});

router.get('/:list/edit/:field', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        fields.get(req.params.field, (err, field) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/fields/' + encodeURIComponent(req.params.list));
            }

            if (!field) {
                req.flash('danger', _('Selected field not found'));
                return res.redirect('/fields/' + encodeURIComponent(req.params.list));
            }

            let data = {
                csrfToken: req.csrfToken(),
                field,
                list
            };

            if (field.type) {
                data['selected' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())] = true;
            }

            fields.list(list.id, (err, rows) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/fields/' + encodeURIComponent(req.params.list));
                }

                data.groups = field.type === 'option' ? rows.filter(row => fields.grouped.indexOf(row.type) >= 0).map(row => {
                    row.selected = Number(field.group) === row.id;
                    return row;
                }) : false;

                res.render('lists/fields/edit', data);
            });
        });
    });
});

router.post('/:list/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    fields.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Field settings updated'));
        } else {
            req.flash('info', _('Field settings not updated'));
        }

        if (req.body.id) {
            return res.redirect('/fields/' + encodeURIComponent(req.params.list) + '/edit/' + encodeURIComponent(req.body.id));
        } else {
            return res.redirect('/fields/' + encodeURIComponent(req.params.list));
        }
    });
});

router.post('/:list/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    fields.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Custom field deleted'));
        } else {
            req.flash('info', _('Could not delete specified field'));
        }

        return res.redirect('/fields/' + encodeURIComponent(req.params.list));
    });
});

module.exports = router;
