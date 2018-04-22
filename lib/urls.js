'use strict';

const config = require('config');
const url = require('url');

function getTrustedUrl(path) {
    return config.www.trustedUrlBase + (path || '');
}

function getSandboxUrl(path) {
    return config.www.sandboxUrlBase + (path || '');
}

function getTrustedUrlBaseDir() {
    const mailtrainUrl = url.parse(getTrustedUrl());
    return mailtrainUrl.pathname;
}

function getSandboxUrlBaseDir() {
    const mailtrainUrl = url.parse(getSandboxUrl());
    return mailtrainUrl.pathname;
}

module.exports = {
    getTrustedUrl,
    getSandboxUrl,
    getTrustedUrlBaseDir,
    getSandboxUrlBaseDir
};