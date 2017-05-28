'use strict';

const knex = require('../knex');

module.exports.list = () => knex('namespaces');
