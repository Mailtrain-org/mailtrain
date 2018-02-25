'use strict';

const config = require('config');
const router = require('../lib/router-async').create();
const passport = require('../lib/passport');
const clientHelpers = require('../lib/client-helpers');

const bluebird = require('bluebird');
const fsReadFile = bluebird.promisify(require('fs').readFile);

const path = require('path');

// FIXME - add authentication by sandboxToken


router.getAsync('/editor', passport.csrfProtection, async (req, res) => {
    const resourceType = req.query.type;
    const resourceId = req.query.id;

    const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context);

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
        layout: 'mosaico/layout',
        editorConfig: config.mosaico,
        languageStrings: languageStrings,
        reactCsrfToken: req.csrfToken(),
        mailtrainConfig: JSON.stringify(mailtrainConfig)
    });
});

module.exports = router;
