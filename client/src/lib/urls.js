'use strict';

import {anonymousRestrictedAccessToken} from '../../../shared/urls';
import {AppType} from '../../../shared/app';
import mailtrainConfig from "mailtrainConfig";
import i18n from './i18n';

let restrictedAccessToken = anonymousRestrictedAccessToken;

export function setRestrictedAccessToken(token) {
    restrictedAccessToken = token;
}

export function getTrustedUrl(path) {
    return mailtrainConfig.trustedUrlBase + (path || '');
}

export function getSandboxUrl(path, customRestrictedAccessToken, opts) {
    const localRestrictedAccessToken = customRestrictedAccessToken || restrictedAccessToken;
     const url = new URL(localRestrictedAccessToken + '/' + (path || ''), mailtrainConfig.sandboxUrlBase);

    if (opts && opts.withLocale) {
        url.searchParams.append('locale', i18n.language);
    }

    return url.toString();
}

export function getPublicUrl(path, opts) {
    const url = new URL(path || '', mailtrainConfig.publicUrlBase);

    if (opts && opts.withLocale) {
        url.searchParams.append('locale', i18n.language);
    }

    return url.toString();
}

export function getUrl(path) {
    if (mailtrainConfig.appType === AppType.TRUSTED) {
        return getTrustedUrl(path);
    } else if (mailtrainConfig.appType === AppType.SANDBOXED) {
        return getSandboxUrl(path);
    } else if (mailtrainConfig.appType === AppType.PUBLIC) {
        return getPublicUrl(path);
    }
}

export function getBaseDir() {
    if (mailtrainConfig.appType === AppType.TRUSTED) {
        return mailtrainConfig.trustedUrlBaseDir;
    } else if (mailtrainConfig.appType === AppType.SANDBOXED) {
        return mailtrainConfig.sandboxUrlBaseDir + restrictedAccessToken;
    } else if (mailtrainConfig.appType === AppType.PUBLIC) {
        return mailtrainConfig.publicUrlBaseDir;
    }
}
