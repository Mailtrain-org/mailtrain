'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const fields = require('./fields');
const namespaceHelpers = require('../lib/namespace-helpers');
const shares = require('./shares');
const reportHelpers = require('../lib/report-helpers');
const fs = require('fs-extra-promise');
const contextHelpers = require('../lib/context-helpers');
const {LinkId} = require('./links');
const subscriptions = require('./subscriptions');
const {Readable} = require('stream');

const ReportState = require('../../shared/reports').ReportState;

const allowedKeys = new Set(['name', 'description', 'report_template', 'params', 'namespace']);


function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getByIdWithTemplate(context, id, withPermissions = true) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'report', id, 'view');

        const entity = await tx('reports')
            .where('reports.id', id)
            .innerJoin('report_templates', 'reports.report_template', 'report_templates.id')
            .select(['reports.id', 'reports.name', 'reports.description', 'reports.report_template', 'reports.params', 'reports.state', 'reports.namespace', 'report_templates.user_fields', 'report_templates.mime_type', 'report_templates.hbs', 'report_templates.js'])
            .first();

        entity.user_fields = JSON.parse(entity.user_fields);
        entity.params = JSON.parse(entity.params);

        if (withPermissions) {
            entity.permissions = await shares.getPermissionsTx(tx, context, 'report', id);
        }

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
        await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'report', 'createReport', 'delete');

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

    const report = await tx('reports').where('id', id).first();

    await fs.removeAsync(reportHelpers.getReportContentFile(report));
    await fs.removeAsync(reportHelpers.getReportOutputFile(report));

    await tx('reports').where('id', id).del();
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, id);
    });
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

async function getCampaignCommonListFields(campaign) {
    const listFields = {};
    let firstIteration = true;
    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const flds = await fields.list(contextHelpers.getAdminContext(), cpgListId);

        const assignedFlds = new Set();

        for (const fld of flds) {
            /* Dropdown and checkbox groups have field.column == null
               For the time being, we don't group options and we don't expand enums. We just provide it as it is in the DB. */
            if (fld.column) {
                const fldKey = 'field:' + fld.key.toLowerCase();

                if (firstIteration) {
                    listFields[fldKey] = {
                        key: fld.key,
                        name: fld.name,
                        description: fld.description
                    };
                }

                if (fldKey in listFields) {
                    assignedFlds.add(fldKey);
                }
            }
        }

        for (const fldKey in listFields) {
            if (!assignedFlds.has(fldKey)) {
                delete listFields[fldKey];
            }
        }

        firstIteration = false;
    }

    return listFields;
}

async function _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, asStream) {
    const subsQrys = [];
    joins = joins || [];

    const knexJoinFns = [];

    const commonFieldsMapping = {
        'subscription:status': 'subscriptions.status',
        'subscription:id': 'subscriptions.id',
        'subscription:cid': 'subscriptions.cid',
        'subscription:email': 'subscriptions.email'
    };

    for (const join of joins) {
        const prefix = join.prefix;
        const type = join.type;
        const onConditions = join.onConditions || {};

        const getConds = (alias, cpgListId) => {
            const conds = {
                [alias + '.campaign']: knex.raw('?', [campaign.id]),
                [alias + '.list']: knex.raw('?', [cpgListId]),
                [alias + '.subscription']: 'subscriptions.id',
            };

            for (const onConditionKey in onConditions) {
                conds[alias + '.' + onConditionKey] = onConditions[onConditionKey];
            }

            return conds;
        };

        if (type === 'messages') {
            const alias = 'campaign_messages_' + prefix;

            commonFieldsMapping[`${prefix}:status`] = alias + '.status';

            knexJoinFns.push((qry, cpgListId) => qry.leftJoin('campaign_messages AS ' + alias, getConds(alias, cpgListId)));

        } else if (type === 'links') {
            const alias = 'campaign_links_' + prefix;

            commonFieldsMapping[`${prefix}:count`] = {raw: 'COALESCE(`' + alias + '`.`count`, 0)'};
            commonFieldsMapping[`${prefix}:link`] = alias + '.link';
            commonFieldsMapping[`${prefix}:country`] = alias + '.country';
            commonFieldsMapping[`${prefix}:deviceType`] = alias + '.device_type';
            commonFieldsMapping[`${prefix}:ip`] = alias + '.ip';
            commonFieldsMapping[`${prefix}:created`] = alias + '.created';

            knexJoinFns.push((qry, cpgListId) => qry.leftJoin('campaign_links AS ' + alias, getConds(alias, cpgListId)));

        } else {
            throw new Error(`Unknown join type "${type}"`);
        }
    }


    const listsFields = {};
    const permittedListFields = new Set();
    let firstIteration = true;
    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const listFields = {};
        listsFields[cpgListId] = listFields;

        const flds = await fields.list(contextHelpers.getAdminContext(), cpgListId);

        const assignedFlds = new Set();

        for (const fld of flds) {
            /* Dropdown and checkbox groups have field.column == null
               For the time being, we don't group options and we don't expand enums. We just provide it as it is in the DB. */
            if (fld.column) {
                const fldKey = 'field:' + fld.key.toLowerCase();

                listFields[fldKey] = 'subscriptions.' + fld.column;

                if (firstIteration) {
                    permittedListFields.add(fldKey);
                }

                if (permittedListFields.has(fldKey)) {
                    assignedFlds.add(fldKey);
                }
            }
        }

        for (const fldKey in [...permittedListFields]) {
            if (!assignedFlds.has(fldKey)) {
                permittedListFields.delete(fldKey);
            }
        }

        firstIteration = false;
    }

    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;
        const listFields = listsFields[cpgListId];

        for (const fldKey in listFields) {
            if (!permittedListFields.has(fldKey)) {
                delete listFields[fldKey];
            }
        }
    }


    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const fieldsMapping = {
            ...commonFieldsMapping,
            ...listsFields[cpgListId],
            'list:id': {raw: knex.raw('?', [cpgListId])}
        };

        const getSelField = item => {
            const itemMapping = fieldsMapping[item];
            if (typeof itemMapping === 'string') {
                return itemMapping + ' AS ' + item;
            } else if (itemMapping.raw) {
                return knex.raw(fieldsMapping[item].raw + ' AS `' + item + '`');
            }
        };

        let selFields = [];
        for (let idx = 0; idx < select.length; idx++) {
            const item = select[idx];
            if (item in fieldsMapping) {
                selFields.push(getSelField(item));
            } else if (item === '*') {
                selFields = selFields.concat(Object.keys(fieldsMapping).map(entry => getSelField(entry)));
            } else {
                selFields.push(item);
            }
        }

        let query = knex(`subscription__${cpgListId} AS subscriptions`).select(selFields);

        for (const knexJoinFn of knexJoinFns) {
            query = knexJoinFn(query, cpgListId);
        }

        if (listQryFn) {
            query = listQryFn(
                query,
                colId => {
                    if (colId in fieldsMapping) {
                        return fieldsMapping[colId];
                    } else {
                        throw new Error(`Unknown column id ${colId}`);
                    }
                }
            );
        }

        subsQrys.push(query.toSQL().toNative());
    }

    if (subsQrys.length > 0) {
        let subsSql, subsBindings;

        const fieldsSet = new Set([...Object.keys(commonFieldsMapping), ...permittedListFields, 'list:id']);

        const applyUnionQryFn = (subsSql, subsBindings) => {
            if (unionQryFn) {
                return unionQryFn(
                    knex.from(function() {
                        return knex.raw('(' + subsSql + ')', subsBindings);
                    }),
                    colId => {
                        if (fieldsSet.has(colId)) {
                            return colId;
                        } else {
                            throw new Error(`Unknown column id ${colId}`);
                        }
                    }
                );
            } else {
                return knex.raw(subsSql, subsBindings);
            }
        };

        if (subsQrys.length === 1) {
            subsSql = subsQrys[0].sql;
            subsBindings = subsQrys[0].bindings;
        } else {
            subsSql = subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ');
            subsBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
        }

        if (asStream) {
            return applyUnionQryFn(subsSql, subsBindings).stream();

        } else {
            const res = await applyUnionQryFn(subsSql, subsBindings);
            if (res[0] && Array.isArray(res[0])) {
                return res[0]; // UNION ALL generates an array with result and schema
            } else {
                return res;
            }
        }

    } else {
        if (asStream) {
            const result = new Readable({
                objectMode: true,
            });
            result.push(null);
            return result;
            
        } else {
            return [];
        }
    }
}

async function _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, asStream) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), LinkId.OPEN)
            }),
            col
        ),
        asStream
    );
}

async function _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), LinkId.GENERAL_CLICK)
            }),
            col
        ),
        asStream
    );
}

async function _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), '>', LinkId.GENERAL_CLICK)
            }),
            col
        ),
        asStream
    );
}

async function getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn) {
    return await _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, false);
}

async function getCampaignStatisticsStream(campaign, select, joins, unionQryFn, listQryFn) {
    return await _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, true);
}

async function getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignOpenStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, true);
}

async function getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignClickStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn, true);
}

async function getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignLinkClickStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn, true);
}




module.exports.ReportState = ReportState;
module.exports.hash = hash;
module.exports.getByIdWithTemplate = getByIdWithTemplate;
module.exports.listDTAjax = listDTAjax;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.updateFields = updateFields;
module.exports.listByState = listByState;
module.exports.bulkChangeState = bulkChangeState;
module.exports.getCampaignCommonListFields = getCampaignCommonListFields;
module.exports.getCampaignStatistics = getCampaignStatistics;
module.exports.getCampaignStatisticsStream = getCampaignStatisticsStream;
module.exports.getCampaignOpenStatistics = getCampaignOpenStatistics;
module.exports.getCampaignClickStatistics = getCampaignClickStatistics;
module.exports.getCampaignLinkClickStatistics = getCampaignLinkClickStatistics;
module.exports.getCampaignOpenStatisticsStream = getCampaignOpenStatisticsStream;
module.exports.getCampaignClickStatisticsStream = getCampaignClickStatisticsStream;
module.exports.getCampaignLinkClickStatisticsStream = getCampaignLinkClickStatisticsStream;
