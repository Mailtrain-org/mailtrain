'use strict';

let _ = require('./translate')._;

module.exports = {
    getDefaultMergeTags,
    getRSSMergeTags,
    enforce,
    cleanupFromPost,
    filterObject
};

function getDefaultMergeTags() {
    return [{
        key: 'LINK_UNSUBSCRIBE',
        value: _('URL that points to the unsubscribe page')
    }, {
        key: 'LINK_PREFERENCES',
        value: _('URL that points to the preferences page of the subscriber')
    }, {
        key: 'LINK_BROWSER',
        value: _('URL to preview the message in a browser')
    }, {
        key: 'EMAIL',
        value: _('Email address')
    }, {
        key: 'SUBSCRIPTION_ID',
        value: _('Unique ID that identifies the recipient')
    }, {
        key: 'LIST_ID',
        value: _('Unique ID that identifies the list used for this campaign')
    }, {
        key: 'CAMPAIGN_ID',
        value: _('Unique ID that identifies current campaign')
    }];
}

function getRSSMergeTags() {
    return [{
        key: 'RSS_ENTRY',
        value: _('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_TITLE',
        value: _('RSS entry title')
    }, {
        key: 'RSS_ENTRY_DATE',
        value: _('RSS entry date')
    }, {
        key: 'RSS_ENTRY_LINK',
        value: _('RSS entry link')
    }, {
        key: 'RSS_ENTRY_CONTENT',
        value: _('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_SUMMARY',
        value: _('RSS entry summary')
    }, {
        key: 'RSS_ENTRY_IMAGE_URL',
        value: _('RSS entry image URL')
    }];
}

function enforce(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function cleanupFromPost(value) {
    return (value || '').toString().trim();
}

function filterObject(obj, allowedKeys) {
    const result = {};
    for (const key in obj) {
        if (allowedKeys.has(key)) {
            result[key] = obj[key];
        }
    }

    return result;
}