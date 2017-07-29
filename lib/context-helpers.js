'use strict';

const knex = require('../lib/knex');

function getRequestContext(req) {
    const context = {
        user: req.user
    };

    return context;
}

function getAdminContext() {
    const context = {
        user: {
            admin: true,
            id: 0,
            username: '',
            name: '',
            email: ''
        }
    };

    return context;
}

module.exports = {
    getRequestContext,
    getAdminContext
};