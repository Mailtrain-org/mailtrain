'use strict';

let lists = require('./models/lists');
let fields = require('./models/fields');
let _ = require('./translate')._;

module.exports = {
    getDefaultMergeTags,
    getRSSMergeTags,
    getListMergeTags,
    rollbackAndReleaseConnection,
    filterObject,
    enforce
};

function getDefaultMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [{
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
        key: 'FIRST_NAME',
        value: _('First name')
    }, {
        key: 'LAST_NAME',
        value: _('Last name')
    }, {
        key: 'FULL_NAME',
        value: _('Full name (first and last name combined)')
    }, {
        key: 'SUBSCRIPTION_ID',
        value: _('Unique ID that identifies the recipient')
    }, {
        key: 'LIST_ID',
        value: _('Unique ID that identifies the list used for this campaign')
    }, {
        key: 'CAMPAIGN_ID',
        value: _('Unique ID that identifies current campaign')
    }]);
}

function getRSSMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [{
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
    }]);
}

function getListMergeTags(listId, callback) {
    lists.get(listId, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            list = {
                id: listId
            };
        }

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            let mergeTags = [];

            fieldList.forEach(field => {
                mergeTags.push({
                    key: field.key,
                    value: field.name
                });
            });

            return callback(null, mergeTags);
        });
    });
}

// FIXME - remove once we get rid of non-async models
function rollbackAndReleaseConnection(connection, callback) {
    connection.rollback(() => {
        connection.release();
        return callback();
    });
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

function enforce(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}