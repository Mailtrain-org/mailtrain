'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const allowedKeys = new Set(['name', 'description', 'mime_type', 'user_fields', 'js', 'hbs']);

function hash(ns) {
    return hasher.hash(filterObject(ns, allowedKeys));
}

async function getById(templateId) {
    const template = await knex('report_templates').where('id', templateId).first();
    if (!template) {
        throw new interoperableErrors.NotFoundError();
    }

    return template;
}

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('report_templates'), ['report_templates.id', 'report_templates.name', 'report_templates.description', 'report_templates.created']);
}

async function create(template) {
    const templateId = await knex('report_templates').insert(filterObject(template, allowedKeys));
    return templateId;
}

async function updateWithConsistencyCheck(template) {
    await knex.transaction(async tx => {
        const existingTemplate = await tx('report_templates').where('id', template.id).first();
        if (!template) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingNsHash = hash(existingTemplate);
        if (existingNsHash != template.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await tx('report_templates').where('id', template.id).update(filterObject(template, allowedKeys));
    });
}

async function remove(templateId) {
    await knex('report_templates').where('id', templateId).del();
}

module.exports = {
    hash,
    getById,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove
};