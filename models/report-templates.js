'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const allowedKeys = new Set(['name', 'description', 'mime_type', 'user_fields', 'js', 'hbs']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(id) {
    const entity = await knex('report_templates').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('report_templates'), ['report_templates.id', 'report_templates.name', 'report_templates.description', 'report_templates.created']);
}

async function create(entity) {
    const id = await knex('report_templates').insert(filterObject(entity, allowedKeys));
    return id;
}

async function updateWithConsistencyCheck(template) {
    await knex.transaction(async tx => {
        const existing = await tx('report_templates').where('id', template.id).first();
        if (!template) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash != template.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await tx('report_templates').where('id', template.id).update(filterObject(template, allowedKeys));
    });
}

async function remove(id) {
    await knex('report_templates').where('id', id).del();
}

async function getUserFieldsById(id) {
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