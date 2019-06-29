'use strict';

const util = require('util');
const isemail = require('isemail');
const path = require('path');
const {getPublicUrl} = require('./urls');

const bluebird = require('bluebird');

const hasher = require('node-object-hash')();

const mjml2html = require('mjml');

const hbs = require('hbs');
const juice = require('juice');
const he = require('he');
const htmlToText = require('html-to-text');

const fs = require('fs-extra');

const { JSDOM } = require('jsdom');
const { tUI, tLog, getLangCodeFromExpressLocale } = require('./translate');


const templates = new Map();

async function getLocalizedFile(basePath, fileName, language) {
    try {
        const locFn = path.join(basePath, language, fileName);
        const stats = await fs.stat(locFn);

        if (stats.isFile()) {
            return locFn;
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    return path.join(basePath, fileName)
}

async function getTemplate(template, locale) {
    enforce(template);

    const key = getLangCodeFromExpressLocale(locale) + ':' + ((typeof template === 'object') ? hasher.hash(template) : template);

    if (templates.has(key)) {
        return templates.get(key);
    }

    let source;
    if (typeof template === 'object') {
        source = await mergeTemplateIntoLayout(template.template, template.layout, locale);
    } else {
        source = await fs.readFile(await getLocalizedFile(path.join(__dirname, '..', 'views'), template, getLangCodeFromExpressLocale(locale)), 'utf-8');
    }

    if (template.type === 'mjml') {
        const compiled = mjml2html(source);

        if (compiled.errors.length) {
            throw new Error(compiled.errors[0].message || compiled.errors[0]);
        }

        source = compiled.html;
    }

    const renderer = hbs.handlebars.compile(source);

    const localizedRenderer = (data, options) => {
        if (!options) {
            options = {};
        }

        if (!options.helpers) {
            options.helpers = {};
        }

        options.helpers.translate = function (opts) { // eslint-disable-line prefer-arrow-callback
            const result = tUI(opts.fn(this), locale, opts.hash); // eslint-disable-line no-invalid-this
            return new hbs.handlebars.SafeString(result);
        };

        return renderer(data, options);
    };

    templates.set(key, localizedRenderer);

    return localizedRenderer;
}


async function mergeTemplateIntoLayout(template, layout, locale) {
    layout = layout || '{{{body}}}';

    async function readFile(relPath) {
        return await fs.readFile(await getLocalizedFile(path.join(__dirname, '..', 'views'), relPath, getLangCodeFromExpressLocale(locale)), 'utf-8');
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

function validateEmailGetMessage(result, address, language) {
    let t;
    if (language) {
        t = (key, args) => tUI(key, language, args);
    } else {
        t = (key, args) => tLog(key, args);
    }

    if (result !== 0) {
        switch (result) {
            case 5:
                return t('invalidEmailAddressEmailMxRecordNotFound', {email: address});
            case 6:
                return t('invalidEmailAddressEmailAddressDomainNot', {email: address});
            case 12:
                return t('invalidEmailAddressEmailAddressDomain', {email: address});
            default:
                return t('invalidEmailAddressEmail', {email: address});
        }
    }
}

function formatMessage(campaign, list, subscription, mergeTags, message, isHTML) {
    const links = campaign && list && subscription ? getMessageLinks(campaign, list, subscription) : {};
    return formatTemplate(message, links, mergeTags, isHTML);
}

function formatTemplate(template, links, mergeTags, isHTML) {
    if (!links && !mergeTags) { return template; }

    const getValue = fullKey => {
        const keys = (fullKey || '').split('.');

        if (links && links.hasOwnProperty(keys[0])) {
            return links[keys[0]];
        }

        if (!mergeTags) { return false; }

        let value = mergeTags;
        while (keys.length > 0) {
            let key = keys.shift();
            if (value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                return false;
            }
        }

        const containsHTML = /<[a-z][\s\S]*>/.test(value);
        return isHTML ? he.encode((containsHTML ? value : value.replace(/(?:\r\n|\r|\n)/g, '<br/>')), {
            useNamedReferences: true,
            allowUnsafeSymbols: true
        }) : (containsHTML ? htmlToText.fromString(value) : value);
    };

    return template.replace(/\[([a-z0-9_.]+)(?:\/([^\]]+))?\]/ig, (match, identifier, fallback) => {
        let value = getValue(identifier);
        if (value === false) {
            return match;
        }
        value = (value || fallback || '').trim();
        return value;
    });
}

async function prepareHtml(html) {
    const { window } = new JSDOM(html);

    const head = window.document.querySelector('head');
    let hasCharsetTag = false;
    const metaTags = window.document.querySelectorAll('meta');
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
        const charsetTag = window.document.createElement('meta');
        charsetTag.setAttribute('charset', 'utf-8');
        head.appendChild(charsetTag);
    }
    const preparedHtml = '<!doctype html><html>' + window.document.documentElement.innerHTML + '</html>';

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
    getTemplate,
    prepareHtml,
    getMessageLinks,
    formatMessage,
    formatTemplate
};

