'use strict';

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

    function _convertToFake(dict, fakeDict) {
        for (const key in dict) {
            const val = dict[key];

            if (typeof val === 'string') {
                fakeDict[key] = convertValueToFakeLang(val);
            } else {
                fakeDict[key] = _convertToFake(val, {});
            }
        }

        return fakeDict;
    }

    return _convertToFake(dict, {});
}

// The langugage labels below are intentionally not localized so that they are always native in the langugae of their speaker (regardless of the currently selected language)
const langCodes = {
    'en-US': {
        getShortLabel: t => 'EN',
        getLabel: t => 'English',
        longCode: 'en-US'
    },
    'es-ES': {
        getShortLabel: t => 'ES',
        getLabel: t => 'Español',
        longCode: 'es-ES'
    },
    'pt-BR': {
        getShortLabel: t => 'BR',
        getLabel: t => 'Português',
        longCode: 'pt-BR'
    },
    'de-DE': {
        getShortLabel: t => 'DE',
        getLabel: t => 'Deutsch',
        longCode: 'de-DE'
    },
    'fr-FR': {
        getShortLabel: t => 'FR',
        getLabel: t => 'Francais',
        longCode: 'fr-FR'
    },
    'ru-RU': {
        getShortLabel: t => 'RU',
        getLabel: t => 'Russian',
        longCode: 'ru-RU'
    },
    'eu': {
        getShortLabel: t => 'EU',
        getLabel: t => 'Euskara',
        longCode: 'eu'
    },
    'fk-FK': {
        getShortLabel: t => 'FK',
        getLabel: t => 'Fake',
        longCode: 'fk-FK'
    },
}

function getLang(lng) {
    return langCodes[lng];
}

module.exports.convertToFake = convertToFake;
module.exports.getLang = getLang;
