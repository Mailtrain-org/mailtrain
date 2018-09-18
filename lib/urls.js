'use strict';

const config = require('config');
const urllib = require('url');
const {anonymousRestrictedAccessToken} = require('../shared/urls');

function getTrustedUrlBase() {
    return urllib.resolve(config.www.trustedUrlBase, '');
}

function getSandboxUrlBase() {
    return urllib.resolve(config.www.sandboxUrlBase, '');
}

function getPublicUrlBase() {
    return urllib.resolve(config.www.publicUrlBase, '');
}

function getTrustedUrl(path) {
    return urllib.resolve(config.www.trustedUrlBase, path || '');
}

function getSandboxUrl(path, context) {
    if (context && context.user && context.user.restrictedAccessToken) {
        return urllib.resolve(config.www.sandboxUrlBase, context.user.restrictedAccessToken + '/' + (path || ''));
    } else {
        return urllib.resolve(config.www.sandboxUrlBase, anonymousRestrictedAccessToken + '/' + (path || ''));
    }
}

function getPublicUrl(path) {
    return urllib.resolve(config.www.publicUrlBase, path || '');
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