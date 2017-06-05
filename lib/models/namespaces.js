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

        await tx('namespaces').where('id', ns.id).update(filterObject(ns, allowedUpdateKeys));
    });
}

async function remove(nsId) {
    await knex('namespaces').where('id', nsId).del();
}

module.exports = {
    hash,
    list,
    getById,
    create,
    updateWithConsistencyCheck,
    remove
};