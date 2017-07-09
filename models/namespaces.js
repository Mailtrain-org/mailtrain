'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const allowedKeys = new Set(['name', 'description', 'parent']);

async function list() {
    return await knex('namespaces');
}

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(id) {
    const entity = await knex('namespaces').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

async function create(entity) {
    await knex.transaction(async tx => {
        const id = await tx('namespaces').insert(filterObject(entity, allowedKeys));

        if (entity.parent) {
            if (!await tx('namespaces').select(['id']).where('id', entity.parent).first()) {
                throw new interoperableErrors.DependencyNotFoundError();
            }
        }

        return id;
    });
}

async function updateWithConsistencyCheck(entity) {
    enforce(entity.id !== 1 || entity.parent === null, 'Cannot assign a parent to the root namespace.');

    await knex.transaction(async tx => {
        const existing = await tx('namespaces').where('id', entity.id).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash != entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        let iter = entity;
        while (iter.parent != null) {
            iter = await tx('namespaces').where('id', iter.parent).first();

            if (!iter) {
                throw new interoperableErrors.DependencyNotFoundError();
            }

            if (iter.id == entity.id) {
                throw new interoperableErrors.LoopDetectedError();
            }
        }

        await tx('namespaces').where('id', entity.id).update(filterObject(entity, allowedKeys));
    });
}

async function remove(id) {
    enforce(id !== 1, 'Cannot delete the root namespace.');

    await knex.transaction(async tx => {
        const childNs = await tx('namespaces').where('parent', id).first();
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