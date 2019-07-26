'use strict';

const config = require('./config');
const urllib = require('url');
const {anonymousRestrictedAccessToken} = require('../../shared/urls');
const {getLangCodeFromExpressLocale} = require('./translate');

function getTrustedUrlBase() {
    return urllib.resolve(config.www.trustedUrlBase, '');
}

function getSandboxUrlBase() {
    return urllib.resolve(config.www.sandboxUrlBase, '');
}

function getPublicUrlBase() {
    return urllib.resolve(config.www.publicUrlBase, '');
}

function _getUrl(urlBase, path, opts) {
    const url = new URL(path || '', urlBase);

    if (opts && opts.locale) {
        url.searchParams.append('locale', getLangCodeFromExpressLocale(opts.locale));
    }

    return url.toString();
}

function getTrustedUrl(path, opts) {
    return _getUrl(config.www.trustedUrlBase, path || '', opts);
}

function getSandboxUrl(path, context, opts) {
    if (context && context.user && context.user.restrictedAccessToken) {
        return _getUrl(config.www.sandboxUrlBase, context.user.restrictedAccessToken + '/' + (path || ''), opts);
    } else {
        return _getUrl(config.www.sandboxUrlBase, anonymousRestrictedAccessToken + '/' + (path || ''), opts);
    }
}

function getPublicUrl(path, opts) {
    return _getUrl(config.www.publicUrlBase, path || '', opts);
}


function getTrustedUrlBaseDir() {
    const mailtrainUrl = urllib.parse(config.www.trustedUrlBase);
    return mailtrainUrl.pathname;
}

function getSandboxUrlBaseDir() {
    const mailtrainUrl = urllib.parse(config.www.sandboxUrlBase);
    return mailtrainUrl.pathname;
}

function getPublicUrlBaseDir() {
    const mailtrainUrl = urllib.parse(config.www.publicUrlBase);
    return mailtrainUrl.pathname;
}

module.exports = {
    getTrustedUrl,
    getSandboxUrl,
    getPublicUrl,
    getTrustedUrlBase,
    getSandboxUrlBase,
    getPublicUrlBase,
    getTrustedUrlBaseDir,
    getSandboxUrlBaseDir,
    getPublicUrlBaseDir
};