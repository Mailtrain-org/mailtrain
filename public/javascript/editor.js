/* eslint-env browser */
/* eslint no-invalid-this: 0, no-var: 0, prefer-arrow-callback: 0 */
/* globals $: false, ace: false */

'use strict';

$('.summernote').summernote({
    height: 400,
    tabsize: 2
});

// https://ace.c9.io/#nav=higlighter
// https://github.com/ajaxorg/ace-builds/tree/v1.2.3/src-min-noconflict

$('div.code-editor').each(function () {
    var editor = ace.edit(this);
    var textarea = document.querySelector('input[name=html]');

    editor.setTheme('ace/theme/chrome');
    editor.getSession().setMode('ace/mode/html');
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setUseSoftTabs(true);
    editor.setShowPrintMargin(false);
    editor.getSession().on('change', function () {
        textarea.value = editor.getSession().getValue();
    });
    textarea.value = editor.getSession().getValue();
});

$('div[class*="code-editor-"]').each(function () {
    var input = $(this).siblings('input')[0];
    var mode = 'html';
    var editor = ace.edit(this);

    if ($(this).hasClass('code-editor-text')) {
        mode = 'plain_text';
    } else if ($(this).hasClass('code-editor-mjml')) {
        mode = 'html';
        editor.getSession().setUseWorker(false);
    } else if ($(this).hasClass('code-editor-css')) {
        mode = 'css';
    } else if ($(this).hasClass('code-editor-javascript')) {
        mode = 'javascript';
    } else if ($(this).hasClass('code-editor-json')) {
        mode = 'json';
    } else if ($(this).hasClass('code-editor-handlebars')) {
        mode = 'handlebars';
    }

    editor.setTheme('ace/theme/chrome');
    editor.setShowPrintMargin(false);
    editor.getSession().setMode('ace/mode/' + mode);
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setValue(input.value);
    editor.getSession().on('change', function () {
        input.value = editor.getSession().getValue();
    });
});
