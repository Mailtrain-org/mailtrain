'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const namespaceHelpers = require('../lib/namespace-helpers');
const shares = require('./shares');

const allowedKeys = new Set(['name', 'description', 'type', 'data', 'namespace']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'mosaicoTemplate', id, 'view');
        const entity = await tx('mosaico_templates').where('id', id).first();
        entity.data = JSON.parse(entity.data);
        entity.permissions = await shares.getPermissionsTx(tx, context, 'mosaicoTemplate', id);
        return entity;
    });
}

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'mosaicoTemplate', requiredOperations: ['view'] }],
        params,
        builder => builder.from('mosaico_templates').innerJoin('namespaces', 'namespaces.id', 'mosaico_templates.namespace'),
        [ 'mosaico_templates.id', 'mosaico_templates.name', 'mosaico_templates.description', 'mosaico_templates.type', 'mosaico_templates.created', 'namespaces.name' ]
    );
}

async function _validateAndPreprocess(tx, entity) {
    entity.data = JSON.stringify(entity.data);
    await namespaceHelpers.validateEntity(tx, entity);
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createMosaicoTemplate');

        await _validateAndPreprocess(tx, entity);

        const ids = await tx('mosaico_templates').insert(filterObject(entity, allowedKeys));
        const id = ids[0];

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'mosaicoTemplate', entityId: id });

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceGlobalPermission(context, 'createJavascriptWithROAccess');
        await shares.enforceEntityPermissionTx(tx, context, 'mosaicoTemplate', entity.id, 'edit');

        const existing = await tx('mosaico_templates').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.data = JSON.parse(existing.data);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, entity);

        await namespaceHelpers.validateMove(context, entity, existing, 'mosaicoTemplate', 'createMosaicoTemplate', 'delete');

        await tx('mosaico_templates').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'mosaicoTemplate', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        const rows = await tx('templates').where('type', 'mosaico').select(['data']);
        for (const row of rows) {
            const data = JSON.parse(row.data);
            if (data.template === id) {
                throw new interoperableErrors.DependencyPresentError();
            }
        }

        await shares.enforceEntityPermissionTx(tx, context, 'mosaicoTemplate', id, 'delete');

        await tx('mosaico_templates').where('id', id).del();
    });
}

module.exports = {
    hash,
    getById,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove
};