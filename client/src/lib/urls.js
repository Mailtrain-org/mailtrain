'use strict';

import {anonymousRestrictedAccessToken} from '../../../shared/urls';
import {AppType} from '../../../shared/app';
import mailtrainConfig from "mailtrainConfig";

let restrictedAccessToken = anonymousRestrictedAccessToken;

function setRestrictedAccessToken(token) {
    restrictedAccessToken = token;
}

function getTrustedUrl(path) {
    return mailtrainConfig.trustedUrlBase + (path || '');
}

function getSandboxUrl(path) {
    return mailtrainConfig.sandboxUrlBase + restrictedAccessToken + '/' + (path || '');
}

function getPublicUrl(path) {
    return mailtrainConfig.publicUrlBase + (path || '');
}

function getUrl(path) {
    if (mailtrainConfig.appType === AppType.TRUSTED) {
        return getTrustedUrl(path);
    } else if (mailtrainConfig.appType === AppType.SANDBOXED) {
        return getSandboxUrl(path);
    } else if (mailtrainConfig.appType === AppType.PUBLIC) {
        return getPublicUrl(path);
    }
}

function getBaseDir() {
    if (mailtrainConfig.appType === AppType.TRUSTED) {
        return mailtrainConfig.trustedUrlBaseDir;
    } else if (mailtrainConfig.appType === AppType.SANDBOXED) {
        return mailtrainConfig.sandboxUrlBaseDir + anonymousRestrictedAccessToken;
    } else if (mailtrainConfig.appType === AppType.PUBLIC) {
        return mailtrainConfig.publicUrlBaseDir;
    }
}

export {
    getTrustedUrl,
    getSandboxUrl,
    getPublicUrl,
    getUrl,
    getBaseDir,
    setRestrictedAccessToken
}