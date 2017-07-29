'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const fields = require('./fields');
const namespaceHelpers = require('../lib/namespace-helpers');
const shares = require('./shares');

const ReportState = require('../shared/reports').ReportState;

const allowedKeys = new Set(['name', 'description', 'report_template', 'params', 'namespace']);


function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getByIdWithTemplate(context, id) {
    await shares.enforceEntityPermission(context, 'report', id, 'view');

    const entity = await knex('reports')
        .where('reports.id', id)
        .innerJoin('report_templates', 'reports.report_template', 'report_templates.id')
        .select(['reports.id', 'reports.name', 'reports.description', 'reports.report_template', 'reports.params', 'reports.state', 'reports.namespace', 'report_templates.user_fields', 'report_templates.mime_type', 'report_templates.hbs', 'report_templates.js'])
        .first();

    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    entity.user_fields = JSON.parse(entity.user_fields);
    entity.params = JSON.parse(entity.params);

    return entity;
}

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [
            { entityTypeId: 'report', requiredOperations: ['view'] },
            { entityTypeId: 'reportTemplate', requiredOperations: ['view'] }
        ],
        params,
        builder => builder.from('reports')
            .innerJoin('report_templates', 'reports.report_template', 'report_templates.id')
            .innerJoin('namespaces', 'namespaces.id', 'reports.namespace'),
        [
            'reports.id', 'reports.name', 'report_templates.name', 'reports.description',
            'reports.last_run', 'namespaces.name', 'reports.state', 'report_templates.mime_type'
        ]
    );
}

async function create(context, entity) {
    await shares.enforceEntityPermission(context, 'namespace', entity.namespace, 'createReport');
    await shares.enforceEntityPermission(context, 'reportTemplate', entity.report_template, 'execute');

    let id;
    await knex.transaction(async tx => {
        await namespaceHelpers.validateEntity(tx, entity);

        if (!await tx('report_templates').select(['id']).where('id', entity.report_template).first()) {
            throw new interoperableErrors.DependencyNotFoundError();
        }

        entity.params = JSON.stringify(entity.params);

        const ids = await tx('reports').insert(filterObject(entity, allowedKeys));
        id = ids[0];

        await shares.rebuildPermissions(tx, { entityTypeId: 'report', entityId: id });
    });

    const reportProcessor = require('../lib/report-processor');
    await reportProcessor.start(id);
    return id;
}

async function updateWithConsistencyCheck(context, entity) {
    await shares.enforceEntityPermission(context, 'report', entity.id, 'edit');
    await shares.enforceEntityPermission(context, 'reportTemplate', entity.report_template, 'execute');

    await knex.transaction(async tx => {
        const existing = await tx('reports').where('id', entity.id).first();
        if (!existing) {
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

        await namespaceHelpers.validateEntity(tx, entity);
        await namespaceHelpers.validateMove(context, entity, existing, 'report', 'createReport', 'delete');

        entity.params = JSON.stringify(entity.params);

        const filteredUpdates = filterObject(entity, allowedKeys);
        filteredUpdates.state = ReportState.SCHEDULED;

        await tx('reports').where('id', entity.id).update(filteredUpdates);

        await shares.rebuildPermissions(tx, { entityTypeId: 'report', entityId: entity.id });
    });

    // This require is here to avoid cyclic dependency
    const reportProcessor = require('../lib/report-processor');
    await reportProcessor.start(entity.id);
}

async function remove(context, id) {
    await shares.enforceEntityPermission(context, 'report', id, 'delete');

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


const campaignFieldsMapping = {
    tracker_count: 'tracker.count',
    country: 'tracker.country',
    device_type: 'tracker.device_type',
    status: 'campaign.status',
    first_name: 'subscribers.first_name',
    last_name: 'subscribers.last_name',
    email: 'subscribers.email'
};

function customFieldName(id) {
    return id.replace(/MERGE_/, 'CUSTOM_').toLowerCase();
}

async function getCampaignResults(context, campaign, select, extra) {
    const fieldList = await fields.list(campaign.list);

    const fieldsMapping = fieldList.reduce((map, field) => {
        /* Dropdowns and checkboxes are aggregated. As such, they have field.column == null and the options are in field.options.
           TODO - For the time being, we ignore groupped fields. */
        if (field.column) {
            map[customFieldName(field.key)] = 'subscribers.' + field.column;
        }
        return map;
    }, Object.assign({}, campaignFieldsMapping));

    let selFields = [];
    for (let idx = 0; idx < select.length; idx++) {
        const item = select[idx];
        if (item in fieldsMapping) {
            selFields.push(fieldsMapping[item] + ' AS ' + item);
        } else if (item === '*') {
            selFields = selFields.concat(Object.keys(fieldsMapping).map(item => fieldsMapping[item] + ' AS ' + item));
        } else {
            selFields.push(item);
        }
    }

    let query = knex(`subscription__${campaign.list} AS subscribers`)
        .innerJoin(`campaign__${campaign.id} AS campaign`, 'subscribers.id', 'campaign.subscription')
        .leftJoin(`campaign_tracker__${campaign.id} AS tracker`, 'subscribers.id', 'tracker.subscriber')
        .select(selFields);

    if (extra) {
        query = extra(query);
    }

    return await query;
}



module.exports = {
    ReportState,
    hash,
    getByIdWithTemplate,
    listDTAjax,
    create,
    updateWithConsistencyCheck,
    remove,
    updateFields,
    listByState,
    bulkChangeState,
    getCampaignResults
};