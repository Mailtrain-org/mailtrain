'use strict';

const { enforce } = require('./helpers');
const shares = require('../models/shares');
const interoperableErrors = require('../../shared/interoperable-errors');

async function validateEntity(tx, entity) {
    enforce(entity.namespace, 'Entity namespace not set');
    if (!await tx('namespaces').where('id', entity.namespace).first()) {
        throw new interoperableErrors.NamespaceNotFoundError();
    }
}

async function validateMove(context, entity, existing, entityTypeId, createOperation, deleteOperation) {
    if (existing.namespace !== entity.namespace) {
        await shares.enforceEntityPermission(context, 'namespace', entity.namespace, createOperation);
        await shares.enforceEntityPermission(context, entityTypeId, entity.id, deleteOperation);
    }
}

module.exports = {
    validateEntity,
    validateMove
};