'use strict';

function base(text, baseUrl) {
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    return text.split('[URL_BASE]').join(baseUrl);
}

function unbase(text, baseUrl) {
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    return text.split(baseUrl).join('[URL_BASE]');
}

module.exports = {
    base,
    unbase
};