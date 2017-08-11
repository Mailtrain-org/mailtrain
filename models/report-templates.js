'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const namespaceHelpers = require('../lib/namespace-helpers');
const shares = require('./shares');

const allowedKeys = new Set(['name', 'description', 'mime_type', 'user_fields', 'js', 'hbs', 'namespace']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, id) {
    let entity;

    await knex.transaction(async tx => {

        await shares.enforceEntityPermissionTx(tx, context, 'reportTemplate', id, 'view');

        entity = await tx('report_templates').where('id', id).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        entity.permissions = await shares.getPermissions(tx, context, 'reportTemplate', id);
    });

    return entity;
}

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'reportTemplate', requiredOperations: ['view'] }],
        params,
        builder => builder.from('report_templates').innerJoin('namespaces', 'namespaces.id', 'report_templates.namespace'),
        [ 'report_templates.id', 'report_templates.name', 'report_templates.description', 'report_templates.created', 'namespaces.name' ]
    );
}

async function create(context, entity) {
    let id;
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createReportTemplate');
        await namespaceHelpers.validateEntity(tx, entity);

        const ids = await tx('report_templates').insert(filterObject(entity, allowedKeys));
        id = ids[0];

        await shares.rebuildPermissions(tx, { entityTypeId: 'reportTemplate', entityId: id });
    });

    return id;
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'reportTemplate', entity.id, 'edit');

        const existing = await tx('report_templates').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await namespaceHelpers.validateEntity(tx, entity);
        await namespaceHelpers.validateMove(context, entity, existing, 'reportTemplate', 'createReportTemplate', 'delete');

        await tx('report_templates').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissions(tx, { entityTypeId: 'reportTemplate', entityId: entity.id });
    });
}

async function remove(context, id) {
    await shares.enforceEntityPermission(context, 'reportTemplate', id, 'delete');

    await knex('report_templates').where('id', id).del();
}

async function getUserFieldsById(context, id) {
    await shares.enforceEntityPermission(context, 'reportTemplate', id, 'view');

    const entity = await knex('report_templates').select(['user_fields']).where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return JSON.parse(entity.user_fields);
}

module.exports = {
    hash,
    getById,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove,
    getUserFieldsById
};