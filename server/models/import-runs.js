'use strict';

const knex = require('../lib/knex');
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');

async function getById(context, listId, importId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        const entity = await tx('import_runs')
            .innerJoin('imports', 'import_runs.import', 'imports.id')
            .where({'imports.list': listId, 'imports.id': importId, 'import_runs.id': id})
            .select('import_runs.id', 'import_runs.import', 'import_runs.status', 'import_runs.new',
                'import_runs.failed', 'import_runs.processed', 'import_runs.error', 'import_runs.created', 'import_runs.finished')
            .first();

        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        return entity;
    });
}

async function listDTAjax(context, listId, importId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('import_runs')
                .innerJoin('imports', 'import_runs.import', 'imports.id')
                .where({'imports.list': listId, 'imports.id': importId})
                .orderBy('import_runs.id', 'desc'),
            [ 'import_runs.id', 'import_runs.created', 'import_runs.finished', 'import_runs.status', 'import_runs.processed', 'import_runs.new', 'import_runs.failed']
        );
    });
}

async function listFailedDTAjax(context, listId, importId, importRunId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewImports');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('import_failed')
                .innerJoin('import_runs', 'import_failed.run', 'import_runs.id')
                .innerJoin('imports', 'import_runs.import', 'imports.id')
                .where({'imports.list': listId, 'imports.id': importId, 'import_runs.id': importRunId})
                .orderBy('import_failed.source_id', 'asc'),
            [ 'import_failed.id', 'import_failed.source_id', 'import_failed.email', 'import_failed.reason']
        );
    });
}



module.exports.getById = getById;
module.exports.listDTAjax = listDTAjax;
module.exports.listFailedDTAjax = listFailedDTAjax;
