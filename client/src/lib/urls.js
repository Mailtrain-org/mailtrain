'use strict';

import mailtrainConfig from "mailtrainConfig";

function getTrustedUrl(path) {
    return mailtrainConfig.trustedUrlBase + (path || '');
}

function getSandboxUrl(path) {
    return mailtrainConfig.sandboxUrlBase + (path || '');
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
        return mailtrainConfig.sandboxUrlBaseDir;
    }
}

export {
    getTrustedUrl,
    getSandboxUrl,
    getUrl,
    getBaseDir
}