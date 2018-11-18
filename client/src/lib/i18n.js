import i18n from 'i18next';
import { reactI18nextModule } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import mailtrainConfig from 'mailtrainConfig';
import {getUrl} from "./urls";

import commonEn from "../../../locales/common/en";

function convertToFake(dict) {
    function convertValueToFakeLang(str) {
        let from = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+\\|`~[{]};:'\",<.>/?";
        let to = "ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz∀ԐↃᗡƎℲ⅁HIſӼ⅂WNOԀÒᴚS⊥∩ɅＭX⅄Z0123456789¡@#$%ᵥ⅋⁎()-_=+\\|,~[{]};:,„´<.>/¿";

        return str.replace(/(\{\{[^\}]+\}\}|%s)/g, '\x00\x04$1\x00').split('\x00').map(c => {
            if (c.charAt(0) === '\x04') {
                return c;
            }
            let r = '';
            for (let i = 0, len = c.length; i < len; i++) {
                let pos = from.indexOf(c.charAt(i));
                if (pos < 0) {
                    r += c.charAt(i);
                } else {
                    r += to.charAt(pos);
                }
            }
            return r;
        }).join('\x00').replace(/[\x00\x04]/g, '');
    }

    function _convertToFake(dict) {
        for (const key in dict) {
            const val = dict[key];

            if (typeof val === 'string') {
                dict[key] = convertValueToFakeLang(val);
            } else {
                _convertToFake(val);
            }
        }
    }

    return _convertToFake(dict);
}

i18n
    .use(LanguageDetector)
    .init({
        lng: mailtrainConfig.language,
        resources: {
            en: {
                common: commonEn
            },
            en_fake: {
                common: convertToFake(commonEn)
            }
        },

        fallbackLng: "en",
        defaultNS: 'common',

        interpolation: {
            escapeValue: false // not needed for react
        },

        react: {
            wait: true
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