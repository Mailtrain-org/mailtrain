'use strict';

const config = require('config');
const router = require('../lib/router-async').create();
const passport = require('../lib/passport');

const bluebird = require('bluebird');
const fsReadFile = bluebird.promisify(require('fs').readFile);

const path = require('path');



let fs = require('fs');
let path = require('path');
let _ = require('../lib/translate')._;
let editorHelpers = require('../lib/editor-helpers');

// FIXME - add authentication by sandboxToken


router.getAsync('/editor', passport.csrfProtection, async (req, res) => {
    const resourceType = req.query.type;
    const resourceId = req.query.id;

    let languageStrings = null;
    if (config.language && config.language !== 'en') {
        const lang = config.language.split('_')[0];
        try {
            const file = path.join(__dirname, '..', 'client', 'public', 'mosaico', 'lang', 'mosaico-' + lang + '.json');
            languageStrings = await fsReadFile(file, 'utf8');
        } catch (err) {
        }
    }

    /* ????
        resource.editorName = resource.editorName ||  'mosaico';
        resource.editorData = !resource.editorData ?
            {
                template: req.query.template || 'versafix-1'
            } :
            JSON.parse(resource.editorData);
    */

    res.render('mosaico/root', {
        layout: 'mosaico/root-layout',
        editorConfig: config.mosaico,
        languageStrings: getLanguageStrings(config.language),
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;
