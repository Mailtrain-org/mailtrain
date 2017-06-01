'use strict';

const config = require('config');

module.exports = {
    app: config,
    baseUrl: 'http://localhost:' + config.www.port,
    mailUrl: 'http://localhost:' + config.testserver.mailboxserverport,
    users: {
        admin: {
            username: 'admin',
            password: 'test'
        }
    },
    lists: {
        l1: {
            id: 1,
            cid: 'Hkj1vCoJb',
            publicSubscribe: 1,
            unsubscriptionMode: 0, // (one-step, no form)
        },
        l2: {
            id: 2,
            cid: 'SktV4HDZ-',
            publicSubscribe: 1,
            unsubscriptionMode: 1, // (one-step, with form)
        },
        l3: {
            id: 3,
            cid: 'BkdvNBw-W',
            publicSubscribe: 1,
            unsubscriptionMode: 2, // (two-step, no form)
        },
        l4: {
            id: 4,
            cid: 'rJMKVrDZ-',
            publicSubscribe: 1,
            unsubscriptionMode: 3, // (two-step, with form)
        },
        l5: {
            id: 5,
            cid: 'SJgoNSw-W',
            publicSubscribe: 1,
            unsubscriptionMode: 4, // (manual unsubscribe)
        },
        l6: {
            id: 6,
            cid: 'HyveEPvWW',
            publicSubscribe: 0,
            unsubscriptionMode: 0, // (one-step, no form)
        }
    },
    settings: {
        'service-url': 'http://localhost:' + config.www.port + '/',
        'admin-email': 'admin@example.com',
        'default-homepage': 'https://mailtrain.org',
        'smtp-hostname': config.testserver.host,
        'smtp-port': config.testserver.port,
        'smtp-encryption': 'NONE',
        'smtp-user': config.testserver.username,
        'smtp-pass': config.testserver.password
    }
};
