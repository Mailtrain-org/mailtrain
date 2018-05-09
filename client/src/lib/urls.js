'use strict';

import mailtrainConfig from "mailtrainConfig";

let restrictedAccessToken = 'ANONYMOUS';

function setRestrictedAccessToken(token) {
    restrictedAccessToken = token;
}

function getTrustedUrl(path) {
    return mailtrainConfig.trustedUrlBase + (path || '');
}

function getSandboxUrl(path) {
    return mailtrainConfig.sandboxUrlBase + restrictedAccessToken + '/' + (path || '');
}

function getUrl(path) {
    if (mailtrainConfig.trusted) {
        return getTrustedUrl(path);
    } else {
        return getSandboxUrl(path);
    }
}

function getBaseDir() {
    if (mailtrainConfig.trusted) {
        return mailtrainConfig.trustedUrlBaseDir;
    } else {
        return mailtrainConfig.sandboxUrlBaseDir + 'ANONYMOUS';
    }
}

export {
    getTrustedUrl,
    getSandboxUrl,
    getUrl,
    getBaseDir,
    setRestrictedAccessToken
}