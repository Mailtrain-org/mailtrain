'use strict';

let config = require('config');
let express = require('express');
let router = new express.Router();
let templates = require('../lib/models/templates');
let settings = require('../lib/models/settings');
let tools = require('../lib/tools');
let helpers = require('../lib/helpers');
let striptags = require('striptags');
let htmlescape = require('escape-html');
let passport = require('../lib/passport');
let mailer = require('../lib/mailer');
let _ = require('../lib/translate')._;

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('templates');
    next();
});

router.get('/', (req, res) => {
    res.render('templates/templates', {
        title: _('Templates')
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

                data.editors = config.editors || [
                    ['summernote', 'Summernote']
                ];
                data.editors = data.editors.map(ed => {
                    let editor = {
                        name: ed[0],
                        label: ed[1]
                    };
                    if (config[editor.name] && config[editor.name].templates) {
                        editor.templates = config[editor.name].templates.map(tmpl => ({
                            name: tmpl[0],
                            label: tmpl[1]
                        }));
                    }
                    return editor;
                });

                res.render('templates/create', data);
            });
        });
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    templates.create(req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create template'));
            return res.redirect('/templates/create?' + tools.queryParams(req.body));
        }
        req.flash('success', _('Template created'));
        res.redirect('/templates/edit/' + id);
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res, next) => {
    templates.get(req.params.id, (err, template) => {
        if (err || !template) {
            req.flash('danger', err && err.message || err || _('Could not find template with specified ID'));
            return res.redirect('/templates');
        }
        settings.list(['disableWysiwyg'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            helpers.getDefaultMergeTags((err, defaultMergeTags) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/templates');
                }

                template.mergeTags = defaultMergeTags;
                template.csrfToken = req.csrfToken();
                template.useEditor = true;
                template.editorName = template.editorName || 'summernote';
                template.editorConfig = config[template.editorName];
                template.disableWysiwyg = configItems.disableWysiwyg;
                res.render('templates/edit', template);
            });
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    templates.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Template settings updated'));
        } else {
            req.flash('info', _('Template settings not updated'));
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
            req.flash('success', _('Template deleted'));
        } else {
            req.flash('info', _('Could not delete specified template'));
        }

        return res.redirect('/templates');
    });
});

router.post('/ajax', (req, res) => {
    templates.filter(req.body, Number(req.query.parent) || false, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                '<span class="glyphicon glyphicon-file" aria-hidden="true"></span> ' + htmlescape(row.name || ''),
                htmlescape(striptags(row.description) || ''),
                '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/templates/edit/' + row.id + '">' + _('Edit') + '</a>' ]
            )
        });
    });
});

module.exports = router;
