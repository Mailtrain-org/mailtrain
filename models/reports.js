'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const allowedKeys = new Set(['name', 'description', 'report_template', 'params']);

const ReportState = {
    SCHEDULED: 0,
    PROCESSING: 1,
    FINISHED: 2,
    FAILED: 3,
    MAX: 4
};


function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getByIdWithUserFields(id) {
    const entity = await knex('reports').where('reports.id', id).innerJoin('report_templates', 'reports.report_template', 'report_templates.id').select(['reports.id', 'reports.name', 'reports.description', 'reports.report_template', 'reports.params', 'report_templates.user_fields']).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    entity.user_fields = JSON.parse(entity.user_fields);
    entity.params = JSON.parse(entity.params);

    return entity;
}

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('reports').innerJoin('report_templates', 'reports.report_template', 'report_templates.id'), ['reports.id', 'reports.name', 'report_templates.name', 'reports.description', 'reports.last_run', 'reports.state']);
}

async function create(entity) {
    await knex.transaction(async tx => {
        if (!await tx('report_templates').select(['id']).where('id', entity.report_template).first()) {
            throw new interoperableErrors.DependencyNotFoundError();
        }

        entity.params = JSON.stringify(entity.params);

        const id = await tx('reports').insert(filterObject(entity, allowedKeys));

        return id;
    });
}

async function updateWithConsistencyCheck(entity) {
    await knex.transaction(async tx => {
        const existing = await tx('reports').where('id', entity.id).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.params = JSON.parse(existing.params);

        const existingHash = hash(existing);
        if (existingHash != entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        if (!await tx('report_templates').select(['id']).where('id', entity.report_template).first()) {
            throw new interoperableErrors.DependencyNotFoundError();
        }

        entity.params = JSON.stringify(entity.params);

        await tx('reports').where('id', entity.id).update(filterObject(entity, allowedKeys));
    });
}

async function remove(id) {
    await knex('reports').where('id', id).del();
}

async function updateFields(id, fields) {
    return await knex('reports').where('id', id).update(fields);
}

async function listByState(state, limit) {
    return await knex('reports').where('state', state).limit(limit);
}

async function bulkChangeState(oldState, newState) {
    return await knex('reports').where('state', oldState).update('state', newState);
}



module.exports = {
    ReportState,
    hash,
    getByIdWithUserFields,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove,
    updateFields,
    listByState,
    bulkChangeState
};