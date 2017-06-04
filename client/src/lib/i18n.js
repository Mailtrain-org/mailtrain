import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
// import Cache from 'i18next-localstorage-cache';

i18n
    .use(XHR)
    // .use(Cache)
    .init({
        lng: 'en', // FIXME set language from mailtrain (ideally from react-root.hbs)

        wait: true, // globally set to wait for loaded translations in translate hoc

        // have a common namespace used around the full app
        ns: ['common'],
        defaultNS: 'common',

        debug: true,

        // cache: {
        //   enabled: true
        // },

        interpolation: {
            escapeValue: false // not needed for react
        }
    });


export default i18n;