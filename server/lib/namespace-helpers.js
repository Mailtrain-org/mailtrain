'use strict';

const { enforce } = require('./helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('../models/shares');

async function validateEntity(tx, entity) {
    enforce(entity.namespace, 'Entity namespace not set');
    if (!await tx('namespaces').where('id', entity.namespace).first()) {
        throw new interoperableErrors.NamespaceNotFoundError();
    }
}

async function validateMoveTx(tx, context, entity, existing, entityTypeId, createOperation, deleteOperation) {
    if (existing.namespace !== entity.namespace) {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, createOperation);
        await shares.enforceEntityPermissionTx(tx, context, entityTypeId, entity.id, deleteOperation);
    }
}

module.exports = {
    validateEntity,
    validateMoveTx
};