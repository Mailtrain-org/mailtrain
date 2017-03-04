'use strict';

let lists = require('./models/lists');
let fields = require('./models/fields');

module.exports = {
    getDefaultMergeTags,
    getListMergeTags,
};

function getDefaultMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [
        {
            key: 'LINK_UNSUBSCRIBE',
            value: 'URL that points to the unsubscribe page'
        }, {
            key: 'LINK_PREFERENCES',
            value: 'URL that points to the preferences page of the subscriber'
        }, {
            key: 'LINK_BROWSER',
            value: 'URL to preview the message in a browser'
        }, {
            key: 'EMAIL',
            value: 'Email address'
        }, {
            key: 'FIRST_NAME',
            value: 'First name'
        }, {
            key: 'LAST_NAME',
            value: 'Last name'
        }, {
            key: 'FULL_NAME',
            value: 'Full name (first and last name combined)'
        }, {
            key: 'SUBSCRIPTION_ID',
            value: 'Unique ID that identifies the recipient'
        }, {
            key: 'LIST_ID',
            value: 'Unique ID that identifies the list used for this campaign'
        }, {
            key: 'CAMPAIGN_ID',
            value: 'Unique ID that identifies current campaign'
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
