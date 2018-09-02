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
const { CampaignSource, CampaignType, getSendConfigurationPermissionRequiredForSend} = require('../shared/campaigns');
const segments = require('./segments');
const sendConfigurations = require('./send-configurations');
const triggers = require('./triggers');

const allowedKeysCommon = ['name', 'description', 'list', 'segment', 'namespace',
    'send_configuration', 'from_name_override', 'from_email_override', 'reply_to_override', 'subject_override', 'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url'];

const allowedKeysCreate = new Set(['type', 'source', ...allowedKeysCommon]);
const allowedKeysUpdate = new Set([...allowedKeysCommon]);

const Content = {
    ALL: 0,
    WITHOUT_SOURCE_CUSTOM: 1,
    ONLY_SOURCE_CUSTOM: 2,
    RSS_ENTRY: 3
};

function hash(entity, content) {
    let filteredEntity;

    if (content === Content.ALL) {
        filteredEntity = filterObject(entity, allowedKeysUpdate);

    } else if (content === Content.WITHOUT_SOURCE_CUSTOM) {
        filteredEntity = filterObject(entity, allowedKeysUpdate);
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

async function listOthersByListDTAjax(context, campaignId, listId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace')
            .whereNot('campaigns.id', campaignId)
            .where('campaigns.list', listId),
        ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.type', 'campaigns.created', 'namespaces.name']
    );
}

async function getByIdTx(tx, context, id, withPermissions = true, content = Content.ALL) {
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'view');
    let entity = await tx('campaigns').where('id', id).first();

    entity.data = JSON.parse(entity.data);

    if (content === Content.WITHOUT_SOURCE_CUSTOM) {
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

        await shares.enforceEntityPermissionTx(tx, context, 'list', entity.list, 'view');

        if (entity.segment) {
            // Check that the segment under the list exists
            await segments.getByIdTx(tx, context, entity.list, entity.segment);
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

        await knex.schema.raw('CREATE TABLE `campaign__' + id + '` (\n' +
            '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
            '  `list` int(10) unsigned NOT NULL,\n' +
            '  `segment` int(10) unsigned NOT NULL,\n' +
            '  `subscription` int(10) unsigned NOT NULL,\n' +
            '  `status` tinyint(4) unsigned NOT NULL DEFAULT \'0\',\n' +
            '  `response` varchar(255) DEFAULT NULL,\n' +
            '  `response_id` varchar(255) CHARACTER SET ascii DEFAULT NULL,\n' +
            '  `updated` timestamp NULL DEFAULT NULL,\n' +
            '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`id`),\n' +
            '  UNIQUE KEY `list` (`list`,`segment`,`subscription`),\n' +
            '  KEY `created` (`created`),\n' +
            '  KEY `response_id` (`response_id`),\n' +
            '  KEY `status_index` (`status`),\n' +
            '  KEY `subscription_index` (`subscription`)\n' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

        await knex.schema.raw('CREATE TABLE `campaign__tracker' + id + '` (\n' +
            '  `list` int(10) unsigned NOT NULL,\n' +
            '  `subscriber` int(10) unsigned NOT NULL,\n' +
            '  `link` int(10) NOT NULL,\n' +
            '  `ip` varchar(100) CHARACTER SET ascii DEFAULT NULL,\n' +
            '  `device_type` varchar(50) DEFAULT NULL,\n' +
            '  `country` varchar(2) CHARACTER SET ascii DEFAULT NULL,\n' +
            '  `count` int(11) unsigned NOT NULL DEFAULT \'1\',\n' +
            '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`list`,`subscriber`,`link`),\n' +
            '  KEY `created_index` (`created`)\n' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

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

        const existing = await tx('campaigns').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.data = JSON.parse(existing.data);
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

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'delete');

        // FIXME - deal with deletion of dependent entities (files)

        await triggers.removeAllByCampaignIdTx(tx, context, id);

        await tx('campaigns').where('id', id).del();
        await knex.schema.dropTableIfExists('campaign__' + id);
        await knex.schema.dropTableIfExists('campaign_tracker__' + id);
    });
}

async function enforceSendPermissionTx(tx, context, campaignId) {
    const campaign = await getByIdTx(tx, context, campaignId, false);
    const sendConfiguration = await sendConfigurations.getByIdTx(tx, context, campaign.send_configuration, false, false);

    const requiredPermission = getSendConfigurationPermissionRequiredForSend(campaign, sendConfiguration);

    await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', campaign.send_configuration, requiredPermission);
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'send');
}

// This is to handle circular dependency with triggers.js
Object.assign(module.exports, {
    Content,
    hash,
    listDTAjax,
    listWithContentDTAjax,
    listOthersByListDTAjax,
    getByIdTx,
    getById,
    create,
    createRssTx,
    updateWithConsistencyCheck,
    remove,
    enforceSendPermissionTx
});