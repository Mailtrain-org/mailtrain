'use strict';

const knex = require('../lib/knex');

function getRequestContext(req) {
    const context = {
        user: req.user
    };

    return context;
}

function getServiceContext() {
    const context = {
        user: {
            id: 1,
            username: 'admin',
            name: 'Service worker',
            email: ''
        }
    };

    return context;
}

module.exports = {
    getRequestContext,
    getServiceContext
};