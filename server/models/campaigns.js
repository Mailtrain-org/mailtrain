'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shortid = require('../lib/shortid');
const { enforce, filterObject } = require('../lib/helpers');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const files = require('./files');
const templates = require('./templates');
const { allTagLanguages } = require('../../shared/templates');
const { CampaignMessageStatus, CampaignStatus, CampaignSource, CampaignType, getSendConfigurationPermissionRequiredForSend } = require('../../shared/campaigns');
const sendConfigurations = require('./send-configurations');
const triggers = require('./triggers');
const {SubscriptionStatus} = require('../../shared/lists');
const subscriptions = require('./subscriptions');
const segments = require('./segments');
const senders = require('../lib/senders');
const links = require('./links');
const feedcheck = require('../lib/feedcheck');
const contextHelpers = require('../lib/context-helpers');
const {convertFileURLs} = require('../lib/campaign-content');
const messageSender = require('../lib/message-sender');
const lists = require('./lists');

const {EntityActivityType, CampaignActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');

const allowedKeysCommon = ['name', 'description', 'namespace', 'channel',
    'send_configuration', 'from_name_override', 'from_email_override', 'reply_to_override', 'subject', 'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url'];

const allowedKeysCreate = new Set(['type', 'source', ...allowedKeysCommon]);
const allowedKeysCreateRssEntry = new Set(['type', 'source', 'parent', ...allowedKeysCommon]);
const allowedKeysUpdate = new Set([...allowedKeysCommon]);

const Content = {
    ALL: 0,
    WITHOUT_SOURCE_CUSTOM: 1,
    ONLY_SOURCE_CUSTOM: 2,
    RSS_ENTRY: 3,
    SETTINGS_WITH_STATS: 4
};

function hash(entity, content) {
    let filteredEntity;

    if (content === Content.ALL) {
        filteredEntity = filterObject(entity, allowedKeysUpdate);
        filteredEntity.lists = entity.lists;

    } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
        filteredEntity = filterObject(entity, allowedKeysUpdate);
        filteredEntity.lists = entity.lists;
        filteredEntity.data = {...filteredEntity.data};
        delete filteredEntity.data.sourceCustom;

    } else if (content === Content.ONLY_SOURCE_CUSTOM) {
        filteredEntity = {
            data: {
                sourceCustom: entity.data.sourceCustom
            }
        };
    }

    return hasher.hash(filteredEntity);
}

async function _listDTAjax(context, namespaceId, channelId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => {
            builder = builder.from('campaigns')
                .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace')
                .leftJoin('channels', 'channels.id', 'campaigns.channel')
                .whereNull('campaigns.parent');
            if (namespaceId) {
                builder = builder.where('namespaces.id', namespaceId);
            }
            if (channelId) {
                builder = builder.where('channels.id', channelId);
            }
            return builder;
        },
        ['campaigns.id', 'campaigns.name', 'campaigns.cid', 'campaigns.description', 'campaigns.type', 'channels.name', 'campaigns.status', 'campaigns.scheduled', 'campaigns.source', 'campaigns.created', 'namespaces.name']
    );
}

async function listDTAjax(context, params) {
    return await _listDTAjax(context, undefined, undefined, params);
}

async function listByNamespaceDTAjax(context, namespaceId, params) {
    return await _listDTAjax(context, namespaceId, undefined, params);
}

async function listByChannelDTAjax(context, channelId, params) {
    return await _listDTAjax(context, undefined, channelId, params);
}

async function listChildrenDTAjax(context, campaignId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace')
            .where('campaigns.parent', campaignId),
        ['campaigns.id', 'campaigns.name', 'campaigns.cid', 'campaigns.description', 'campaigns.type', 'campaigns.status', 'campaigns.scheduled', 'campaigns.source', 'campaigns.created', 'namespaces.name']
    );
}


async function listWithContentDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace')
            .whereIn('campaigns.source', [CampaignSource.CUSTOM, CampaignSource.CUSTOM_FROM_TEMPLATE, CampaignSource.CUSTOM_FROM_CAMPAIGN]),
        ['campaigns.id', 'campaigns.name', 'campaigns.cid', 'campaigns.description', 'campaigns.type', 'campaigns.created', 'namespaces.name']
    );
}

async function listOthersWhoseListsAreIncludedDTAjax(context, campaignId, listIds, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace')
            .whereNot('campaigns.id', campaignId)
            .whereNotExists(qry => qry.from('campaign_lists').whereRaw('campaign_lists.campaign = campaigns.id').whereNotIn('campaign_lists.list', listIds)),
        ['campaigns.id', 'campaigns.name', 'campaigns.cid', 'campaigns.description', 'campaigns.type', 'campaigns.created', 'namespaces.name']
    );
}

async function listTestUsersDTAjax(context, campaignId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'view');

        /*
        This is supposed to produce queries like this:

        select * from (
          (select `subscription__1`.`email`, `subscription__1`.`cid`, 1 AS list, NULL AS segment from `subscription__1` where `subscription__1`.`status` = 1 and `subscription__1`.`is_test` = true)
        UNION ALL
          (select `subscription__2`.`email`, `subscription__2`.`cid`, 2 AS list, NULL AS segment from `subscription__2` where `subscription__2`.`status` = 1 and `subscription__2`.`is_test` = true)
        ) as `test_subscriptions` inner join `lists` on `test_subscriptions`.`list` = `lists`.`id` inner join `segments` on `test_subscriptions`.`segment` = `segments`.`id`
          inner join `namespaces` on `lists`.`namespace` = `namespaces`.`id`

        This was too much for Knex, so we partially construct these queries directly as strings;
        */

        const subsQrys = [];
        const cpgLists = await tx('campaign_lists').where('campaign', campaignId);

        for (const cpgList of cpgLists) {
            const addSegmentQuery = cpgList.segment ? await segments.getQueryGeneratorTx(tx, cpgList.list, cpgList.segment) : () => {};
            const subsTable = subscriptions.getSubscriptionTableName(cpgList.list);

            const sqlQry = knex.from(subsTable)
                .where(subsTable + '.status', SubscriptionStatus.SUBSCRIBED)
                .where(subsTable + '.is_test', true)
                .where(function() {
                    addSegmentQuery(this);
                })
                .select([subsTable + '.email', subsTable + '.cid', knex.raw('? AS list', [cpgList.list]), knex.raw('? AS segment', [cpgList.segment])])
                .toSQL().toNative();

            subsQrys.push(sqlQry);
        }

        if (subsQrys.length > 0) {
            let subsQry;

            if (subsQrys.length === 1) {
                const subsUnionSql = '(' + subsQrys[0].sql + ') as `test_subscriptions`';
                subsQry = knex.raw(subsUnionSql, subsQrys[0].bindings);

            } else {
                const subsUnionSql = '(' +
                    subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ') +
                    ') as `test_subscriptions`';
                const subsUnionBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
                subsQry = knex.raw(subsUnionSql, subsUnionBindings);
            }

            return await dtHelpers.ajaxListWithPermissionsTx(
                tx,
                context,
                [{ entityTypeId: 'list', requiredOperations: ['viewTestSubscriptions'], column: 'subs.list_id' }],
                params,
                builder => {
                    return builder.from(function () {
                        return this.from(subsQry)
                            .innerJoin('lists', 'test_subscriptions.list', 'lists.id')
                            .innerJoin('namespaces', 'lists.namespace', 'namespaces.id')
                            .select([
                                knex.raw('CONCAT_WS(":", lists.cid, test_subscriptions.cid) AS cid'),
                                'test_subscriptions.email', 'test_subscriptions.cid AS subscription_cid', 'lists.cid AS list_cid',
                                'lists.name as list_name', 'namespaces.name AS namespace_name', 'lists.id AS list_id'
                            ])
                            .as('subs');
                    });
                },
                [ 'subs.cid', 'subs.email', 'subs.subscription_cid', 'subs.list_cid', 'subs.list_name', 'subs.namespace_name' ]
            );

        } else {
            const result = {
                draw: params.draw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
            };

            return result;
        }
    });
}

async function _listSubscriberResultsDTAjax(context, campaignId, getSubsQrys, columns, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'view');

        const subsQrys = [];
        const cpgLists = await tx('campaign_lists').where('campaign', campaignId);

        for (const cpgList of cpgLists) {
            const subsTable = subscriptions.getSubscriptionTableName(cpgList.list);
            subsQrys.push(getSubsQrys(subsTable, cpgList));
        }

        if (subsQrys.length > 0) {
            let subsSql, subsBindings;

            if (subsQrys.length === 1) {
                subsSql = '(' + subsQrys[0].sql + ') as `subs`'
                subsBindings = subsQrys[0].bindings;

            } else {
                subsSql = '(' +
                    subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ') +
                    ') as `subs`';
                subsBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
            }

            return await dtHelpers.ajaxListWithPermissionsTx(
                tx,
                context,
                [{ entityTypeId: 'list', requiredOperations: ['viewSubscriptions'], column: 'lists.id' }],
                params,
                (builder, tx) => builder.from(knex.raw(subsSql, subsBindings))
                    .innerJoin('lists', 'subs.list', 'lists.id')
                    .innerJoin('namespaces', 'lists.namespace', 'namespaces.id')
                ,
                columns
            );

        } else {
            const result = {
                draw: params.draw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
            };

            return result;
        }
    });
}


async function listSentByStatusDTAjax(context, campaignId, status, params) {
    return await _listSubscriberResultsDTAjax(
        context,
        campaignId,
        (subsTable, cpgList) => knex.from(subsTable)
            .innerJoin(
                function () {
                    return this.from('campaign_messages')
                        .where('campaign_messages.campaign', campaignId)
                        .where('campaign_messages.list', cpgList.list)
                        .where('campaign_messages.status', status)
                        .as('related_campaign_messages');
                },
                'related_campaign_messages.subscription', subsTable + '.id')
            .select([subsTable + '.email', subsTable + '.cid', knex.raw('? AS list', [cpgList.list])])
            .toSQL().toNative(),
        [ 'subs.email', 'subs.cid', 'lists.cid', 'lists.name', 'namespaces.name' ],
        params
    );
}

async function listOpensDTAjax(context, campaignId, params) {
    return await _listSubscriberResultsDTAjax(
        context,
        campaignId,
        (subsTable, cpgList) => knex.from(subsTable)
            .innerJoin(
                function () {
                    return this.from('campaign_links')
                        .where('campaign_links.campaign', campaignId)
                        .where('campaign_links.list', cpgList.list)
                        .where('campaign_links.link', links.LinkId.OPEN)
                        .as('related_campaign_links');
                },
                'related_campaign_links.subscription', subsTable + '.id')
            .select([subsTable + '.email', subsTable + '.cid', knex.raw('? AS list', [cpgList.list]), 'related_campaign_links.count'])
            .toSQL().toNative(),
        [ 'subs.email', 'subs.cid', 'lists.cid', 'lists.name', 'namespaces.name', 'subs.count' ],
        params
    );
}

async function listLinkClicksDTAjax(context, campaignId, params) {
    return await knex.transaction(async (tx) => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'viewStats');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder.from('links')
                .where('links.campaign', campaignId),
            [ 'links.url', 'links.visits', 'links.hits' ]
        );
    });
}


async function getTrackingSettingsByCidTx(tx, cid) {
    const entity = await tx('campaigns').where('campaigns.cid', cid)
        .select([
            'campaigns.id', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled'
        ])
        .first();

    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

async function lockByIdTx(tx, id) {
    // This locks the entry for update
    await tx('campaigns').where('id', id).forUpdate();
}

async function rawGetByTx(tx, key, id) {
    const entity = await tx('campaigns').where('campaigns.' + key, id)
        .leftJoin('campaign_lists', 'campaigns.id', 'campaign_lists.campaign')
        .groupBy('campaigns.id')
        .select([
            'campaigns.id', 'campaigns.cid', 'campaigns.name', 'campaigns.description', 'campaigns.channel', 'campaigns.namespace', 'campaigns.status', 'campaigns.type', 'campaigns.source',
            'campaigns.send_configuration', 'campaigns.from_name_override', 'campaigns.from_email_override', 'campaigns.reply_to_override', 'campaigns.subject',
            'campaigns.data', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled', 'campaigns.unsubscribe_url', 'campaigns.scheduled',
            'campaigns.delivered', 'campaigns.unsubscribed', 'campaigns.bounced', 'campaigns.complained', 'campaigns.blacklisted', 'campaigns.opened', 'campaigns.clicks',
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', campaign_lists.list, campaign_lists.segment) ORDER BY campaign_lists.id SEPARATOR \';\') as lists`)
        ])
        .first();

    if (!entity) {
        throw new shares.throwPermissionDenied();
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

async function getByIdTx(tx, context, id, withPermissions = true, content = Content.ALL) {
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'view');

    let entity = await rawGetByTx(tx, 'id', id);

    if (content === Content.ALL || content === Content.RSS_ENTRY) {
        // Return everything

    } else if (content === Content.SETTINGS_WITH_STATS) {
        delete entity.data.sourceCustom;

        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'viewStats');

        const totalRes = await tx('campaign_messages')
            .where({campaign: id})
            .whereIn('status', [CampaignMessageStatus.SCHEDULED, CampaignMessageStatus.SENT,
                CampaignMessageStatus.COMPLAINED, CampaignMessageStatus.UNSUBSCRIBED, CampaignMessageStatus.BOUNCED])
            .count('* as count').first();

        entity.total = totalRes.count;

    } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
        delete entity.data.sourceCustom;

    } else if (content === Content.ONLY_SOURCE_CUSTOM) {
        entity = {
            id: entity.id,
            channel: entity.channel,
            send_configuration: entity.send_configuration,

            data: {
                sourceCustom: entity.data.sourceCustom
            }
        };
    }

    if (withPermissions) {
        entity.permissions = await shares.getPermissionsTx(tx, context, 'campaign', id);
    }

    return entity;
}

async function getById(context, id, withPermissions = true, content = Content.ALL) {
    return await knex.transaction(async tx => {
        return await getByIdTx(tx, context, id, withPermissions, content);
    });
}

async function getByCid(context, cid) {
    return await knex.transaction(async tx => {
        const entity = await rawGetByTx(tx,'cid', cid);

        await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.id, 'view');

        return entity;
    });
}

async function _validateAndPreprocess(tx, context, entity, isCreate, content) {
    if (content === Content.ALL || content === Content.WITHOUT_SOURCE_CUSTOM || content === Content.RSS_ENTRY) {
        await namespaceHelpers.validateEntity(tx, entity);

        if (isCreate) {
            enforce(entity.type === CampaignType.REGULAR || entity.type === CampaignType.RSS || entity.type === CampaignType.TRIGGERED ||
                    (content === Content.RSS_ENTRY && entity.type === CampaignType.RSS_ENTRY),
                'Unknown campaign type');

            if (entity.source === CampaignSource.TEMPLATE || entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                await shares.enforceEntityPermissionTx(tx, context, 'template', entity.data.sourceTemplate, 'view');
            } else if (entity.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
                await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.data.sourceCampaign, 'view');
            }

            enforce(Number.isInteger(entity.source));
            enforce(entity.source >= CampaignSource.MIN && entity.source <= CampaignSource.MAX, 'Unknown campaign source');
        }

        for (const lstSeg of entity.lists) {
            await shares.enforceEntityPermissionTx(tx, context, 'list', lstSeg.list, 'view');

            if (lstSeg.segment) {
                // Check that the segment under the list exists
                await segments.getByIdTx(tx, context, lstSeg.list, lstSeg.segment);
            }
        }

        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', entity.send_configuration, 'viewPublic');
    }

    if ((isCreate && entity.source === CampaignSource.CUSTOM) || (content === Content.ONLY_SOURCE_CUSTOM)) {
        enforce(allTagLanguages.includes(entity.data.sourceCustom.tag_language), `Invalid tag language '${entity.data.sourceCustom.tag_language}'`);
    }
}

async function _createTx(tx, context, entity, content) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createCampaign');

        if (entity.channel) {
            await shares.enforceEntityPermissionTx(tx, context, 'channel', entity.channel, 'createCampaign');
        }

        let copyFilesFrom = null;
        if (entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            copyFilesFrom = {
                entityType: 'template',
                entityId: entity.data.sourceTemplate
            };

            const template = await templates.getByIdTx(tx, context, entity.data.sourceTemplate, false);

            entity.data.sourceCustom = {
                type: template.type,
                tag_language: template.tag_language,
                data: template.data,
                html: template.html,
                text: template.text
            };

        } else if (entity.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            copyFilesFrom = {
                entityType: 'campaign',
                entityId: entity.data.sourceCampaign
            };

            const sourceCampaign = await getByIdTx(tx, context, entity.data.sourceCampaign, false);
            enforce(sourceCampaign.source === CampaignSource.CUSTOM || sourceCampaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceCampaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN, 'Incorrect source type of the source campaign.');

            entity.data.sourceCustom = sourceCampaign.data.sourceCustom;
        }

        await _validateAndPreprocess(tx, context, entity, true, content);

        const filteredEntity = filterObject(entity, entity.type === CampaignType.RSS_ENTRY ? allowedKeysCreateRssEntry : allowedKeysCreate);
        filteredEntity.cid = shortid.generate();

        const data = filteredEntity.data;

        filteredEntity.data = JSON.stringify(filteredEntity.data);

        if (filteredEntity.type === CampaignType.RSS || filteredEntity.type === CampaignType.TRIGGERED) {
            filteredEntity.status = CampaignStatus.ACTIVE;
        } else if (filteredEntity.type === CampaignType.RSS_ENTRY) {
            filteredEntity.status = CampaignStatus.SCHEDULED;
            filteredEntity.start_at = new Date();
        } else {
            filteredEntity.status = CampaignStatus.IDLE;
        }

        const ids = await tx('campaigns').insert(filteredEntity);
        const id = ids[0];

        await tx('campaign_lists').insert(entity.lists.map(x => ({campaign: id, ...x})));

        if (entity.source === CampaignSource.TEMPLATE) {
            await tx('template_dep_campaigns').insert({
               campaign: id,
               template: entity.data.sourceTemplate
            });
        }

        if (filteredEntity.parent) {
            await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: id, parentId: filteredEntity.parent });
        } else {
            await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: id });
        }

        if (copyFilesFrom) {
            await files.copyAllTx(tx, context, copyFilesFrom.entityType, 'file', copyFilesFrom.entityId, 'campaign', 'file', id);
            convertFileURLs(data.sourceCustom, copyFilesFrom.entityType, copyFilesFrom.entityId, 'campaign', id);
            await tx('campaigns')
                .update({
                    data: JSON.stringify(data)
                }).where('id', id);
        }

        await activityLog.logEntityActivity('campaign', EntityActivityType.CREATE, id, {status: filteredEntity.status});

        return id;
    });
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        return await _createTx(tx, context, entity, Content.ALL);
    });
}

async function createRssTx(tx, context, entity) {
    return await _createTx(tx, context, entity, Content.RSS_ENTRY);
}

async function _validateChannelMoveTx(tx, context, entity, existing) {
    if (existing.channel !== entity.channel) {
        await shares.enforceEntityPermission(context, 'channel', entity.channel, 'createCampaign');
        await shares.enforceEntityPermission(context, 'campaign', entity.id, 'delete');
    }
}

async function updateWithConsistencyCheck(context, entity, content) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.id, 'edit');

        const existing = await rawGetByTx(tx, 'id', entity.id);

        const existingHash = hash(existing, content);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, context, entity, false, content);

        let filteredEntity = filterObject(entity, allowedKeysUpdate);
        if (content === Content.ALL) {
            await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'campaign', 'createCampaign', 'delete');
            await _validateChannelMoveTx(tx, context, entity, existing);

        } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
            filteredEntity.data.sourceCustom = existing.data.sourceCustom;
            await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'campaign', 'createCampaign', 'delete');
            await _validateChannelMoveTx(tx, context, entity, existing);

        } else if (content === Content.ONLY_SOURCE_CUSTOM) {
            const data = existing.data;
            data.sourceCustom = filteredEntity.data.sourceCustom;
            filteredEntity = {
                data
            };
        }

        if (content === Content.ALL || content === Content.WITHOUT_SOURCE_CUSTOM) {
            await tx('campaign_lists').where('campaign', entity.id).del();
            await tx('campaign_lists').insert(entity.lists.map(x => ({campaign: entity.id, ...x})));

            if (existing.source === CampaignSource.TEMPLATE) {
                await tx('template_dep_campaigns')
                    .where('campaign', entity.id)
                    .update('template', entity.data.sourceTemplate);
            }
        }

        filteredEntity.data = JSON.stringify(filteredEntity.data);
        await tx('campaigns').where('id', entity.id).update(filteredEntity);

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: entity.id });

        await activityLog.logEntityActivity('campaign', EntityActivityType.UPDATE, entity.id, {status: filteredEntity.status});
    });
}

async function _removeTx(tx, context, id, existing = null, overrideTypeCheck = false) {
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'delete');

    if (!existing) {
        existing = await tx('campaigns').where('id', id).select(['id', 'status', 'type']).first();
    }

    if (existing.status === CampaignStatus.SENDING) {
        return new interoperableErrors.InvalidStateError;
    }

    if (!overrideTypeCheck) {
        enforce(existing.type === CampaignType.REGULAR || existing.type === CampaignType.RSS || existing.type === CampaignType.TRIGGERED, 'This campaign cannot be removed by user.');
    }

    const childCampaigns = await tx('campaigns').where('parent', id).select(['id', 'status', 'type']);
    for (const childCampaign of childCampaigns) {
        await _removeTx(tx, context, childCampaign.id, childCampaign, true);
    }

    await files.removeAllTx(tx, context, 'campaign', 'file', id);
    await files.removeAllTx(tx, context, 'campaign', 'attachment', id);

    await tx('campaign_lists').where('campaign', id).del();
    await tx('campaign_messages').where('campaign', id).del();
    await tx('campaign_links').where('campaign', id).del();

    await tx('links').where('campaign', id).del();

    await triggers.removeAllByCampaignIdTx(tx, context, id);

    await tx('template_dep_campaigns')
        .where('campaign', id)
        .del();

    await tx('campaigns').where('id', id).del();

    await activityLog.logEntityActivity('campaign', EntityActivityType.REMOVE, id);
}


async function remove(context, id) {
    await knex.transaction(async tx => {
        await _removeTx(tx, context, id);
    });
}

async function enforceSendPermissionTx(tx, context, campaignOrCampaignId, isToTestUsers, listId) {
    let campaign;

    if (typeof campaignOrCampaignId === 'object') {
        campaign = campaignOrCampaignId;
    } else {
        campaign = await getByIdTx(tx, context, campaignOrCampaignId, false);
    }

    const sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), campaign.send_configuration, false, false);

    const requiredSendConfigurationPermission = getSendConfigurationPermissionRequiredForSend(campaign, sendConfiguration);
    await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', campaign.send_configuration, requiredSendConfigurationPermission);

    const requiredListAndCampaignPermission = isToTestUsers ? 'sendToTestUsers' : 'send';

    await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaign.id, requiredListAndCampaignPermission);

    if (listId) {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, requiredListAndCampaignPermission);

    } else {
        for (const listIds of campaign.lists) {
            await shares.enforceEntityPermissionTx(tx, context, 'list', listIds.list, requiredListAndCampaignPermission);
        }
    }
}


// Message API

function getMessageCid(campaignCid, listCid, subscriptionCid) {
    return [campaignCid, listCid, subscriptionCid].join('.')
}

async function getMessageByCid(messageCid, withVerpHostname = false) { // withVerpHostname is used by verp-server.js
    const messageCidElems = messageCid.split('.');

    if (messageCidElems.length !== 3) {
        return null;
    }

    const [campaignCid, listCid, subscriptionCid] = messageCidElems;

    return await knex.transaction(async tx => {
        const list = await tx('lists').where('cid', listCid).select('id').first();
        const subscrTblName = subscriptions.getSubscriptionTableName(list.id);

        const baseQuery = tx('campaign_messages')
            .innerJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
            .innerJoin(subscrTblName, subscrTblName + '.id', 'campaign_messages.subscription')
            .where(subscrTblName + '.cid', subscriptionCid)
            .where('campaigns.cid', campaignCid)
            .select([
                'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'campaign_messages.subscription', 'campaign_messages.hash_email', 'campaign_messages.status'
            ])
            .first();

        if (withVerpHostname) {
            return await baseQuery
                .innerJoin('send_configurations', 'send_configurations.id', 'campaigns.send_configuration')
                .select('send_configurations.verp_hostname');
        } else {
            return await baseQuery;
        }

        return message;
    });
}

async function getMessageByResponseId(responseId) {
    return await knex('campaign_messages')
        .where('campaign_messages.response_id', responseId)
        .select([
            'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'campaign_messages.subscription', 'campaign_messages.hash_email', 'campaign_messages.status'
        ])
        .first();
}

const statusFieldMapping = new Map();
statusFieldMapping.set(CampaignMessageStatus.UNSUBSCRIBED, 'unsubscribed');
statusFieldMapping.set(CampaignMessageStatus.BOUNCED, 'bounced');
statusFieldMapping.set(CampaignMessageStatus.COMPLAINED, 'complained');

async function _changeStatusByMessageTx(tx, context, message, campaignMessageStatus) {
    enforce(statusFieldMapping.has(campaignMessageStatus));

    if (message.status === CampaignMessageStatus.SENT) {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');

        const statusField = statusFieldMapping.get(campaignMessageStatus);

        await tx('campaigns').increment(statusField, 1).where('id', message.campaign);

        await tx('campaign_messages')
            .where('id', message.id)
            .update({
                status: campaignMessageStatus,
                updated: knex.fn.now()
            });
    }
}

async function changeStatusByCampaignCidAndSubscriptionIdTx(tx, context, campaignCid, listId, subscriptionId, campaignMessageStatus) {
    const message = await tx('campaign_messages')
        .innerJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
        .where('campaigns.cid', campaignCid)
        .where({subscription: subscriptionId, list: listId})
        .select([
            'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'campaign_messages.subscription', 'campaign_messages.hash_email', 'campaign_messages.status'
        ])
        .first();

    if (message) { // If a test is send before the campaign is sent, the corresponding entry does not exists in campaign_messages. We ignore such situations as the subscriber gets unsubscribed anyway. We just don't account it to the campaign.
        await _changeStatusByMessageTx(tx, context, message, campaignMessageStatus);
    }
}


const campaignMessageStatusToSubscriptionStatusMapping = new Map();
campaignMessageStatusToSubscriptionStatusMapping.set(CampaignMessageStatus.BOUNCED, SubscriptionStatus.BOUNCED);
campaignMessageStatusToSubscriptionStatusMapping.set(CampaignMessageStatus.UNSUBSCRIBED, SubscriptionStatus.UNSUBSCRIBED);
campaignMessageStatusToSubscriptionStatusMapping.set(CampaignMessageStatus.COMPLAINED, SubscriptionStatus.COMPLAINED);

async function changeStatusByMessage(context, message, campaignMessageStatus, updateSubscription) {
    await knex.transaction(async tx => {
        if (updateSubscription) {
            enforce(campaignMessageStatusToSubscriptionStatusMapping.has(campaignMessageStatus));
            await subscriptions.changeStatusTx(tx, context, message.list, message.subscription, campaignMessageStatusToSubscriptionStatusMapping.get(campaignMessageStatus));
        }

        await _changeStatusByMessageTx(tx, context, message, campaignMessageStatus);
    });
}

async function updateMessageResponse(context, message, response, responseId) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');

        await tx('campaign_messages').where('id', message.id).update({
            response,
            response_id: responseId
        });
    });
}

async function prepareCampaignMessages(campaignId) {
    const campaign = await getById(contextHelpers.getAdminContext(), campaignId, false);

    await knex('campaign_messages').where({campaign: campaignId, status: CampaignMessageStatus.SCHEDULED}).del();

    for (const cpgList of campaign.lists) {
        let addSegmentQuery;
        await knex.transaction(async tx => {
            addSegmentQuery = cpgList.segment ? await segments.getQueryGeneratorTx(tx, cpgList.list, cpgList.segment) : () => {};
        });
        const subsTable = subscriptions.getSubscriptionTableName(cpgList.list);

        const subsQry = knex.from(subsTable)
            .where(subsTable + '.status', SubscriptionStatus.SUBSCRIBED)
            .where(function() {
                addSegmentQuery(this);
            })
            .select([
                'hash_email',
                'id',
                knex.raw('? AS campaign', [campaign.id]),
                knex.raw('? AS list', [cpgList.list]),
                knex.raw('? AS send_configuration', [campaign.send_configuration]),
                knex.raw('? AS status', [CampaignMessageStatus.SCHEDULED])
            ])
            .toSQL().toNative();

        await knex.raw('INSERT IGNORE INTO `campaign_messages` (`hash_email`, `subscription`, `campaign`, `list`, `send_configuration`, `status`) ' + subsQry.sql, subsQry.bindings);
    }
}

async function _changeStatus(context, campaignId, permittedCurrentStates, newState, invalidStateMessage, extraData) {
    await knex.transaction(async tx => {
        // This is quite inefficient because it selects the same row 3 times. However as status is changed
        // rather infrequently, we keep it this way for simplicity
        await lockByIdTx(tx, campaignId);

        const entity = await getByIdTx(tx, context, campaignId, false);

        await enforceSendPermissionTx(tx, context, entity, false);

        if (!permittedCurrentStates.includes(entity.status)) {
            throw new interoperableErrors.InvalidStateError(invalidStateMessage);
        }

        if (Array.isArray(newState)) {
            const newStateIdx = permittedCurrentStates.indexOf(entity.status);
            enforce(newStateIdx != -1);
            newState = newState[newStateIdx];
        }

        const updateData = {
            status: newState
        };

        if (!extraData) {
            updateData.scheduled = null;
            updateData.start_at = null;
        } else {
            const startAt = extraData.startAt;

            // If campaign is started without "scheduled" specified, startAt === null
            updateData.scheduled = startAt;
            if (!startAt || startAt.valueOf() < Date.now()) {
                updateData.start_at = new Date();
            } else {
                updateData.start_at = startAt;
            }

            const timezone = extraData.timezone;
            if (timezone) {
                updateData.data = JSON.stringify({
                    ...entity.data,
                    timezone
                });
            }
        }

        await tx('campaigns').where('id', campaignId).update(updateData);

        await activityLog.logEntityActivity('campaign', CampaignActivityType.STATUS_CHANGE, campaignId, {status: newState});
    });

    senders.scheduleCheck();
}


async function start(context, campaignId, extraData) {
    await _changeStatus(context, campaignId, [CampaignStatus.IDLE, CampaignStatus.SCHEDULED, CampaignStatus.PAUSED, CampaignStatus.FINISHED], CampaignStatus.SCHEDULED, 'Cannot start campaign until it is in IDLE, PAUSED, or FINISHED state', extraData);
}

async function stop(context, campaignId) {
    await _changeStatus(context, campaignId, [CampaignStatus.SCHEDULED, CampaignStatus.SENDING], [CampaignStatus.IDLE, CampaignStatus.PAUSING], 'Cannot stop campaign until it is in SCHEDULED or SENDING state');
}

async function reset(context, campaignId) {
    await knex.transaction(async tx => {
        // This is quite inefficient because it selects the same row 3 times. However as RESET is
        // going to be called rather infrequently, we keep it this way for simplicity
        await lockByIdTx(tx, campaignId);

        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'send');

        const entity = await tx('campaigns').where('id', campaignId).first();

        if (entity.status !== CampaignStatus.FINISHED && entity.status !== CampaignStatus.PAUSED) {
            throw new interoperableErrors.InvalidStateError('Cannot reset campaign until it is FINISHED or PAUSED state');
        }

        await tx('campaigns').where('id', campaignId).update({
            status: CampaignStatus.IDLE,
            delivered: 0,
            unsubscribed: 0,
            bounced: 0,
            complained: 0,
            blacklisted: 0,
            opened: 0,
            clicks: 0
        });

        await tx('campaign_messages').where('campaign', campaignId).del();
        await tx('campaign_links').where('campaign', campaignId).del();
        await tx('links').where('campaign', campaignId).del();
    });
}

async function enable(context, campaignId) {
    await _changeStatus(context, campaignId, [CampaignStatus.INACTIVE], CampaignStatus.ACTIVE, 'Cannot enable campaign unless it is in INACTIVE state');
}

async function disable(context, campaignId) {
    await _changeStatus(context, campaignId, [CampaignStatus.ACTIVE], CampaignStatus.INACTIVE, 'Cannot disable campaign unless it is in ACTIVE state');
}


async function getStatisticsOpened(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'viewStats');

        const devices = await tx('campaign_links').where('campaign', id).where('link', links.LinkId.OPEN).groupBy('device_type').select('device_type AS key').count('* as count');
        const countries = await tx('campaign_links').where('campaign', id).where('link', links.LinkId.OPEN).groupBy('country').select('country AS key').count('* as count');

        return {
            devices,
            countries
        };
    });
}

async function fetchRssCampaign(context, cid) {
    return await knex.transaction(async tx => {

        const campaign = await tx('campaigns').where('cid', cid).select(['id', 'type']).first();

        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaign.id, 'fetchRss');

        enforce(campaign.type === CampaignType.RSS, 'Invalid campaign type');

        await tx('campaigns').where('id', campaign.id).update('last_check', null);

        feedcheck.scheduleCheck();
    });
}

async function testSend(context, data) {
    // Though it's a bit counter-intuitive, this handles also test sends of a template (i.e. without any campaign id)

    await knex.transaction(async tx => {
        const processSubscriber = async (sendConfigurationId, listId, subscriptionId, messageData) => {
            await messageSender.queueCampaignMessageTx(tx, sendConfigurationId, listId, subscriptionId, messageSender.MessageType.TEST, messageData);

            await activityLog.logEntityActivity('campaign', CampaignActivityType.TEST_SEND, campaignId, {list: listId, subscription: subscriptionId});
        };

        const campaignId = data.campaignId;

        if (campaignId) { // This means we are sending a campaign
            /*
                Data coming from the client:
                - html, text
                - subjectPrepend, subjectAppend
                - listCid, subscriptionCid
                - listId, segmentId
             */

            const campaign = await getByIdTx(tx, context, campaignId, false);
            const sendConfigurationId = campaign.send_configuration;

            const messageData = {
                campaignId: campaignId,
                subject: data.subjectPrepend + campaign.subject + data.subjectAppend,
                html: data.html, // The html, text and tagLanguage may be undefined
                text: data.text,
                tagLanguage: data.tagLanguage,
                attachments: []
            };

            if (campaign.type === CampaignType.RSS) {
                messageData.rssEntry = await feedcheck.getEntryForPreview(campaign.data.feedUrl);
            }

            const attachments = await files.listTx(tx, contextHelpers.getAdminContext(), 'campaign', 'attachment', campaignId);
            for (const attachment of attachments) {
                messageData.attachments.push({
                    filename: attachment.originalname,
                    path: files.getFilePath('campaign', 'attachment', campaign.id, attachment.filename),
                    id: attachment.id
                });
            }


            let listId = data.listId;
            if (!listId && data.listCid) {
                const list = await lists.getByCidTx(tx, context, data.listCid);
                listId = list.id;
            }

            const segmentId = data.segmentId;

            if (listId) {
                await enforceSendPermissionTx(tx, context, campaign, true, listId);

                if (data.subscriptionCid) {
                    const subscriber = await subscriptions.getByCidTx(tx, context, listId, data.subscriptionCid, true, true);
                    await processSubscriber(sendConfigurationId, listId, subscriber.id, messageData);

                } else {
                    const subscribers = await subscriptions.listTestUsersTx(tx, context, listId, segmentId);
                    for (const subscriber of subscribers) {
                        await processSubscriber(sendConfigurationId, listId, subscriber.id, messageData);
                    }
                }

            } else {
                for (const lstSeg of campaign.lists) {
                    await enforceSendPermissionTx(tx, context, campaign, true, lstSeg.list);

                    const subscribers = await subscriptions.listTestUsersTx(tx, context, lstSeg.list, segmentId);
                    for (const subscriber of subscribers) {
                        await processSubscriber(sendConfigurationId, lstSeg.list, subscriber.id, messageData);
                    }
                }
            }

        } else { // This means we are sending a template
            /*
                Data coming from the client:
                - html, text
                - listCid, subscriptionCid, sendConfigurationId
             */

            const messageData = {
                subject: 'Test',
                html: data.html,
                text: data.text,
                tagLanguage: data.tagLanguage
            };

            const list = await lists.getByCidTx(tx, context, data.listCid);
            const subscriber = await subscriptions.getByCidTx(tx, context, list.id, data.subscriptionCid, true, true);

            await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', data.sendConfigurationId, 'sendWithoutOverrides');
            await shares.enforceEntityPermissionTx(tx, context, 'template', data.templateId, 'sendToTestUsers');
            await shares.enforceEntityPermissionTx(tx, context, 'list', list.id, 'sendToTestUsers');

            await processSubscriber(data.sendConfigurationId, list.id, subscriber.id, messageData);
        }
    });

    senders.scheduleCheck();
}

async function getRssPreview(context, campaignCid, listCid, subscriptionCid) {
    const campaign = await getByCid(context, campaignCid);
    await shares.enforceEntityPermission(context, 'campaign', campaign.id, 'view');

    enforce(campaign.type === CampaignType.RSS);

    const settings = {
        campaign, // this prevents message sender from fetching the campaign again
        rssEntry: await feedcheck.getEntryForPreview(campaign.data.feedUrl)
    };

    return await messageSender.getMessage(campaignCid, listCid, subscriptionCid, settings, true);
}


module.exports.Content = Content;
module.exports.hash = hash;

module.exports.listDTAjax = listDTAjax;
module.exports.listByChannelDTAjax = listByChannelDTAjax;
module.exports.listByNamespaceDTAjax = listByNamespaceDTAjax;
module.exports.listChildrenDTAjax = listChildrenDTAjax;
module.exports.listWithContentDTAjax = listWithContentDTAjax;
module.exports.listOthersWhoseListsAreIncludedDTAjax = listOthersWhoseListsAreIncludedDTAjax;
module.exports.listTestUsersDTAjax = listTestUsersDTAjax;
module.exports.listSentByStatusDTAjax = listSentByStatusDTAjax;
module.exports.listOpensDTAjax = listOpensDTAjax;
module.exports.listLinkClicksDTAjax = listLinkClicksDTAjax;


module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.getByCid = getByCid;
module.exports.create = create;
module.exports.createRssTx = createRssTx;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.enforceSendPermissionTx = enforceSendPermissionTx;

module.exports.getMessageCid = getMessageCid;
module.exports.getMessageByCid = getMessageByCid;
module.exports.getMessageByResponseId = getMessageByResponseId;

module.exports.changeStatusByCampaignCidAndSubscriptionIdTx = changeStatusByCampaignCidAndSubscriptionIdTx;
module.exports.changeStatusByMessage = changeStatusByMessage;
module.exports.updateMessageResponse = updateMessageResponse;

module.exports.prepareCampaignMessages = prepareCampaignMessages;

module.exports.start = start;
module.exports.stop = stop;
module.exports.reset = reset;
module.exports.enable = enable;
module.exports.disable = disable;

module.exports.rawGetByTx = rawGetByTx;
module.exports.getTrackingSettingsByCidTx = getTrackingSettingsByCidTx;
module.exports.getStatisticsOpened = getStatisticsOpened;

module.exports.fetchRssCampaign = fetchRssCampaign;

module.exports.testSend = testSend;
module.exports.getRssPreview = getRssPreview;
