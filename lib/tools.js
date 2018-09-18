'use strict';

const _ = require('./translate')._;
const util = require('util');
const isemail = require('isemail');
const path = require('path');
const {getPublicUrl} = require('./urls');

const bluebird = require('bluebird');

const hasher = require('node-object-hash')();
const mjml = require('mjml');
const hbs = require('hbs');
const juice = require('juice');
let he = require('he');

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

function formatMessage(campaign, list, subscription, mergeTags, message, filter, isHTML) {
    filter = typeof filter === 'function' ? filter : (str => str);

    let links = getMessageLinks(campaign, list, subscription);

    let getValue = key => {
        key = (key || '').toString().toUpperCase().trim();
        if (links.hasOwnProperty(key)) {
            return links[key];
        }
        if (mergeTags.hasOwnProperty(key)) {
            let value = (mergeTags[key] || '').toString();
            let containsHTML = /<[a-z][\s\S]*>/.test(value);
            return isHTML ? he.encode((containsHTML ? value : value.replace(/(?:\r\n|\r|\n)/g, '<br/>')), {
                useNamedReferences: true,
                allowUnsafeSymbols: true
            }) : (containsHTML ? htmlToText.fromString(value) : value);
        }
        return false;
    };

    return message.replace(/\[([a-z0-9_]+)(?:\/([^\]]+))?\]/ig, (match, identifier, fallback) => {
        identifier = identifier.toUpperCase();
        let value = getValue(identifier);
        if (value === false) {
            return match;
        }
        value = (value || fallback || '').trim();
        return filter(value);
    });
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

function getMessageLinks(campaign, list, subscription) {
    return {
        LINK_UNSUBSCRIBE: getPublicUrl('/subscription/' + list.cid + '/unsubscribe/' + subscription.cid + '?c=' + campaign.cid),
        LINK_PREFERENCES: getPublicUrl('/subscription/' + list.cid + '/manage/' + subscription.cid),
        LINK_BROWSER: getPublicUrl('/archive/' + campaign.cid + '/' + list.cid + '/' + subscription.cid),
        CAMPAIGN_ID: campaign.cid,
        LIST_ID: list.cid,
        SUBSCRIPTION_ID: subscription.cid
    };
}

module.exports = {
    validateEmail,
    validateEmailGetMessage,
    mergeTemplateIntoLayout,
    getTemplate,
    prepareHtml,
    getMessageLinks
};

