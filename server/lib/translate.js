'use strict';

const config = require('config');
const i18n = require("i18next");
const fs = require('fs');
const path = require('path');
const {convertToFake, langCodes} = require('../../shared/langs');

const resourcesCommon = {};

function loadLanguage(shortCode) {
    resourcesCommon[shortCode] = {
        common: JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'locales', shortCode, 'common.json')))
    };
}

loadLanguage('en');
loadLanguage('es');
resourcesCommon.fake = convertToFake(resourcesCommon.en);

const resources = {};
for (const lng of config.enabledLanguages) {
    const shortCode = langCodes[lng].shortCode;
    resources[shortCode] = {
        common: resourcesCommon[shortCode]
    };
}

i18n
    .init({
        resources,
        wait: true, // globally set to wait for loaded translations in translate hoc

        fallbackLng: config.defaultLanguage,
        defaultNS: 'common',

        debug: false
    })



function tLog(key, args) {
    if (!args) {
        args = {};
    }

    return JSON.stringify([key, args]);
}

function tUI(key, lang, args) {
    if (!args) {
        args = {};
    }

    return i18n.t(key, { ...args, lng: lang });
}

function tMark(key) {
    return key;
}

module.exports.tLog = tLog;
module.exports.tUI = tUI;
module.exports.tMark = tMark;