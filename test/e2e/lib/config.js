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
        one: {
            id: 1,
            cid: 'Hkj1vCoJb',
            publicSubscribe: 1,
            unsubscriptionMode: 0
        }
    },
    settings: {
        'service-url' : 'http://localhost:' + config.www.port + '/',
        'default-homepage': 'https://mailtrain.org',
        'smtp-hostname': config.testserver.host,
        'smtp-port': config.testserver.port,
        'smtp-encryption': 'NONE',
        'smtp-user': config.testserver.username,
        'smtp-pass': config.testserver.password
    }
};
