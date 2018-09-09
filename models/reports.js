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
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'report', id, 'view');

        const entity = await tx('reports')
            .where('reports.id', id)
            .innerJoin('report_templates', 'reports.report_template', 'report_templates.id')
            .select(['reports.id', 'reports.name', 'reports.description', 'reports.report_template', 'reports.params', 'reports.state', 'reports.namespace', 'report_templates.user_fields', 'report_templates.mime_type', 'report_templates.hbs', 'report_templates.js'])
            .first();

        entity.user_fields = JSON.parse(entity.user_fields);
        entity.params = JSON.parse(entity.params);

        entity.permissions = await shares.getPermissionsTx(tx, context, 'report', id);

        return entity;
    });
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
    let id;
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createReport');
        await shares.enforceEntityPermissionTx(tx, context, 'reportTemplate', entity.report_template, 'execute');

        await namespaceHelpers.validateEntity(tx, entity);

        entity.params = JSON.stringify(entity.params);

        const ids = await tx('reports').insert(filterObject(entity, allowedKeys));
        id = ids[0];

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'report', entityId: id });
    });

    const reportProcessor = require('../lib/report-processor');
    await reportProcessor.start(id);
    return id;
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'report', entity.id, 'edit');
        await shares.enforceEntityPermissionTx(tx, context, 'reportTemplate', entity.report_template, 'execute');

        const existing = await tx('reports').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.params = JSON.parse(existing.params);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await namespaceHelpers.validateEntity(tx, entity);
        await namespaceHelpers.validateMove(context, entity, existing, 'report', 'createReport', 'delete');

        entity.params = JSON.stringify(entity.params);

        const filteredUpdates = filterObject(entity, allowedKeys);
        filteredUpdates.state = ReportState.SCHEDULED;

        await tx('reports').where('id', entity.id).update(filteredUpdates);

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'report', entityId: entity.id });
    });

    // This require is here to avoid cyclic dependency
    const reportProcessor = require('../lib/report-processor');
    await reportProcessor.start(entity.id);
}

async function removeTx(tx, context, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'report', id, 'delete');

    await tx('reports').where('id', id).del();

    // FIXME: Remove generated files
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, id);
    });
}

async function removeAllByReportTemplateIdTx(tx, context, templateId) {
    const entities = await tx('reports').where('report_template', templateId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, entity.id);
    }
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
    tracker_count: 'campaign_links.count',
    country: 'campaign_links.country',
    device_type: 'campaign_links.device_type',
    status: 'campaign_messages.status',
    first_name: 'subscriptions.first_name',
    last_name: 'subscriptions.last_name',
    email: 'subscriptions.email'
};

async function getCampaignResults(context, campaign, select, extra) {
    const flds = await fields.list(context, campaign.list);

    const fieldsMapping = Object.assign({}, campaignFieldsMapping);
    for (const fld of flds) {
        /* Dropdown and checkbox groups have field.column == null
           TODO - For the time being, we don't group options and we don't expand enums. We just provide it as it is in the DB. */
        if (fld.column) {
            fieldsMapping[fld.key.toLowerCase()] = 'subscriptions.' + fld.column;
        }
    }

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

    let query = knex(`subscription__${campaign.list} AS subscriptions`)
        .innerJoin('campaign_messages', 'subscriptions.id', 'campaign_messages.subscription')
        .leftJoin('campaign_links', 'subscriptions.id', 'campaign_links.subscription')
        .where('campaign_messages.list', campaign.list)
        .where('campaign_links.list', campaign.list)
        .select(selFields);

    if (extra) {
        query = extra(query);
    }

    return await query;
}



module.exports.ReportState = ReportState;
module.exports.hash = hash;
module.exports.getByIdWithTemplate = getByIdWithTemplate;
module.exports.listDTAjax = listDTAjax;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.removeAllByReportTemplateIdTx = removeAllByReportTemplateIdTx;
module.exports.updateFields = updateFields;
module.exports.listByState = listByState;
module.exports.bulkChangeState = bulkChangeState;
module.exports.getCampaignResults = getCampaignResults;
