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

import {convertToFake, langCodes} from '../../../shared/langs';

import commonEn from "../../../locales/en/common";
import commonEs from "../../../locales/es/common";

const resourcesCommon = {
    en: commonEn,
    es: commonEs,
    fake: convertToFake(commonEn)
};

const resources = {};
for (const lng of mailtrainConfig.enabledLanguages) {
    const shortCode = langCodes[lng].shortCode;
    resources[shortCode] = {
        common: resourcesCommon[shortCode]
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
            wait: true,
            defaultTransParent: 'span' // This is because we use React < v16
        },

        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            lookupQuerystring: 'language',
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage']
        },

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