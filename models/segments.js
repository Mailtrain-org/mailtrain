'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');

const allowedKeys = new Set(['name', 'settings']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function listDTAjax(context, listId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('segments')
                .where('list', listId),
            ['id', 'name']
        );
    });
}

async function list(context, listId) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        return await tx('segments').select(['id', 'name']).where('list', listId).orderBy('name', 'asc');
    });
}

async function getById(context, listId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');
        const entity = await tx('segments').where({id, list: listId}).first();
        entity.settings = JSON.parse(entity.settings);
        return entity;
    });
}

async function create(context, listId, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

        entity.settings = JSON.stringify(entity.params);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.list = listId;

        const ids = await tx('segments').insert(filteredEntity);
        const id = ids[0];

        return id;
    });
}

async function updateWithConsistencyCheck(context, listId, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

        const existing = await tx('segments').where({list: listId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        entity.settings = JSON.stringify(entity.params);

        await tx('segments').where('id', entity.id).update(filterObject(entity, allowedKeys));
    });
}


async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

    // The listId "where" is here to prevent deleting segment of a list for which a user does not have permission
    await tx('segments').where({list: listId, id: id}).del();
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, listId, id);
    });
}

async function removeAllByListIdTx(tx, context, listId) {
    const entities = await tx('segments').where('list', listId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, entity.id);
    }
}

async function removeRulesByFieldIdTx(tx, context, listId, fieldId) {
    // FIXME
}

module.exports = {
    listDTAjax,
    list,
    create,
    updateWithConsistencyCheck,
    remove,
    removeAllByListIdTx,
    removeRulesByFieldIdTx
};