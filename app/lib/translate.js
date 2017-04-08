'use strict';

const config = require('config');

const Gettext = require('node-gettext');
const gt = new Gettext();
const fs = require('fs');
const path = require('path');
const log = require('npmlog');
const gettextParser = require('gettext-parser');
const fakelang = require('./fakelang');

const language = config.language || 'en';

[].concat(config.language || []).forEach(lang => {
    let data;
    let file = path.join(__dirname, '..', 'languages', lang + '.mo');
    try {
        data = gettextParser.mo.parse(fs.readFileSync(file));
    } catch (E) {
        // ignore
    }
    if (data) {
        gt.addTranslations(lang, lang, data);
        gt.setTextDomain(lang);
        gt.setLocale(lang);
        log.info('LANG', 'Loaded language file for %s', lang);
    }
});

module.exports._ = str => {
    if (typeof str !== 'string') {
        str = String(str);
    }

    if (language === 'zz') {
        return fakelang(str);
    }

    return gt.dgettext(language, str);
};
