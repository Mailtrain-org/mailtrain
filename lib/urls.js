'use strict';

const config = require('config');
const urllib = require('url');

function getTrustedUrl(path) {
    return urllib.resolve(config.www.trustedUrlBase, path || '');
}

function getSandboxUrl(path) {
    return urllib.resolve(config.www.sandboxUrlBase, path || '');
}

function getTrustedUrlBaseDir() {
    const mailtrainUrl = urllib.parse(getTrustedUrl());
    return mailtrainUrl.pathname;
}

function getSandboxUrlBaseDir() {
    const mailtrainUrl = urllib.parse(getSandboxUrl());
    return mailtrainUrl.pathname;
}

module.exports = {
    getTrustedUrl,
    getSandboxUrl,
    getTrustedUrlBaseDir,
    getSandboxUrlBaseDir
};