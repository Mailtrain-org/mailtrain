'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');

const allowedKeys = new Set(['name', 'description', 'namespace']);

async function list() {
    return await knex('namespaces');
}

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, id) {
    await shares.enforceEntityPermission(context, 'namespace', id, 'view');

    const entity = await knex('namespaces').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

async function create(context, entity) {
    enforce(entity.namespace, 'Parent namespace must be set');
    await shares.enforceEntityPermission(context, 'namespace', entity.namespace, 'createNamespace');

    await knex.transaction(async tx => {
        if (!await tx('namespaces').select(['id']).where('id', entity.namespace).first()) {
            throw new interoperableErrors.DependencyNotFoundError();
        }

        const id = await tx('namespaces').insert(filterObject(entity, allowedKeys));

        // We don't have to rebuild all entity types, because no entity can be a child of the namespace at this moment.
        await shares.rebuildPermissions(tx, { entityTypeId: 'namespace', entityId: id });

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    enforce(entity.id !== 1 || entity.namespace === null, 'Cannot assign a parent to the root namespace.');
    await shares.enforceEntityPermission(context, 'namespace', entity.id, 'edit');

    await knex.transaction(async tx => {
        const existing = await tx('namespaces').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash != entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        let iter = entity;
        while (iter.namespace != null) {
            iter = await tx('namespaces').where('id', iter.namespace).first();

            if (!iter) {
                throw new interoperableErrors.DependencyNotFoundError();
            }

            if (iter.id == entity.id) {
                throw new interoperableErrors.LoopDetectedError();
            }
        }

        await tx('namespaces').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissions(tx);
    });
}

async function remove(context, id) {
    enforce(id !== 1, 'Cannot delete the root namespace.');
    await shares.enforceEntityPermission(context, 'namespace', id, 'delete');

    await knex.transaction(async tx => {
        const childNs = await tx('namespaces').where('namespace', id).first();
        if (childNs) {
            throw new interoperableErrors.ChildDetectedError();
        }

        await tx('namespaces').where('id', id).del();
    });
}

module.exports = {
    hash,
    list,
    getById,
    create,
    updateWithConsistencyCheck,
    remove
};