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
    en_US: {
        getShortLabel: t => 'EN',
        getLabel: t => 'English',
        shortCode: 'en',
        longCode: 'en_US'
    },
    es: {
        getShortLabel: t => 'ES',
        getLabel: t => 'Español',
        shortCode: 'es',
        longCode: 'es'
    },
    fake: {
        getShortLabel: t => 'FAKE',
        getLabel: t => 'Fake',
        shortCode: 'fake',
        longCode: 'fake'
    }
}

langCodes.en = langCodes['en-US'] = langCodes.en_US;

module.exports.convertToFake = convertToFake;
module.exports.langCodes = langCodes;