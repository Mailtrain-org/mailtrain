'use strict';

const knex = require('./knex');

function getRequestContext(req) {
    const context = {
        user: req.user
    };

    return context;
}

const adminContext = {
    user: {
        admin: true,
        id: 0,
        username: '',
        name: '',
        email: ''
    }
};

function getAdminContext() {
    return adminContext;
}

module.exports = {
    getRequestContext,
    getAdminContext
};