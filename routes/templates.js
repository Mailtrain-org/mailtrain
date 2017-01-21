'use strict';

let express = require('express');
let router = new express.Router();
let templates = require('../lib/models/templates');
let settings = require('../lib/models/settings');
let tools = require('../lib/tools');
let striptags = require('striptags');
let passport = require('../lib/passport');
let mailer = require('../lib/mailer');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', 'Need to be logged in to access restricted content');
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('templates');
    next();
});

router.get('/', (req, res) => {
    let limit = 999999999;
    let start = 0;

    templates.list(start, limit, (err, rows, total) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        res.render('templates/templates', {
            rows: rows.map((row, i) => {
                row.index = start + i + 1;
                row.description = striptags(row.description);
                return row;
            }),
            total
        });
    });
});

router.get('/create', passport.csrfProtection, (req, res, next) => {
    let data = tools.convertKeys(req.query, {
        skip: ['layout']
    });

    data.csrfToken = req.csrfToken();
    data.useEditor = true;

    settings.list(['defaultPostaddress', 'defaultSender', 'disableWysiwyg'], (err, configItems) => {
        if (err) {
            return next(err);
        }

        mailer.getTemplate('emails/stationery-html.hbs', (err, rendererHtml) => {
            if (err) {
                return next(err);
            }

            mailer.getTemplate('emails/stationery-text.hbs', (err, rendererText) => {
                if (err) {
                    return next(err);
                }

                data.html = data.html || rendererHtml(configItems);
                data.text = data.text || rendererText(configItems);
                data.disableWysiwyg = configItems.disableWysiwyg;

                res.render('templates/create', data);
            });
        });
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    templates.create(req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || 'Could not create template');
            return res.redirect('/templates/create?' + tools.queryParams(req.body));
        }
        req.flash('success', 'Template created');
        res.redirect('/templates');
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res, next) => {
    templates.get(req.params.id, (err, template) => {
        if (err || !template) {
            req.flash('danger', err && err.message || err || 'Could not find template with specified ID');
            return res.redirect('/templates');
        }
        settings.list(['disableWysiwyg'], (err, configItems) => {
            if (err) {
                return next(err);
            }
            template.csrfToken = req.csrfToken();
            template.useEditor = true;
            template.disableWysiwyg = configItems.disableWysiwyg;
            res.render('templates/edit', template);
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    templates.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', 'Template settings updated');
        } else {
            req.flash('info', 'Template settings not updated');
        }

        if (req.body.id) {
            return res.redirect('/templates/edit/' + encodeURIComponent(req.body.id));
        } else {
            return res.redirect('/templates');
        }
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    templates.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', 'Template deleted');
        } else {
            req.flash('info', 'Could not delete specified template');
        }

        return res.redirect('/templates');
    });
});

module.exports = router;
