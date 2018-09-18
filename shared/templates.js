'use strict';

function base(text, trustedBaseUrl, sandboxBaseUrl) {
    if (trustedBaseUrl.endsWith('/')) {
        trustedBaseUrl = trustedBaseUrl.substring(0, trustedBaseUrl.length - 1);
    }

    if (sandboxBaseUrl.endsWith('/')) {
        sandboxBaseUrl = sandboxBaseUrl.substring(0, sandboxBaseUrl.length - 1);
    }

    text = text.split('[URL_BASE]').join(trustedBaseUrl);
    text = text.split('[SANDBOX_URL_BASE]').join(sandboxBaseUrl);
    text = text.split('[ENCODED_URL_BASE]').join(encodeURIComponent(trustedBaseUrl));
    text = text.split('[ENCODED_SANDBOX_URL_BASE]').join(encodeURIComponent(sandboxBaseUrl));

    return text;
}

function unbase(text, trustedBaseUrl, sandboxBaseUrl, treatSandboxAsTrusted = false) {
    if (trustedBaseUrl.endsWith('/')) {
        trustedBaseUrl = trustedBaseUrl.substring(0, trustedBaseUrl.length - 1);
    }

    if (sandboxBaseUrl.endsWith('/')) {
        sandboxBaseUrl = sandboxBaseUrl.substring(0, sandboxBaseUrl.length - 1);
    }

    text = text.split(trustedBaseUrl).join('[URL_BASE]');
    text = text.split(sandboxBaseUrl).join(treatSandboxAsTrusted ? '[URL_BASE]' : '[SANDBOX_URL_BASE]');
    text = text.split(encodeURIComponent(trustedBaseUrl)).join('[ENCODED_URL_BASE]');
    text = text.split(encodeURIComponent(sandboxBaseUrl)).join(treatSandboxAsTrusted ? '[ENCODED_URL_BASE]' : '[ENCODED_SANDBOX_URL_BASE]');

    return text;
}

module.exports = {
    base,
    unbase
};