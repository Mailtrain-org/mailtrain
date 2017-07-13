'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const Status = {
    SUBSCRIBED: 1,
    UNSUBSCRIBED: 2,
    BOUNCED: 3,
    COMPLAINED: 4,
    MAX: 5
};

async function list(listId) {
    return await knex(`subscription__${listId}`);
}


module.exports = {
    Status,
    list
};