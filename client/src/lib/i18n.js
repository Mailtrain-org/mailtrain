'use strict';

import React, {Component} from 'react';
import i18n
    from 'i18next';
import {withNamespaces} from "react-i18next";
import LanguageDetector
    from 'i18next-browser-languagedetector';
import mailtrainConfig
    from 'mailtrainConfig';

import hoistStatics
    from 'hoist-non-react-statics';

import {convertToFake, getLang} from '../../../shared/langs';

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

console.log(resources);

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
            wait: true,
            defaultTransParent: 'span' // This is because we use React < v16 FIXME
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


export function withTranslation(opts) {
    if (opts && opts.delegateFuns) {
        return function (WrappedComponent) {
            class Wrapper extends Component {
                constructor(props) {
                    super(props);

                    this.WrappedComponentWithNamespaces = withNamespaces(null, {innerRef: ref => this.wrappedComponent = ref})(WrappedComponent);
                }

                render() {
                    const WrappedComponentWithNamespaces = this.WrappedComponentWithNamespaces;
                    return <WrappedComponentWithNamespaces {...this.props}/>;
                }
            }

            for (const fun of opts.delegateFuns) {
                Wrapper.prototype[fun] = function (...args) {
                    return this.wrappedComponent[fun](...args);
                }
            }

            return hoistStatics(Wrapper, WrappedComponent);
        }
    } else {
        return withNamespaces();
    }
}

export function tMark(key) {
    return key;
}