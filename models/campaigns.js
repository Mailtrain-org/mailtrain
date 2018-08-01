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
const { CampaignSource, CampaignType} = require('../shared/campaigns');
const segments = require('./segments');

const allowedKeysCommon = ['name', 'description', 'list', 'segment', 'namespace',
    'send_configuration', 'from_name_override', 'from_email_override', 'reply_to_override', 'subject_override', 'data', 'click_tracking_disabled', 'open_tracking_disabled'];

const allowedKeysCreate = new Set(['type', 'source', ...allowedKeysCommon]);
const allowedKeysUpdate = new Set([...allowedKeysCommon]);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeysUpdate));
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

async function getById(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'view');
        const entity = await tx('campaigns').where('id', id).first();

        entity.permissions = await shares.getPermissionsTx(tx, context, 'campaign', id);

        entity.data = JSON.parse(entity.data);

        return entity;
    });
}

async function _validateAndPreprocess(tx, context, entity, isCreate) {
    await namespaceHelpers.validateEntity(tx, entity);

    if (isCreate) {
        enforce(entity.type === CampaignType.REGULAR && entity.type === CampaignType.RSS && entity.type === CampaignType.TRIGGERED, 'Unknown campaign type');

        if (entity.source === CampaignSource.TEMPLATE || entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            await shares.enforceEntityPermissionTx(tx, context, 'template', entity.data.sourceTemplate, 'view');
        }
    }

    enforce(entity.source >= CampaignSource.MIN && entity.source <= CampaignSource.MAX, 'Unknown campaign source');

    await shares.enforceEntityPermissionTx(tx, context, 'list', entity.list, 'view');

    if (entity.segment) {
        // Check that the segment under the list exists
        await segments.getByIdTx(tx, context, entity.list, entity.segment);
    }

    entity.data = JSON.stringify(entity.data);
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createCampaign');

        let copyFilesFromTemplateId;
        if (entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            copyFilesFromTemplateId = entity.data.sourceTemplate;
        }

        await _validateAndPreprocess(tx, context, entity, true);

        const filteredEntity = filterObject(entity, allowedKeysCreate);
        filteredEntity.cid = shortid.generate();

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

        if (copyFilesFromTemplateId) {
            files.copyAllTx(tx, context, 'template', copyFilesFromTemplateId, 'campaign', id);
        }

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.id, 'edit');

        const existing = await tx('campaigns').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.data = JSON.parse(existing.data);
        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, context, entity, false);

        await namespaceHelpers.validateMove(context, entity, existing, 'campaign', 'createCampaign', 'delete');

        await tx('campaigns').where('id', entity.id).update(filterObject(entity, allowedKeysUpdate));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'campaign', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', id, 'delete');

        // FIXME - deal with deletion of dependent entities (files)

        await tx('campaigns').where('id', id).del();
        await knex.schema.dropTableIfExists('campaign__' + id);
        await knex.schema.dropTableIfExists('campaign_tracker__' + id);
    });
}


module.exports = {
    hash,
    listDTAjax,
    getById,
    create,
    updateWithConsistencyCheck,
    remove
};