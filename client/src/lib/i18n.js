'use strict';

import React from 'react';
import * as ri18n from 'react-i18next';
import {I18nextProvider} from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import mailtrainConfig from 'mailtrainConfig';
import moment from 'moment';

import {convertToFake, getLang} from '../../../shared/langs';
import {createComponentMixin} from "./decorator-helpers";

import lang_en_US_common from "../../../locales/en-US/common";
import lang_es_ES_common from "../../../locales/es-ES/common";
import lang_pt_BR_common from "../../../locales/pt-BR/common";
import lang_de_DE_common from "../../../locales/de-DE/common";
import lang_fr_FR_common from "../../../locales/fr-FR/common";
import lang_ru_RU_common from "../../../locales/ru-RU/common";
import lang_eu_common from "../../../locales/eu/common";

const resourcesCommon = {
    'en-US': lang_en_US_common,
    'es-ES': lang_es_ES_common,
    'pt-BR': lang_pt_BR_common,
    'de-DE': lang_de_DE_common,
    'fr-FR': lang_fr_FR_common,
    'ru_RU': lang_ru_RU_common,
    'eu': lang_eu_common,
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

        debug: false
    });

// Show moment text in selected language
moment.locale(i18n.language);

export default i18n;


export const TranslationContext = React.createContext(null);

export const withTranslation = createComponentMixin({
    contexts: [{context: TranslationContext, propName: 't'}]
});

const TranslationContextProvider = ri18n.withTranslation()(props => {
    return (
        <TranslationContext.Provider value={props.t}>
            {props.children}
        </TranslationContext.Provider>
    );
});

export function TranslationRoot(props) {
    return (
        <I18nextProvider i18n={ i18n }>
            <TranslationContextProvider>
                {props.children}
            </TranslationContextProvider>
        </I18nextProvider>
    );
}

export function tMark(key) {
    return key;
}
