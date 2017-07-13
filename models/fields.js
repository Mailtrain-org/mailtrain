'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const fieldsLegacy = require('../lib/models/fields');
const bluebird = require('bluebird');

module.exports = {
    list: bluebird.promisify(fieldsLegacy.list)
};