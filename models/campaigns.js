'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shortid = require('shortid');
const { enforce, filterObject } = require('../lib/helpers');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const files = require('./files');
const templates = require('./templates');
const { CampaignStatus, CampaignSource, CampaignType, getSendConfigurationPermissionRequiredForSend} = require('../shared/campaigns');
const sendConfigurations = require('./send-configurations');
const triggers = require('./triggers');
const {SubscriptionStatus} = require('../shared/lists');
const subscriptions = require('./subscriptions');
const segments = require('./segments');
const senders = require('../lib/senders');

const allowedKeysCommon = ['name', 'description', 'segment', 'namespace',
    'send_configuration', 'from_name_override', 'from_email_override', 'reply_to_override', 'subject_override', 'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url'];

const allowedKeysCreate = new Set(['type', 'source', ...allowedKeysCommon]);
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

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace'),
        ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.type', 'campaigns.status', 'campaigns.scheduled', 'campaigns.source', 'campaigns.created', 'namespaces.name']
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
        ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.type', 'campaigns.created', 'namespaces.name']
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
        ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.type', 'campaigns.created', 'namespaces.name']
    );
}

async function listTestUsersDTAjax(context, campaignId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'view');

        /*
        This is supposed to produce queries like this:

        select * from (
          (select `subscription__1`.`email`, 2 AS campaign_list_id, 1 AS list, NULL AS segment from `subscription__1` where `subscription__1`.`status` = 1 and `subscription__1`.`is_test` = true)
        UNION ALL
          (select `subscription__2`.`email`, 4 AS campaign_list_id, 2 AS list, NULL AS segment from `subscription__2` where `subscription__2`.`status` = 1 and `subscription__2`.`is_test` = true)
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
                .select([subsTable + '.email', knex.raw('? AS campaign_list_id', [cpgList.id]), knex.raw('? AS list', [cpgList.list]), knex.raw('? AS segment', [cpgList.segment])])
                .toSQL().toNative();

            subsQrys.push(sqlQry);
        }

        if (subsQrys.length > 0) {
            let subsQry;

            if (subsQrys.length === 1) {
                const subsUnionSql = '(' + subsQrys[0].sql + ') as `test_subscriptions`'
                subsQry = knex.raw(subsUnionSql, subsQrys[0].bindings);

            } else {
                const subsUnionSql = '(' +
                    subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ') +
                    ') as `test_subscriptions`';
                const subsUnionBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
                subsQry = knex.raw(subsUnionSql, subsUnionBindings);
            }

            return await dtHelpers.ajaxListWithPermissions(
                context,
                [{ entityTypeId: 'list', requiredOperations: ['viewSubscriptions'] }],
                params,
                builder => {
                    const qry = builder.from(subsQry)
                        .innerJoin('lists', 'test_subscriptions.list', 'lists.id')
                        .leftJoin('segments', 'test_subscriptions.segment', 'segments.id')
                        .innerJoin('namespaces', 'lists.namespace', 'namespaces.id')

                    return qry
                },
                ['test_subscriptions.campaign_list_id', 'test_subscriptions.email', 'test_subscriptions.list', 'test_subscriptions.segment', 'lists.cid', 'lists.name', 'segments.name', 'namespaces.name']
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

async function rawGetByIdTx(tx, id) {
    const entity = await tx('campaigns').where('campaigns.id', id)
        .leftJoin('campaign_lists', 'campaigns.id', 'campaign_lists.campaign')
        .groupBy('campaigns.id')
        .select([
            'campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.namespace', 'campaigns.status', 'campaigns.type', 'campaigns.source',
            'campaigns.send_configuration', 'campaigns.from_name_override', 'campaigns.from_email_override', 'campaigns.reply_to_override', 'campaigns.subject_override',
            'campaigns.data', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled', 'campaigns.unsubscribe_url',
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', campaign_lists.list, campaign_lists.segment) ORDER BY campaign_lists.id SEPARATOR \';\') as lists`)
        ])
        .first();

    if (!entity) {
        throw new interoperableErrors.NotFoundError();
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

    let entity = await rawGetByIdTx(tx, id);

    if (content === Content.ALL || content === Content.RSS_ENTRY) {
        // Return everything

    } else if (content === Content.SETTINGS_WITH_STATS) {
        delete entity.data.sourceCustom;

        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'viewStats');

        const unsentQryGen = await getSubscribersQueryGeneratorTx(tx, id, true);
        if (unsentQryGen) {
            const res = await unsentQryGen(tx).count('* AS subscriptionsToSend').first();
            entity.subscriptionsToSend = res.subscriptionsToSend;
        }

        const totalQryGen = await getSubscribersQueryGeneratorTx(tx, id, false);
        if (totalQryGen) {
            const res = await totalQryGen(tx).count('* AS subscriptionsTotal').first();
            entity.subscriptionsTotal = res.subscriptionsTotal;
        }

    } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
        delete entity.data.sourceCustom;

    } else if (content === Content.ONLY_SOURCE_CUSTOM) {
        entity = {
            id: entity.id,

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

async function getByCidTx(tx, context, cid) {
    const entity = await tx('campaigns').where('cid', cid).first();
    if (!entity) {
        shares.throwPermissionDenied();
    }

    await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.id, 'view');
    return entity;
}

async function getByCid(context, cid) {
    return await knex.transaction(async tx => {
        return getByCidTx(tx, context, cid);
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
}

function convertFileURLs(sourceCustom, fromEntityType, fromEntityId, toEntityType, toEntityId) {

    function convertText(text) {
        if (text) {
            const fromUrl = `/files/${fromEntityType}/file/${fromEntityId}`;
            const toUrl = `/files/${toEntityType}/file/${toEntityId}`;

            const encodedFromUrl = encodeURIComponent(fromUrl);
            const encodedToUrl = encodeURIComponent(toUrl);

            text = text.split('[URL_BASE]' + fromUrl).join('[URL_BASE]' + toUrl);
            text = text.split('[SANDBOX_URL_BASE]' + fromUrl).join('[SANDBOX_URL_BASE]' + toUrl);
            text = text.split('[ENCODED_URL_BASE]' + encodedFromUrl).join('[ENCODED_URL_BASE]' + encodedToUrl);
            text = text.split('[ENCODED_SANDBOX_URL_BASE]' + encodedFromUrl).join('[ENCODED_SANDBOX_URL_BASE]' + encodedToUrl);
        }

        return text;
    }

    sourceCustom.html = convertText(sourceCustom.html);
    sourceCustom.text = convertText(sourceCustom.text);

    if (sourceCustom.type === 'mosaico' || sourceCustom.type === 'mosaicoWithFsTemplate') {
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.metadata = convertText(sourceCustom.data.metadata);
    }
}

async function _createTx(tx, context, entity, content) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createCampaign');

        let copyFilesFrom = null;
        if (entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            copyFilesFrom = {
                entityType: 'template',
                entityId: entity.data.sourceTemplate
            };

            const template = await templates.getByIdTx(tx, context, entity.data.sourceTemplate, false);

            entity.data.sourceCustom = {
                type: template.type,
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

        const filteredEntity = filterObject(entity, allowedKeysCreate);
        filteredEntity.cid = shortid.generate();

        const data = filteredEntity.data;

        filteredEntity.data = JSON.stringify(filteredEntity.data);
        const ids = await tx('campaigns').insert(filteredEntity);
        const id = ids[0];

        await tx('campaign_lists').insert(entity.lists.map(x => ({campaign: id, ...x})));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: id });

        if (copyFilesFrom) {
            await files.copyAllTx(tx, context, copyFilesFrom.entityType, 'file', copyFilesFrom.entityId, 'campaign', 'file', id);

            convertFileURLs(data.sourceCustom, copyFilesFrom.entityType, copyFilesFrom.entityId, 'campaign', id);
            await tx('campaigns')
                .update({
                    data: JSON.stringify(data)
                }).where('id', id);
        }

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

async function updateWithConsistencyCheck(context, entity, content) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.id, 'edit');

        const existing = await rawGetByIdTx(tx, entity.id);

        const existingHash = hash(existing, content);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, context, entity, false, content);

        let filteredEntity = filterObject(entity, allowedKeysUpdate);
        if (content === Content.ALL) {
            await namespaceHelpers.validateMove(context, entity, existing, 'campaign', 'createCampaign', 'delete');

        } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
            filteredEntity.data.sourceCustom = existing.data.sourceCustom;
            await namespaceHelpers.validateMove(context, filteredEntity, existing, 'campaign', 'createCampaign', 'delete');

        } else if (content === Content.ONLY_SOURCE_CUSTOM) {
            const data = existing.data;
            data.sourceCustom = filteredEntity.data.sourceCustom;
            filteredEntity = {
                data
            };
        }

        filteredEntity.data = JSON.stringify(filteredEntity.data);
        await tx('campaigns').where('id', entity.id).update(filteredEntity);

        await tx('campaign_lists').where('campaign', entity.id).del();
        await tx('campaign_lists').insert(entity.lists.map(x => ({campaign: entity.id, ...x})));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'delete');

        const existing = tx('campaigns').where('id', id);
        if (existing.status === CampaignStatus.SENDING) {
            return new interoperableErrors.InvalidStateError;
        }

        // FIXME - deal with deletion of dependent entities (files)

        await triggers.removeAllByCampaignIdTx(tx, context, id);

        await tx('campaigns').where('id', id).del();
    });
}

async function enforceSendPermissionTx(tx, context, campaignId) {
    const campaign = await getByIdTx(tx, context, campaignId, false);
    const sendConfiguration = await sendConfigurations.getByIdTx(tx, context, campaign.send_configuration, false, false);

    const requiredPermission = getSendConfigurationPermissionRequiredForSend(campaign, sendConfiguration);

    await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', campaign.send_configuration, requiredPermission);
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'send');
}


// Message API

function getMessageCid(campaignCid, listCid, subscriptionCid) {
    return [campaignCid, listCid, subscriptionCid].join('.')
}

async function getMessageByCid(messageCid) {
    const messageCid = messageCid.split('.');

    if (messageCid.length !== 3) {
        return null;
    }

    const [campaignCid, listCid, subscriptionCid] = messageCid;

    await knex.transaction(async tx => {
        const list = await tx('lists').where('cid', listCid).select('id');
        const subscrTblName = subscriptions.getSubscriptionTableName(list.id);

        const message = await tx('campaign_messages')
            .innerJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
            .innerJoin(subscrTblName, subscrTblName + '.id', 'campaign_messages.subscription')
            .leftJoin('segments', 'segment.id', 'campaign_messages.segment') // This is just to make sure that the respective segment still exists or return null if it doesn't
            .leftJoin('send_configurations', 'send_configurations.id', 'campaign_messages.send_configuration') // This is just to make sure that the respective send_configuration still exists or return null if it doesn't
            .where(subscrTblName + '.cid', subscriptionCid)
            .where('campaigns.cid', campaignCid)
            .select([
                'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'segments.id AS segment', 'campaign_messages.subscription',
                'send_configurations.id AS send_configuration', 'campaign_messages.status', 'campaign_messages.response', 'campaign_messages.response_id',
                'campaign_messages.updated', 'campaign_messages.created', 'send_configurations.verp_hostname AS verp_hostname'
            ]);

        if (message) {
            await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');
        }

        return message;
    });
}

async function getMessageByResponseId(responseId) {
    await knex.transaction(async tx => {
        const message = await tx('campaign_messages')
            .leftJoin('segments', 'segment.id', 'campaign_messages.segment') // This is just to make sure that the respective segment still exists or return null if it doesn't
            .leftJoin('send_configurations', 'send_configurations.id', 'campaign_messages.send_configuration') // This is just to make sure that the respective send_configuration still exists or return null if it doesn't
            .where('campaign_messages.response_id', responseId)
            .select([
                'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'segments.id AS segment', 'campaign_messages.subscription',
                'send_configurations.id AS send_configuration', 'campaign_messages.status', 'campaign_messages.response', 'campaign_messages.response_id',
                'campaign_messages.updated', 'campaign_messages.created', 'send_configurations.verp_hostname AS verp_hostname'
            ]);

        if (message) {
            await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');
        }

        return message;
    });
}

const statusFieldMapping = {
    [SubscriptionStatus.UNSUBSCRIBED]: 'unsubscribed',
    [SubscriptionStatus.BOUNCED]: 'bounced',
    [SubscriptionStatus.COMPLAINED]: 'complained'
};

async function _changeStatusByMessageTx(tx, context, message, subscriptionStatus) {
    enforce(subscriptionStatus !== SubscriptionStatus.SUBSCRIBED);

    if (message.status === SubscriptionStatus.SUBSCRIBED) {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');

        if (!subscriptionStatus in statusFieldMapping) {
            throw new Error('Unrecognized message status');
        }

        const statusField = statusFieldMapping[subscriptionStatus];

        if (message.status === SubscriptionStatus.SUBSCRIBED) {
            await tx('campaigns').increment(statusField, 1).where('id', message.campaign);
        }

        await tx('campaign_messages')
            .where('id', message.id)
            .update({
                status: subscriptionStatus,
                updated: knex.fn.now()
            });
    }
}

async function changeStatusByCampaignCidAndSubscriptionIdTx(tx, context, campaignCid, listId, subscriptionId, subscriptionStatus) {
    const campaign = await tx('campaigns').where('cid', campaignCid);
    const message = await tx('campaign_messages')
        .innerJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
        .where('campaigns.cid', campaignCid)
        .where({subscription: subscriptionId, list: listId});

    if (!message) {
        throw new Error('Invalid campaign.')
    }

    await _changeStatusByMessageTx(tx, context, message, subscriptionStatus);
}

async function changeStatusByMessage(context, message, subscriptionStatus, updateSubscription) {
    await knex.transaction(async tx => {
        if (updateSubscription) {
            await subscriptions.changeStatusTx(tx, context, message.list, message.subscription, subscriptionStatus);
        }

        await _changeStatusByMessageTx(tx, context, message, subscriptionStatus);
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

async function getSubscribersQueryGeneratorTx(tx, campaignId, onlyUnsent, batchSize) {
    /*
    This is supposed to produce queries like this:

    select ... from `campaign_lists` inner join (
        select `email`, min(`campaign_list_id`) as `campaign_list_id`, max(`sent`) as `sent` from (
            (select `subscription__2`.`email`, 8 AS campaign_list_id, related_campaign_messages.id IS NOT NULL AS sent from `subscription__2` left join
                (select * from `campaign_messages` where `campaign_messages`.`campaign` = 1 and `campaign_messages`.`list` = 2)
                    as `related_campaign_messages` on `related_campaign_messages`.`subscription` = `subscription__2`.`id` where `subscription__2`.`status` = 1)
            UNION ALL
            (select `subscription__1`.`email`, 9 AS campaign_list_id, related_campaign_messages.id IS NOT NULL AS sent from `subscription__1` left join
                (select * from `campaign_messages` where `campaign_messages`.`campaign` = 1 and `campaign_messages`.`list` = 1)
                    as `related_campaign_messages` on `related_campaign_messages`.`subscription` = `subscription__1`.`id` where `subscription__1`.`status` = 1)
        ) as `pending_subscriptions_all` where `sent` = false group by `email`)
            as `pending_subscriptions` on `campaign_lists`.`id` = `pending_subscriptions`.`campaign_list_id` where `campaign_lists`.`campaign` = '1'

     This was too much for Knex, so we partially construct these queries directly as strings;
     */

    const subsQrys = [];
    const cpgLists = await tx('campaign_lists').where('campaign', campaignId);

    for (const cpgList of cpgLists) {
        const addSegmentQuery = cpgList.segment ? await segments.getQueryGeneratorTx(tx, cpgList.list, cpgList.segment) : () => {};
        const subsTable = subscriptions.getSubscriptionTableName(cpgList.list);

        const sqlQry = knex.from(subsTable)
            .leftJoin(
                function () {
                    return this.from('campaign_messages')
                        .where('campaign_messages.campaign', campaignId)
                        .where('campaign_messages.list', cpgList.list)
                        .as('related_campaign_messages');
                },
                'related_campaign_messages.subscription', subsTable + '.id')
            .where(subsTable + '.status', SubscriptionStatus.SUBSCRIBED)
            .where(function() {
                addSegmentQuery(this);
            })
            .select([subsTable + '.email', knex.raw('? AS campaign_list_id', [cpgList.id]), knex.raw('related_campaign_messages.id IS NOT NULL AS sent')])
            .toSQL().toNative();

        subsQrys.push(sqlQry);
    }

    if (subsQrys.length > 0) {
        let subsQry;
        const unsentWhere = onlyUnsent ? ' where `sent` = false' : '';

        if (subsQrys.length === 1) {
            const subsUnionSql = '(select `email`, `campaign_list_id`, `sent` from (' + subsQrys[0].sql + ') as `pending_subscriptions_all`' +  unsentWhere + ') as `pending_subscriptions`'
            subsQry = knex.raw(subsUnionSql, subsQrys[0].bindings);

        } else {
            const subsUnionSql = '(select `email`, min(`campaign_list_id`) as `campaign_list_id`, max(`sent`) as `sent` from (' +
                subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ') +
                ') as `pending_subscriptions_all`' +  unsentWhere + ' group by `email`) as `pending_subscriptions`';
            const subsUnionBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
            subsQry = knex.raw(subsUnionSql, subsUnionBindings);
        }

        return knx => knx.from('campaign_lists')
            .where('campaign_lists.campaign', campaignId)
            .innerJoin(subsQry, 'campaign_lists.id', 'pending_subscriptions.campaign_list_id');

    } else {
        return null;
    }
}

async function _changeStatus(context, campaignId, permittedCurrentStates, newState, invalidStateMessage, scheduled = null) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'send');

        const entity = await tx('campaigns').where('id', campaignId).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        if (!permittedCurrentStates.includes(entity.status)) {
            throw new interoperableErrors.InvalidStateError(invalidStateMessage);
        }

        await tx('campaigns').where('id', campaignId).update({
            status: newState,
            scheduled
        });
    });

    senders.scheduleCheck();
}


async function start(context, campaignId, startAt) {
    await _changeStatus(context, campaignId, [CampaignStatus.IDLE, CampaignStatus.PAUSED, CampaignStatus.FINISHED], CampaignStatus.SCHEDULED, 'Cannot start campaign until it is in IDLE or PAUSED state', startAt);
}

async function stop(context, campaignId) {
    await _changeStatus(context, campaignId, [CampaignStatus.SCHEDULED], CampaignStatus.PAUSED, 'Cannot stop campaign until it is in SCHEDULED state');
}

async function reset(context, campaignId) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'send');

        const entity = await tx('campaigns').where('id', campaignId).first();
        if (!entity) {
            throw new interoperableErrors.NotFoundError();
        }

        if (entity.status !== CampaignStatus.FINISHED && entity.status !== CampaignStatus.PAUSED) {
            throw new interoperableErrors.InvalidStateError('Cannot reset campaign until it is FINISHED or PAUSED state');
        }

        await tx('campaigns').where('id', campaignId).update({
            status: CampaignStatus.IDLE
        });

        await tx('campaign_messages').where('campaign', campaignId).del();
        await tx('campaign_links').where('campaign', campaignId).del();
    });
}

module.exports.Content = Content;
module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listWithContentDTAjax = listWithContentDTAjax;
module.exports.listOthersWhoseListsAreIncludedDTAjax = listOthersWhoseListsAreIncludedDTAjax;
module.exports.listTestUsersDTAjax = listTestUsersDTAjax;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.getByCidTx = getByCidTx;
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

module.exports.getSubscribersQueryGeneratorTx = getSubscribersQueryGeneratorTx;

module.exports.start = start;
module.exports.stop = stop;
module.exports.reset = reset;