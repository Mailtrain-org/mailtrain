'use strict';

const config = require('config');

const i18n = require("i18next");
const Backend = require("i18next-node-fs-backend");

const path = require('path');

i18n
    .use(Backend)
    // .use(Cache)
    .init({
        lng: config.language,

        wait: true, // globally set to wait for loaded translations in translate hoc

        // have a common namespace used around the full app
        ns: ['common'],
        defaultNS: 'common',

        debug: true,

        backend: {
            loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json')
        }
    })

function tLog(key, args) {
    if (!args) {
        args = {};
    }

    return JSON.stringify([key, args]);
}

function tUI(lang, key, args) {
    if (!args) {
        args = {};
    }

    return i18n.t(key, { ...args, defaultValue, lng: lang });
}

module.exports.tLog = tLog;
module.exports.tUI = tUI;