'use strict';

let db = require('./db');
let slugify = require('slugify');
let Isemail = require('isemail');
let urllib = require('url');
let juice = require('juice');
let jsdom = require('jsdom');

let blockedUsers = ['abuse', 'admin', 'billing', 'compliance', 'devnull', 'dns', 'ftp', 'hostmaster', 'inoc', 'ispfeedback', 'ispsupport', 'listrequest', 'list', 'maildaemon', 'noc', 'noreply', 'noreply', 'null', 'phish', 'phishing', 'postmaster', 'privacy', 'registrar', 'root', 'security', 'spam', 'support', 'sysadmin', 'tech', 'undisclosedrecipients', 'unsubscribe', 'usenet', 'uucp', 'webmaster', 'www'];

module.exports = {
    toDbKey,
    fromDbKey,
    convertKeys,
    queryParams,
    createSlug,
    updateMenu,
    validateEmail,
    formatMessage,
    getMessageLinks,
    prepareHtml
};

function toDbKey(key) {
    return key.
    replace(/[^a-z0-9\-_]/gi, '').
    replace(/\-+/g, '_').
    replace(/[A-Z]/g, c => '_' + c.toLowerCase()).
    replace(/^_+|_+$/g, '').
    replace(/_+/g, '_').
    trim();
}

function fromDbKey(key) {
    return key.replace(/[_\-]([a-z])/g, (m, c) => c.toUpperCase());
}

function convertKeys(obj, options) {
    options = options || {};
    let response = {};
    Object.keys(obj || {}).forEach(key => {
        let lKey = fromDbKey(key);
        if (options.skip && options.skip.indexOf(lKey) >= 0) {
            return;
        }
        if (options.keep && options.skip.indexOf(lKey) < 0) {
            return;
        }
        response[lKey] = obj[key];
    });
    return response;
}

function queryParams(obj) {
    return Object.keys(obj).
    filter(key => key !== '_csrf').
    map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])).
    join('&');
}

function createSlug(table, name, callback) {

    let baseSlug = slugify(name).trim().toLowerCase() || 'list';
    let counter = 0;

    if (baseSlug.length > 80) {
        baseSlug = baseSlug.substr(0, 80);
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let finalize = (err, slug) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, slug);
        };

        let trySlug = () => {
            let currentSlug = baseSlug + (counter === 0 ? '' : '-' + counter);
            counter++;
            connection.query('SELECT id FROM ' + table + ' WHERE slug=?', [currentSlug], (err, rows) => {
                if (err) {
                    return finalize(err);
                }
                if (!rows || !rows.length) {
                    return finalize(null, currentSlug);
                }
                trySlug();
            });
        };

        trySlug();
    });
}

function updateMenu(res) {
    if (!res.locals.menu) {
        res.locals.menu = [];
    }

    res.locals.menu.push({
        title: 'Lists',
        url: '/lists',
        key: 'lists'
    }, {
        title: 'Templates',
        url: '/templates',
        key: 'templates'
    }, {
        title: 'Campaigns',
        url: '/campaigns',
        key: 'campaigns'
    }, {
        title: 'Automation',
        url: '/triggers',
        key: 'triggers'
    });
}

function validateEmail(address, checkBlocked, callback) {

    let user = (address || '').toString().split('@').shift().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (checkBlocked && blockedUsers.indexOf(user) >= 0) {
        return callback(new Error('Blocked email address "' + address + '"'));
    }

    Isemail.validate(address, {
        checkDNS: true,
        errorLevel: 1
    }, result => {

        if (result !== 0) {
            let message = 'Invalid email address "' + address + '"';
            switch (result) {
                case 5:
                    message += '. MX record not found for domain';
                    break;
                case 6:
                    message += '. Address domain not found';
                    break;
                case 12:
                    message += '. Address domain name is required';
                    break;
            }
            return callback(new Error(message));
        }

        return callback();
    });
}

function getMessageLinks(serviceUrl, campaign, list, subscription) {
    return {
        LINK_UNSUBSCRIBE: urllib.resolve(serviceUrl, '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid + '?auto=yes&c=' + campaign.cid),
        LINK_PREFERENCES: urllib.resolve(serviceUrl, '/subscription/' + list.cid + '/manage/' + subscription.cid),
        LINK_BROWSER: urllib.resolve(serviceUrl, '/archive/' + campaign.cid + '/' + list.cid + '/' + subscription.cid),
        CAMPAIGN_ID: campaign.cid,
        LIST_ID: list.cid,
        SUBSCRIPTION_ID: subscription.cid
    };
}

function formatMessage(serviceUrl, campaign, list, subscription, message, filter) {
    filter = typeof filter === 'function' ? filter : (str => str);

    let links = getMessageLinks(serviceUrl, campaign, list, subscription);

    let getValue = key => {
        key = (key || '').toString().toUpperCase().trim();
        if (links.hasOwnProperty(key)) {
            return links[key];
        }
        if (subscription.mergeTags.hasOwnProperty(key)) {
            return subscription.mergeTags[key];
        }
        return false;
    };

    return message.replace(/\[([a-z0-9_]+)(?:\/([^\]]+))?\]/ig, (match, identifier, fallback) => {
        identifier = identifier.toUpperCase();
        let value = (getValue(identifier) || fallback || '').trim();
        return value ? filter(value) : '';
    });
}

function prepareHtml(html, callback) {
    if (!(html || '').toString().trim()) {
        return callback(null, false);
    }

    jsdom.env(html, (err, win) => {
        if (err) {
            return callback(err);
        }

        let head = win.document.querySelector('head');
        let hasCharsetTag = false;
        let metaTags = win.document.querySelectorAll('meta');
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
            let charsetTag = win.document.createElement('meta');
            charsetTag.setAttribute('charset', 'utf-8');
            head.appendChild(charsetTag);
        }
        let preparedHtml = '<!doctype html><html>' + win.document.documentElement.innerHTML + '</html>';

        return callback(null, juice(preparedHtml));
    });
}
