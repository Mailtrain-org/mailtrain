'use strict';

import mailtrainConfig from "mailtrainConfig";

let urlBase;
let sandboxUrlBase;

if (mailtrainConfig.urlBase.startsWith('/')) {
    urlBase = window.location.protocol + '//' + window.location.hostname + ':' + mailtrainConfig.port + mailtrainConfig.urlBase;
} else {
    urlBase = mailtrainConfig.urlBase
}

if (mailtrainConfig.sandboxUrlBase) {
    if (mailtrainConfig.urlBase.startsWith('/')) {
        sandboxUrlBase = window.location.protocol + '//' + window.location.hostname + ':' + mailtrainConfig.sandboxPort + mailtrainConfig.sandboxUrlBase;
    } else {
        sandboxUrlBase = mailtrainConfig.sandboxUrlBase
    }
} else {
    const loc = document.createElement("a");
    loc.href = urlBase;
    sandboxUrlBase = loc.protocol + '//' + loc.hostname + ':' + mailtrainConfig.sandboxPort + loc.pathname;
}

function getTrustedUrl(path) {
    return urlBase + path;
}

function getSandboxUrl(path) {
    return sandboxUrlBase + path;
}

export {
    getTrustedUrl,
    getSandboxUrl
}