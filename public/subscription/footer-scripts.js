/* eslint-env browser */
/* eslint no-invalid-this: 0, no-var: 0, prefer-arrow-callback: 0 */
/* globals $: false, ace: false */

if (typeof moment !== 'undefined' && moment.tz) {
    (function () {
        var tz = moment.tz.guess();
        if (tz) {
            document.querySelectorAll('.tz-detect').forEach(function(el) {
                el.value = tz;
            });
        }
    })();
}

document.querySelectorAll('a[href="#submit"]').forEach(function(a) {
    a.onclick = function() {
        var form = document.getElementById('main-form');
        form && form.submit();
        return false;
    };
});

// Fixes MJML Button until they do ...
// https://github.com/mjmlio/mjml/issues/359

if (window.btnBgColor) {
    (function() {
        var s = document.createElement('style');
        var c = document.createTextNode(
            '.td-btn:hover { background-color: ' + window.btnBgColorHover + '; }' +
            '.td-btn { cursor: pointer !important; }' +
            '.a-btn { background-color: transparent !important; }'
        );
        s.appendChild(c);
        document.getElementsByTagName('head')[0].appendChild(s);
        document.querySelectorAll('a').forEach(function(a) {
            if (a.parentNode.getAttribute('bgcolor') === window.btnBgColor) {
                a.target = '_self';
                a.className += 'a-btn';
                a.parentNode.className += 'td-btn';
                a.parentNode.onclick = function() {
                    a.click();
                };
            }
        });
    })();
}
