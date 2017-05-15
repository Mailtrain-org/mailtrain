'use strict';

const config = require('config');
const knex = require('../knex');

module.exports.list = () => {
    return knex('namespaces');
};
