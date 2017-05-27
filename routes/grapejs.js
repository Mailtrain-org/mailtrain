'use strict';

const config = require('config');
const express = require('express');
const router = new express.Router();
const passport = require('../lib/passport');
const _ = require('../lib/translate')._;
const fs = require('fs');
const path = require('path');
const editorHelpers = require('../lib/editor-helpers')

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    next();
});

router.get('/editor', passport.csrfProtection, (req, res) => {
    editorHelpers.getResource(req.query.type, req.query.id, (err, resource) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        try {
            resource.editorData = JSON.parse(resource.editorData);
        } catch (err) {
            resource.editorData = {
                template: req.query.template || 'demo'
            }
        }

        if (!resource.html && !resource.editorData.html && !resource.editorData.mjml) {
            const base = path.join(__dirname, '..', 'public', 'grapejs', 'templates', resource.editorData.template);
            try {
                resource.editorData.mjml = fs.readFileSync(path.join(base, 'index.mjml'), 'utf8');
            } catch (err) {
                try {
                    resource.html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
                } catch (err) {
                    resource.html = err.message || err;
                }
            }
        }

        res.render('grapejs/editor', {
            layout: 'grapejs/layout-editor',
            type: req.query.type,
            stringifiedResource: JSON.stringify(resource),
            resource,
            editor: {
                name: resource.editorName || 'grapejs',
                mode: resource.editorData.mjml ? 'mjml' : 'html',
                config: config.grapejs
            },
            csrfToken: req.csrfToken()
        });
    });
});

module.exports = router;
