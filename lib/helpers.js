'use strict';

let lists = require('./models/lists');
let fields = require('./models/fields');
let _ = require('./translate')._;

module.exports = {
    getDefaultMergeTags,
    getListMergeTags
};

function getDefaultMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [
        {
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
        }
    ]);
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
