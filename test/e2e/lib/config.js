'use strict';

const config = require('config');

module.exports = {
    app: config,
    baseUrl: 'http://localhost:' + config.www.port,
    mailUrl: 'http://localhost:' + config.testserver.mailboxserverport,
    users: {
        admin: {
            username: 'admin',
            password: 'test',
            email: 'keep.admin@mailtrain.org',
            accessToken: '7833d148e22c85474c314f43ae4591a7c9adec26'
        }
    },
    lists: {
        l1: {
            id: 1,
            cid: 'Hkj1vCoJb',
            publicSubscribe: 1,
            unsubscriptionMode: 0, // (one-step, no form)
            customFields: [
                { type: 'text', key: 'MERGE_TEXT', column: 'custom_text_field_byiiqjrw' },
                { type: 'number', key: 'MERGE_NUMBER', column: 'custom_number_field_r1dd91awb' },
                { type: 'website', key: 'MERGE_WEBSITE', column: 'custom_website_field_rkq991cw' },
                { type: 'gpg', key: 'MERGE_GPG_PUBLIC_KEY', column: 'custom_gpg_public_key_ryvj51cz' },
                { type: 'longtext', key: 'MERGE_MULTILINE_TEXT', column: 'custom_multiline_text_bjbfojawb' },
                { type: 'json', key: 'MERGE_JSON', column: 'custom_json_skqjkcb' },
                { type: 'date-us', key: 'MERGE_DATE_MMDDYYYY', column: 'custom_date_mmddyy_rjkeojrzz' },
                { type: 'date-eur', key: 'MERGE_DATE_DDMMYYYY', column: 'custom_date_ddmmyy_ryedsk0wz' },
                { type: 'birthday-us', key: 'MERGE_BIRTHDAY_MMDD', column: 'custom_birthday_mmdd_h18coj0zz' },
                { type: 'birthday-eur', key: 'MERGE_BIRTHDAY_DDMM', column: 'custom_birthday_ddmm_r1g3s1czz' },
                // TODO: Add remaining custom fields, dropdowns and checkboxes
            ]
        },
        l2: {
            id: 2,
            cid: 'SktV4HDZ-',
            publicSubscribe: 1,
            unsubscriptionMode: 1, // (one-step, with form)
            customFields: []
        },
        l3: {
            id: 3,
            cid: 'BkdvNBw-W',
            publicSubscribe: 1,
            unsubscriptionMode: 2, // (two-step, no form)
            customFields: []
        },
        l4: {
            id: 4,
            cid: 'rJMKVrDZ-',
            publicSubscribe: 1,
            unsubscriptionMode: 3, // (two-step, with form)
            customFields: []
        },
        l5: {
            id: 5,
            cid: 'SJgoNSw-W',
            publicSubscribe: 1,
            unsubscriptionMode: 4, // (manual unsubscribe)
            customFields: []
        },
        l6: {
            id: 6,
            cid: 'HyveEPvWW',
            publicSubscribe: 0,
            unsubscriptionMode: 0, // (one-step, no form)
            customFields: []
        }
    },
    settings: {
        'service-url': 'http://localhost:' + config.www.port + '/',
        'admin-email': 'keep.admin@mailtrain.org',
        'default-homepage': 'https://mailtrain.org',
        'smtp-hostname': config.testserver.host,
        'smtp-port': config.testserver.port,
        'smtp-encryption': 'NONE',
        'smtp-user': config.testserver.username,
        'smtp-pass': config.testserver.password
    }
};
