'use strict';

const config = require('./config');
const i18n = require("i18next");
const fs = require('fs');
const path = require('path');
const {convertToFake, getLang} = require('../../shared/langs');

const resourcesCommon = {};

function loadLanguage(longCode) {
    resourcesCommon[longCode] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'locales', longCode, 'common.json')));
}

loadLanguage('en-US');
loadLanguage('es-ES');
loadLanguage('pt-BR');
loadLanguage('de-DE');
loadLanguage('fr-FR');
resourcesCommon['fk-FK'] = convertToFake(resourcesCommon['en-US']);

const resources = {};
for (const lng of config.enabledLanguages) {
    const langDesc = getLang(lng);
    resources[langDesc.longCode] = {
        common: resourcesCommon[langDesc.longCode]
    };
}

i18n
    .init({
        resources,
        wait: true, // globally set to wait for loaded translations in translate hoc

        fallbackLng: config.defaultLanguage,
        defaultNS: 'common',

        whitelist: config.enabledLanguages,
        load: 'currentOnly',

        debug: false
    })



function tLog(key, args) {
    if (!args) {
        args = {};
    }

    return JSON.stringify([key, args]);
}

function tUI(key, locale, args) {
    if (!args) {
        args = {};
    }

    return i18n.t(key, { ...args, lng: getLangCodeFromExpressLocale(locale) });
}

function tMark(key) {
    return key;
}

function getLangCodeFromExpressLocale(locale) {
    const longCode = locale.toString().replace('_', '-');
    if (longCode in resources) {
        return longCode;
    } else {
        return config.defaultLanguage
    }
}

module.exports.tLog = tLog;
module.exports.tUI = tUI;
module.exports.tMark = tMark;
module.exports.getLangCodeFromExpressLocale = getLangCodeFromExpressLocale;
