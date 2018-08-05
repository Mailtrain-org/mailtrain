'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const {ImportType, ImportStatus, RunStatus} = require('../shared/imports');
const fs = require('fs-extra-promise');
const path = require('path');

const filesDir = path.join(__dirname, '..', 'files', 'imports');

const allowedKeys = new Set(['name', 'description', 'type', 'settings']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, listId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        const entity = await tx('imports').where({list: listId, id}).first();
        entity.settings = JSON.parse(entity.settings);

        return entity;
    });
}

async function listDTAjax(context, listId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('imports')
                .where('imports.list', listId),
            [ 'imports.id', 'imports.name', 'imports.description', 'imports.type', 'imports.status', 'imports.last_run' ]
        );
    });
}

async function _validateAndPreprocess(tx, listId, entity, isCreate) {
    enforce(Number.isInteger(entity.type));
    enforce(entity.type >= ImportType.MIN && entity.type <= ImportType.MAX, 'Invalid import type');

    entity.settings = entity.settings || {};
}

async function create(context, listId, entity, files) {
    return await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        await _validateAndPreprocess(tx, listId, entity, true);

        // FIXME - set status

        if (entity.type === ImportType.CSV_FILE) {
            enforce(files.csvFile, 'File must be included');
            const csvFile = files.csvFile[0];
            const filePath = path.join(filesDir, csvFile.filename);
            await fs.moveAsync(csvFile.path, filePath, {});

            entity.settings.csv = {
                originalname: csvFile.originalname,
                filename: csvFile.filename
            };

            entity.status = ImportStatus.NOT_READY;
        }


        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.list = listId;
        filteredEntity.settings = JSON.stringify(filteredEntity.settings);

        const ids = await tx('imports').insert(filteredEntity);
        const id = ids[0];

        return id;
    });
}

async function updateWithConsistencyCheck(context, listId, entity, files) {
    await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        const existing = await tx('imports').where({list: listId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.settings = JSON.parse(existing.settings);
        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        enforce(entity.type === existing.type, 'Import type cannot be changed');
        await _validateAndPreprocess(tx, listId, entity, false);

        if (entity.type === ImportType.CSV_FILE) {
            entity.settings.csv =  existing.settings.csv;
        }

        // FIXME - set status
        // FIXME - create CSV import table

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.list = listId;
        filteredEntity.settings = JSON.stringify(filteredEntity.settings);

        await tx('imports').where({list: listId, id: entity.id}).update(filteredEntity);
    });
}

async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

    const existing = await tx('imports').where({list: listId, id: id}).first();
    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    // FIXME - remove csv import table

    await tx('import_failed').whereIn('run', function() {this.from('import_runs').select('id').where('import', id)});
    await tx('import_runs').where('import', id).del();
    await tx('imports').where({list: listId, id}).del();
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, listId, id);
    });
}

async function removeAllByListIdTx(tx, context, listId) {
    const entities = await tx('imports').where('list', listId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, listId, entity.id);
    }
}


// This is to handle circular dependency with segments.js
module.exports = {
    hash,
    getById,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove,
    removeAllByListIdTx
};