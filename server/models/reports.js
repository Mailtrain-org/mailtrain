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

//
// TODO Modifies
//
//const campaigns = require('./campaigns');
const {castToInteger} = require('../lib/helpers');

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

//
// Used in Get quick statistics for multiple campaings
// Source query comes from the endpoint 
// rest/campaigns-stats/:id used in Campaing details / stats
// 
async function rawGetByTx(tx, key, id) {
    const entity = await tx('campaigns').where('campaigns.' + key, id)//.andWhere('created', '>=', '2022-12-13T00:00:00Z')
        .leftJoin('campaign_lists', 'campaigns.id', 'campaign_lists.campaign')
        .groupBy('campaigns.id')
        .select([
            'campaigns.id', 'campaigns.cid', 'campaigns.name', 'campaigns.description', 'campaigns.channel', 'campaigns.namespace', 'campaigns.status', 'campaigns.type', 'campaigns.source',
            'campaigns.send_configuration', 'campaigns.from_name_override', 'campaigns.from_email_override', 'campaigns.reply_to_override', 'campaigns.subject',
            'campaigns.data', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled', 'campaigns.unsubscribe_url', 'campaigns.scheduled',
            'campaigns.delivered', 'campaigns.unsubscribed', 'campaigns.bounced', 'campaigns.complained', 'campaigns.blacklisted', 'campaigns.opened', 'campaigns.clicks', 'campaigns.created',
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', campaign_lists.list, campaign_lists.segment) ORDER BY campaign_lists.id SEPARATOR \';\') as lists`)
        ])
        .first();

    if (!entity) {
        return undefined;
        //throw new shares.throwPermissionDenied();
    }

    if (entity.lists) {
        entity.lists = entity.lists.split(';').map(x => {
            const entries = x.split(':');
            const list = Number.parseInt(entries[0]);
            const segment = entries[1] ? Number.parseInt(entries[1]) : null;
            return {list, segment};
        });
    } else {
        entity.lists = [];
    }

    entity.data = JSON.parse(entity.data);

    return entity;
}


//
// Get quick statistics for multiple campaings 
//
async function getMultiCampaignQuickStatistics(campaign) {
    let entities = [];
    for (const c of campaign) {
    let entity =  await knex.transaction(async tx => {
        return await rawGetByTx(tx, 'id', castToInteger(c.id));
    });
    
    if(!entity) {
        entity = {
            delivered:0,
            opened:0,
            clicks:0,
            unsubscribed:0,
            bounced:0,
            complained:0,
            name:c.name,
            id:c.id,
            subject:c.subject,
            send_configuration:c.send_configuration,
        }
    }
    entity.opened_percent = Math.round(entity.opened / entity.delivered * 100 * 100)/100;
    entity.clicks_percent =  Math.round(entity.clicks / entity.delivered * 100 * 100)/100;
    entity.unsubscribed_percent =  Math.round(entity.unsubscribed / entity.delivered * 100 * 100)/100;
    entity.bounced_percent =  Math.round(entity.bounced / entity.delivered * 100 * 100)/100;
    entity.complained_percent =  Math.round(entity.complained / entity.delivered * 100 * 100)/100;
    
    entities.push(entity);
    }
    return entities;
}

//
// Get data from the table campaign_messages
// Source query comes from the endpoint 
// rest/campaigns-stats/:id used in Campaing details / stats
// 
async function rawGetMessagesByTx(tx, key, id, startBeforeDays, endBeforeDays, debug) {

    var sd = new Date();
    var ed = new Date();   

    sd.setDate(sd.getDate() - startBeforeDays);
    ed.setDate(ed.getDate() - endBeforeDays);

    const entities = await tx('campaign_messages').where('campaign_messages.campaign', id).andWhere('campaign_messages.created', '>=', sd.toISOString()).andWhere('campaign_messages.created', '<=', ed.toISOString())
        .leftJoin('campaign_lists', 'campaign_messages.campaign', 'campaign_lists.campaign')
        .leftJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
        .leftJoin('campaign_links', 'campaign_messages.subscription', 'campaign_links.subscription')
        .leftJoin('links', 'campaign_links.link', 'links.id')
        .groupBy('campaign_messages.id')
        .select([
            'campaign_messages.id as messages_id', 'campaign_messages.campaign as messages_campaign',
            'campaign_links.subscription as campaign_links_subscription', 'campaign_links.campaign as campaign_links_campaign', 'campaign_links.count as campaign_links_count',
            'campaigns.id', 'campaigns.cid', 'campaigns.name', 'campaigns.description', 'campaigns.channel', 'campaigns.namespace', 'campaigns.status', 'campaigns.type', 'campaigns.source',
            'campaigns.send_configuration', 'campaigns.from_name_override', 'campaigns.from_email_override', 'campaigns.reply_to_override', 'campaigns.subject',
            'campaigns.data', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled', 'campaigns.unsubscribe_url', 'campaigns.scheduled',
            'campaigns.delivered', 'campaigns.unsubscribed', 'campaigns.bounced', 'campaigns.complained', 'campaigns.blacklisted', 'campaigns.opened', 'campaigns.clicks', 'campaigns.created',
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', campaign_lists.list, campaign_lists.segment) ORDER BY campaign_lists.id SEPARATOR \';\') as lists`),
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', campaign_links.subscription, campaign_links.link, links.visits, links.hits) ORDER BY campaign_links.created SEPARATOR \';\') as links`)

        ]);

    if (!entities) {
        return undefined;
    }

    for (const e of entities) {

    if (e.lists) {
        e.lists = e.lists.split(';').map(x => {
            const entries = x.split(':');
            const list = Number.parseInt(entries[0]);
            const segment = entries[1] ? Number.parseInt(entries[1]) : null;
            return {list, segment};
        });
    } else {
        e.lists = [];
    }

    if (e.links) {
        e.links_visits = 0;
        e.links_hits = 0;    
        e.links = e.links.split(';').map(x => {
            const entries = x.split(':');
            const subscription = Number.parseInt(entries[0]);
            const link = entries[1] ? Number.parseInt(entries[1]) : null;
            const visits = entries[2] ? Number.parseInt(entries[2]) : null;
            const hits = entries[3] ? Number.parseInt(entries[3]) : null;

            e.links_visits = visits > 0 ? e.links_visits + visits: e.links_visits;
            e.links_hits = hits > 0 ? e.links_hits + hits: e.links_hits;

            return {subscription, link, visits, hits};
        });
    } else {
        e.links = [];
    }

    e.data = JSON.parse(e.data);
    }

    return entities;
}

//
// Get quick statistics for multiple campaings 
//
async function getMultiCampaignMessagesStatistics(campaign, startBeforeDays, endBeforeDays, groupByCampaingIds = true, debug = false) {

    let entities = [];
    for (const c of campaign) {
    
    let entitiesMessages =  await knex.transaction(async tx => {
        return await rawGetMessagesByTx(tx, 'id', castToInteger(c.id),typeof startBeforeDays === 'number' ? startBeforeDays : 30, typeof endBeforeDays === 'number' ? endBeforeDays : 0, debug);
    });
    
    if(entitiesMessages)
        for(const e of entitiesMessages) {
            entities.push(e);
        }
    }
    if (groupByCampaingIds !== true)
        return entities;
    
    // Group by campaings
    let cEntities = [];
    for (const e of entities) {
        // Find the value of the first element/object in the array, otherwise undefined is returned.
        var result = cEntities.find(obj => {
            return obj.id === e.id;
          })
        var addElement = false;
          if (!result) {            
            result = {
                    delivered:0,
                    delivered_total_from_beginning: e.delivered,
                    opened: 0,
                    opened_percent: 0,
                    clicks:0,
                    clicks_percent:0,
                    opened_total_from_beginning: e.opened,
                    opened_total_from_beginning_percent: 0,
                    clicks_total_from_beginning: e.clicks,
                    clicks_total_from_beginning_percent:0,                    
                    unsubscribed_total_from_beginning: e.unsubscribed,
                    bounced_total_from_beginning: e.bounced,
                    complained_total_from_beginning: e.complained,
                    name:e.name,
                    id:e.id,
                    subject:e.subject,
                    send_configuration:e.send_configuration,
                    links_visits: 0,
                    links_hits: 0,
                }
                addElement = true;            
        } 

        result.delivered = result.delivered + 1;

        if(typeof e.campaign_links_count === 'number' && e.campaign_links_count > 0) {
            result.opened = result.opened + 1;
            
        }

        if (typeof e.links_visits === 'number' && e.links_visits > 0) {
            result.links_visits = result.links_visits + e.links_visits;
            result.clicks = result.clicks + 1;
        }
        if (typeof e.links_hits === 'number') {
            result.links_hits = result.links_hits + e.links_hits;
        }
        
        result.opened_percent = Math.round(result.opened / result.delivered * 100 * 100)/100;
        result.clicks_percent = Math.round(result.clicks / result.delivered * 100 * 100)/100;
        result.opened_total_from_beginning_percent = Math.round(result.opened_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;
        result.clicks_total_from_beginning_percent = Math.round(result.clicks_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;        
        result.unsubscribed_total_from_beginning_percent =  Math.round(result.unsubscribed_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;
        result.unsubscribed_total_from_beginning_percent =  Math.round(result.unsubscribed_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;
        result.bounced_total_from_beginning_percent =  Math.round(result.bounced_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;
        result.complained_total_from_beginning_percent =  Math.round(result.complained_total_from_beginning / result.delivered_total_from_beginning * 100 * 100)/100;
        
       if (addElement) cEntities.push(result);
    }
    return cEntities;
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
// Get quick statistics for multiple campaings 
module.exports.getMultiCampaignQuickStatistics = getMultiCampaignQuickStatistics;
// Get detailed statistics based on delivered campaigns messages 
module.exports.getMultiCampaignMessagesStatistics = getMultiCampaignMessagesStatistics;
