'use strict';

let config = require('config');
let express = require('express');
let router = new express.Router();
let passport = require('../lib/passport');
let fs = require('fs');
let path = require('path');
let editorHelpers = require('../lib/editor-helpers.js')

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

        resource.editorName = resource.editorName ||  'grapejs';
        resource.editorData = !resource.editorData ?
            {
                template: req.query.template || 'demo'
            } :
            JSON.parse(resource.editorData);

        if (!resource.html && !resource.editorData.html) {
            try {
                let file = path.join(__dirname, '..', 'public', 'grapejs', 'templates', resource.editorData.template, 'index.html');
                resource.html = fs.readFileSync(file, 'utf8');
            } catch (err) {
                resource.html = err.message || err;
            }
        }

        res.render('grapejs/editor', {
            layout: 'grapejs/layout-editor',
            type: req.query.type,
            resource,
            editorConfig: config.grapejs,
            csrfToken: req.csrfToken(),
        });
    });
});

module.exports = router;
