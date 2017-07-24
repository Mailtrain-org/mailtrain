'use strict';

const knex = require('./knex');
const { enforce } = require('./helpers');
const interoperableErrors = require('../shared/interoperable-errors');

async function validateEntity(tx, entity) {
    enforce(entity.namespace, 'Entity namespace not set');
    if (!await tx('namespaces').where('id', entity.namespace).first()) {
        throw new interoperableErrors.DependencyNotFoundError();
    }
}

module.exports = {
    validateEntity
};