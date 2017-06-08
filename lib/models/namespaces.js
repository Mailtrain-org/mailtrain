'use strict';

const knex = require('../knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../helpers');
const interoperableErrors = require('../../shared/interoperable-errors');

const allowedKeys = new Set(['id', 'name', 'description', 'parent']);
const allowedUpdateKeys = new Set(['name', 'description', 'parent']);

async function list() {
    return await knex('namespaces');
}

function hash(ns) {
    return hasher.hash(filterObject(ns, allowedKeys));
}

async function getById(nsId) {
    const ns = await knex('namespaces').where('id', nsId).first();
    if (!ns) {
        throw new interoperableErrors.NotFoundError();
    }

    ns.hash = hash(ns);

    return ns;
}

async function create(ns) {
    const nsId = await knex('namespaces').insert(filterObject(ns, allowedKeys));
    return nsId;
}

async function updateWithConsistencyCheck(ns) {
    enforce(ns.id !== 1 || ns.parent === null, 'Cannot assign a parent to the root namespace.');

    await knex.transaction(async tx => {
        const existingNs = await tx('namespaces').where('id', ns.id).first();
        if (!ns) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingNsHash = hash(existingNs);
        if (existingNsHash != ns.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        let iter = ns;
        while (iter.parent != null) {
            iter = await tx('namespaces').where('id', iter.parent).first();
            if (iter.id == ns.id) {
                throw new interoperableErrors.LoopDetectedError();
            }
        }

        await tx('namespaces').where('id', ns.id).update(filterObject(ns, allowedUpdateKeys));
    });
}

async function remove(nsId) {
    enforce(nsId !== 1, 'Cannot delete the root namespace.');

    await knex.transaction(async tx => {
        const childNs = await tx('namespaces').where('parent', nsId).first();
        if (childNs) {
            throw new interoperableErrors.ChildDetectedError();
        }

        await tx('namespaces').where('id', nsId).del();
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