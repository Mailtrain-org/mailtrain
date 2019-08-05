'use strict';

const TagLanguages = {
    SIMPLE: 'simple',
    HBS: 'hbs'
};

const allTagLanguages = [TagLanguages.SIMPLE, TagLanguages.HBS];

function renderTag(tagLanguage, tag) {
    if (tagLanguage === TagLanguages.SIMPLE) {
        return `[${tag}]`;
    } else if (tagLanguage === TagLanguages.HBS) {
        return `{{${tag}}}`;
    }
}

function _getBases(trustedBaseUrl, sandboxBaseUrl, publicBaseUrl) {
    if (trustedBaseUrl.endsWith('/')) {
        trustedBaseUrl = trustedBaseUrl.substring(0, trustedBaseUrl.length - 1);
    }

    if (sandboxBaseUrl.endsWith('/')) {
        sandboxBaseUrl = sandboxBaseUrl.substring(0, sandboxBaseUrl.length - 1);
    }

    if (publicBaseUrl.endsWith('/')) {
        publicBaseUrl = publicBaseUrl.substring(0, publicBaseUrl.length - 1);
    }

    return {trustedBaseUrl, sandboxBaseUrl, publicBaseUrl};
}

function getMergeTagsForBases(trustedBaseUrl, sandboxBaseUrl, publicBaseUrl) {
    const bases = _getBases(trustedBaseUrl, sandboxBaseUrl, publicBaseUrl);

    return {
        URL_BASE: bases.publicBaseUrl,
        TRUSTED_URL_BASE: bases.trustedBaseUrl,
        SANDBOX_URL_BASE: bases.sandboxBaseUrl,
        ENCODED_URL_BASE: encodeURIComponent(bases.publicBaseUrl),
        ENCODED_TRUSTED_URL_BASE: encodeURIComponent(bases.trustedBaseUrl),
        ENCODED_SANDBOX_URL_BASE: encodeURIComponent(bases.sandboxBaseUrl)
    };
}

function base(text, trustedBaseUrl, sandboxBaseUrl, publicBaseUrl) {
    const bases = _getBases(trustedBaseUrl, sandboxBaseUrl, publicBaseUrl);

    text = text.split('[URL_BASE]').join(bases.publicBaseUrl);
    text = text.split('[TRUSTED_URL_BASE]').join(bases.trustedBaseUrl);
    text = text.split('[SANDBOX_URL_BASE]').join(bases.sandboxBaseUrl);
    text = text.split('[ENCODED_URL_BASE]').join(encodeURIComponent(bases.publicBaseUrl));
    text = text.split('[ENCODED_TRUSTED_URL_BASE]').join(encodeURIComponent(bases.trustedBaseUrl));
    text = text.split('[ENCODED_SANDBOX_URL_BASE]').join(encodeURIComponent(bases.sandboxBaseUrl));

    return text;
}

function unbase(text, trustedBaseUrl, sandboxBaseUrl, publicBaseUrl, treatAllAsPublic = false) {
    const bases = _getBases(trustedBaseUrl, sandboxBaseUrl, publicBaseUrl);

    text = text.split(bases.publicBaseUrl).join('[URL_BASE]');
    text = text.split(bases.trustedBaseUrl).join(treatAllAsPublic ? '[URL_BASE]' : '[TRUSTED_URL_BASE]');
    text = text.split(bases.sandboxBaseUrl).join(treatAllAsPublic ? '[URL_BASE]' : '[SANDBOX_URL_BASE]');
    text = text.split(encodeURIComponent(bases.publicBaseUrl)).join('[ENCODED_URL_BASE]');
    text = text.split(encodeURIComponent(bases.trustedBaseUrl)).join(treatAllAsPublic ? '[ENCODED_URL_BASE]' : '[ENCODED_TRUSTED_URL_BASE]');
    text = text.split(encodeURIComponent(bases.sandboxBaseUrl)).join(treatAllAsPublic ? '[ENCODED_URL_BASE]' : '[ENCODED_SANDBOX_URL_BASE]');

    return text;
}

module.exports = {
    base,
    unbase,
    getMergeTagsForBases,
    TagLanguages,
    allTagLanguages,
    renderTag
};