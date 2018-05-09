import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
// import Cache from 'i18next-localstorage-cache';
import mailtrainConfig from 'mailtrainConfig';
import {getUrl} from "./urls";

i18n
    .use(XHR)
    // .use(Cache)
    .init({
        lng: mailtrainConfig.language,

        wait: true, // globally set to wait for loaded translations in translate hoc

        // have a common namespace used around the full app
        ns: ['common'],
        defaultNS: 'common',

        debug: false,

        // cache: {
        //   enabled: true
        // },

        interpolation: {
            escapeValue: false // not needed for react
        },

        backend: {
            loadPath: getUrl('locales/{{lng}}/{{ns}}.json')
        }
    });


export default i18n;