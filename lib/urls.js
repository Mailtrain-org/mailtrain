'use strict';

const config = require('config');
const urllib = require('url');

function getTrustedUrlBase() {
    return urllib.resolve(config.www.trustedUrlBase, '');
}

function getSandboxUrlBase() {
    return urllib.resolve(config.www.sandboxUrlBase, '');
}

function getTrustedUrl(path) {
    return urllib.resolve(config.www.trustedUrlBase, path || '');
}

function getSandboxUrl(path, context) {
    if (context && context.user && context.user.restrictedAccessToken) {
        return urllib.resolve(config.www.sandboxUrlBase, context.user.restrictedAccessToken + '/' + (path || ''));
    } else {
        return urllib.resolve(config.www.sandboxUrlBase, 'ANONYMOUS/' + (path || ''));
    }
}

function getTrustedUrlBaseDir() {
    const ivisUrl = urllib.parse(config.www.trustedUrlBase);
    return ivisUrl.pathname;
}

function getSandboxUrlBaseDir() {
    const ivisUrl = urllib.parse(config.www.sandboxUrlBase);
    return ivisUrl.pathname;
}

module.exports = {
    getTrustedUrl,
    getSandboxUrl,
    getTrustedUrlBase,
    getSandboxUrlBase,
    getTrustedUrlBaseDir,
    getSandboxUrlBaseDir
};