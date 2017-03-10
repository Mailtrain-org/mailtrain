'use strict';

let config = require('config');
let express = require('express');
let router = new express.Router();
let passport = require('../lib/passport');
let fs = require('fs');
let path = require('path');
let _ = require('../lib/translate')._;
let editorHelpers = require('../lib/editor-helpers');

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

        let getLanguageStrings = language => {
            if (!language ||  language === 'en') {
                return null;
            }
            language = language.split('_')[0];
            try {
                let file = path.join(__dirname, '..', 'public', 'mosaico', 'dist', 'lang', 'mosaico-' + language + '.json');
                return fs.readFileSync(file, 'utf8');
            } catch (err) {
                return null;
            }
        }

        resource.editorName = resource.editorName ||  'mosaico';
        resource.editorData = !resource.editorData ?
            {
                template: req.query.template || 'versafix-1'
            } :
            JSON.parse(resource.editorData);

        res.render('mosaico/editor', {
            layout: 'mosaico/layout-editor',
            type: req.query.type,
            resource,
            editorConfig: config.mosaico,
            languageStrings: getLanguageStrings(config.language),
            csrfToken: req.csrfToken(),
        });
    });
});

module.exports = router;
