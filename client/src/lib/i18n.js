import i18n from 'i18next';
import { reactI18nextModule } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import mailtrainConfig from 'mailtrainConfig';
import {getUrl} from "./urls";

import commonEn from "../../../locales/common/en";

i18n
    .use(LanguageDetector)
    .init({
        lng: mailtrainConfig.language,
        resources: {
            en: {
                common: commonEn
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

        debug: true
    })


export default i18n;