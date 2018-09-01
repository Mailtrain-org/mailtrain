'use strict';

const _ = require('./translate')._;
const util = require('util');
const isemail = require('isemail');
const path = require('path');

const bluebird = require('bluebird');

const hasher = require('node-object-hash')();
const mjml = require('mjml');
const hbs = require('hbs');
const juice = require('juice');

const fsReadFile = bluebird.promisify(require('fs').readFile);
const jsdomEnv = bluebird.promisify(require('jsdom').env);


const templates = new Map();

async function getTemplate(template) {
    if (!template) {
        return false;
    }

    const key = (typeof template === 'object') ? hasher.hash(template) : template;

    if (templates.has(key)) {
        return templates.get(key);
    }

    let source;
    if (typeof template === 'object') {
        source = await mergeTemplateIntoLayout(template.template, template.layout);
    } else {
        source = await fsReadFile(path.join(__dirname, '..', 'views', template), 'utf-8');
    }

    if (template.type === 'mjml') {
        const compiled = mjml.mjml2html(source);

        if (compiled.errors.length) {
            throw new Error(compiled.errors[0].message || compiled.errors[0]);
        }

        source = compiled.html;
    }

    const renderer = hbs.handlebars.compile(source);
    templates.set(key, renderer);

    return renderer;
}


async function mergeTemplateIntoLayout(template, layout) {
    layout = layout || '{{{body}}}';

    async function readFile(relPath) {
        return await fsReadFile(path.join(__dirname, '..', 'views', relPath), 'utf-8');
    }

    // Please dont end your custom messages with .hbs ...
    if (layout.endsWith('.hbs')) {
        layout = await readFile(layout);
    }

    if (template.endsWith('.hbs')) {
        template = await readFile(template);
    }

    const source = layout.replace(/\{\{\{body\}\}\}/g, template);
    return source;
}

async function validateEmail(address) {
    const result = await new Promise(resolve => {
        const result = isemail.validate(address, {
            checkDNS: true,
            errorLevel: 1
        }, resolve);
    });

    return result;
}

function validateEmailGetMessage(result, address) {
    if (result !== 0) {
        let message = util.format(_('Invalid email address "%s".'), address);
        switch (result) {
            case 5:
                message += ' ' + _('MX record not found for domain');
                break;
            case 6:
                message += ' ' + _('Address domain not found');
                break;
            case 12:
                message += ' ' + _('Address domain name is required');
                break;
        }
        return message;
    }
}

async function prepareHtml(html) {
    if (!(html || '').toString().trim()) {
        return false;
    }

    const win = await jsdomEnv(false, false, {
        html,
        features: {
            FetchExternalResources: false, // disables resource loading over HTTP / filesystem
            ProcessExternalResources: false // do not execute JS within script blocks
        }
    });

    const head = win.document.querySelector('head');
    let hasCharsetTag = false;
    const metaTags = win.document.querySelectorAll('meta');
    if (metaTags) {
        for (let i = 0; i < metaTags.length; i++) {
            if (metaTags[i].hasAttribute('charset')) {
                metaTags[i].setAttribute('charset', 'utf-8');
                hasCharsetTag = true;
                break;
            }
        }
    }
    if (!hasCharsetTag) {
        const charsetTag = win.document.createElement('meta');
        charsetTag.setAttribute('charset', 'utf-8');
        head.appendChild(charsetTag);
    }
    const preparedHtml = '<!doctype html><html>' + win.document.documentElement.innerHTML + '</html>';

    return juice(preparedHtml);
}


module.exports = {
    validateEmail,
    validateEmailGetMessage,
    mergeTemplateIntoLayout,
    getTemplate,
    prepareHtml
};

