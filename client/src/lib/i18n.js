'use strict';

import React, {Component} from 'react';
import i18n
    from 'i18next';
import {withNamespaces} from "react-i18next";
import LanguageDetector
    from 'i18next-browser-languagedetector';
import mailtrainConfig
    from 'mailtrainConfig';

import {convertToFake, getLang} from '../../../shared/langs';
import {createComponentMixin} from "./decorator-helpers";

import lang_en_US_common from "../../../locales/en-US/common";

const resourcesCommon = {
    'en-US': lang_en_US_common,
    'fk-FK': convertToFake(lang_en_US_common)
};

const resources = {};
for (const lng of mailtrainConfig.enabledLanguages) {
    const langDesc = getLang(lng);
    resources[langDesc.longCode] = {
        common: resourcesCommon[langDesc.longCode]
    };
}

i18n
    .use(LanguageDetector)
    .init({
        resources,

        fallbackLng: mailtrainConfig.defaultLanguage,
        defaultNS: 'common',

        interpolation: {
            escapeValue: false // not needed for react
        },

        react: {
            wait: true
        },

        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            lookupQuerystring: 'locale',
            lookupCookie: 'i18nextLng',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage', 'cookie']
        },

        whitelist: mailtrainConfig.enabledLanguages,
        load: 'currentOnly',

        debug: true
    })


export default i18n;


export const withTranslation = createComponentMixin([], [], (TargetClass, InnerClass) => {
    return withNamespaces()(TargetClass)
});

export function tMark(key) {
    return key;
}