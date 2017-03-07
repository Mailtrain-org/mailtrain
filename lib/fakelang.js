'use strict';

/* lloyd|2012|http://wtfpl.org */

/* eslint-disable */

module.exports = str => {
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
