'use strict';

// FIXME - process also urlencoded strings - this is for the mosaico/img/template, which passes the file in src parameter

function base(text, trustedBaseUrl, sandboxBaseUrl) {
    if (trustedBaseUrl.endsWith('/')) {
        trustedBaseUrl = trustedBaseUrl.substring(0, trustedBaseUrl.length - 1);
    }

    if (sandboxBaseUrl.endsWith('/')) {
        sandboxBaseUrl = sandboxBaseUrl.substring(0, sandboxBaseUrl.length - 1);
    }

    return text.split('[URL_BASE]').join(trustedBaseUrl).split('[SANDBOX_URL_BASE]').join(sandboxBaseUrl);
}

function unbase(text, trustedBaseUrl, sandboxBaseUrl, treatSandboxAsTrusted = false) {
    if (trustedBaseUrl.endsWith('/')) {
        trustedBaseUrl = trustedBaseUrl.substring(0, trustedBaseUrl.length - 1);
    }

    if (sandboxBaseUrl.endsWith('/')) {
        sandboxBaseUrl = sandboxBaseUrl.substring(0, sandboxBaseUrl.length - 1);
    }

    return text.split(trustedBaseUrl).join('[URL_BASE]').split(sandboxBaseUrl).join(treatSandboxAsTrusted ? '[URL_BASE]' : '[SANDBOX_URL_BASE]');
}

module.exports = {
    base,
    unbase
};