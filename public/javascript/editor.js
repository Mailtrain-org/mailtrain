/* eslint-env browser */
/* eslint no-invalid-this: 0, no-var: 0, prefer-arrow-callback: 0 */
/* globals $: false, ace: false */

'use strict';

$('.summernote').summernote({
    height: 400,
    tabsize: 2
});

$('div.code-editor').each(function() {
    var editor = ace.edit(this);
    var textarea = document.querySelector('input[name=html]');
    editor.setTheme('ace/theme/chrome');
    editor.getSession().setMode('ace/mode/html');
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().on('change', function() {
        textarea.value = editor.getSession().getValue();
    });
    textarea.value = editor.getSession().getValue();
});
