'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const {ImportType, ImportStatus, RunStatus, prepFinished, prepFinishedAndNotInProgress, runInProgress} = require('../shared/imports');
const fs = require('fs-extra-promise');
const path = require('path');
const importer = require('../lib/importer');

const filesDir = path.join(__dirname, '..', 'files', 'imports');

const allowedKeysCreate = new Set(['name', 'description', 'type', 'settings', 'mapping']);
const allowedKeysUpdate = new Set(['name', 'description', 'mapping']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeysUpdate));
}

async function getById(context, listId, id, withSampleRow = false) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        const entity = await tx('imports').where({list: listId, id}).first();

        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        entity.settings = JSON.parse(entity.settings);
        entity.mapping = JSON.parse(entity.mapping);

        if (withSampleRow && prepFinished(entity.status)) {
            if (entity.type === ImportType.CSV_FILE) {
                const importTable = 'import_file__' + id;

                const row = await tx(importTable).first();
                delete row.id;

                entity.sampleRow = row;
            }
        }

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
    entity.mapping = entity.mapping || {};

    if (isCreate && entity.type === ImportType.CSV_FILE) {
        entity.settings.csv = entity.settings.csv || {};
        enforce(entity.settings.csv.delimiter && entity.settings.csv.delimiter.trim(), 'CSV delimiter must not be empty');
    }
}

async function create(context, listId, entity, files) {
    const res = await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        await _validateAndPreprocess(tx, listId, entity, true);

        if (entity.type === ImportType.CSV_FILE) {
            enforce(files.csvFile, 'File must be included');
            const csvFile = files.csvFile[0];
            const filePath = path.join(filesDir, csvFile.filename);
            await fs.moveAsync(csvFile.path, filePath, {});

            entity.settings.csv = {
                originalname: csvFile.originalname,
                filename: csvFile.filename,
                delimiter: entity.settings.csv.delimiter
            };

            entity.status = ImportStatus.PREP_SCHEDULED;
        }


        const filteredEntity = filterObject(entity, allowedKeysCreate);
        filteredEntity.list = listId;
        filteredEntity.settings = JSON.stringify(filteredEntity.settings);
        filteredEntity.mapping = JSON.stringify(filteredEntity.mapping);

        const ids = await tx('imports').insert(filteredEntity);
        const id = ids[0];

        return id;
    });

    importer.scheduleCheck();
    return res;
}

async function updateWithConsistencyCheck(context, listId, entity) {
    await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        const existing = await tx('imports').where({list: listId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.mapping = JSON.parse(existing.mapping);
        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        enforce(prepFinishedAndNotInProgress(existing.status), 'Cannot save updates until preparation or run is finished');

        enforce(entity.type === existing.type, 'Import type cannot be changed');
        await _validateAndPreprocess(tx, listId, entity, false);

        const filteredEntity = filterObject(entity, allowedKeysUpdate);
        filteredEntity.list = listId;
        filteredEntity.mapping = JSON.stringify(filteredEntity.mapping);

        await tx('imports').where({list: listId, id: entity.id}).update(filteredEntity);
    });
}

async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

    const existing = await tx('imports').where({list: listId, id: id}).first();
    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    existing.settings = JSON.parse(existing.settings);

    const filePath = path.join(filesDir, existing.settings.csv.filename);
    await fs.removeAsync(filePath);

    const importTable = 'import_file__' + id;
    await knex.schema.dropTableIfExists(importTable);

    await tx('import_failed').whereIn('run', function() {this.from('import_runs').select('id').where('import', id)}).del();
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

async function start(context, listId, id) {
    await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        const entity = await tx('imports').where({list: listId, id}).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        if (!prepFinishedAndNotInProgress(entity.status)) {
            throw new interoperableErrors.InvalidStateError('Cannot start until preparation or run is finished');
        }

        await tx('imports').where({list: listId, id}).update({
            status: ImportStatus.RUN_SCHEDULED
        });

        await tx('import_runs').insert({
            import: id,
            status: RunStatus.SCHEDULED,
            mapping: entity.mapping
        });
    });

    importer.scheduleCheck();
}

async function stop(context, listId, id) {
    await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'setupAutomation');
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageImports');

        const entity = await tx('imports').where({list: listId, id}).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        if (!runInProgress(entity.status)) {
            throw new interoperableErrors.InvalidStateError('No import is currently running');
        }

        await tx('imports').where({list: listId, id}).update({
            status: ImportStatus.RUN_STOPPING
        });

        await tx('import_runs').where('import', id).whereIn('status', [RunStatus.SCHEDULED, RunStatus.RUNNING]).update({
            status: RunStatus.STOPPING
        });
    });

    importer.scheduleCheck();
}


// This is to handle circular dependency with segments.js
module.exports = {
    filesDir,
    hash,
    getById,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove,
    removeAllByListIdTx,
    start,
    stop
};