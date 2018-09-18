'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const shortid = require('shortid');
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const fields = require('./fields');
const segments = require('./segments');
const entitySettings = require('../lib/entity-settings');

const UnsubscriptionMode = require('../shared/lists').UnsubscriptionMode;

const allowedKeys = new Set(['name', 'description', 'default_form', 'public_subscribe', 'unsubscription_mode', 'contact_email', 'homepage', 'namespace', 'to_name']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}


async function listDTAjax(context, params) {
    const campaignEntityType = entitySettings.getEntityType('campaign');

    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'list', requiredOperations: ['view'] }],
        params,
        builder => builder
            .from('lists')
            .innerJoin('namespaces', 'namespaces.id', 'lists.namespace'),
        ['lists.id', 'lists.name', 'lists.cid', 'lists.subscribers', 'lists.description', 'namespaces.name',
            { query: builder =>
                builder.from('campaigns')
                    .innerJoin('campaign_lists', 'campaigns.id', 'campaign_lists.campaign')
                    .innerJoin('triggers', 'campaigns.id', 'triggers.campaign')
                    .innerJoin(campaignEntityType.permissionsTable, 'campaigns.id', `${campaignEntityType.permissionsTable}.entity`)
                    .whereRaw('campaign_lists.list = lists.id')
                    .where(`${campaignEntityType.permissionsTable}.operation`, 'viewTriggers')
                    .count()
            }
        ]
    );
}

async function listWithSegmentByCampaignDTAjax(context, campaignId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'list', requiredOperations: ['view'] }],
        params,
        builder => builder
            .from('lists')
            .innerJoin('campaign_lists', 'campaign_lists.list', 'lists.id')
            .leftJoin('segments', 'segments.id', 'campaign_lists.segment')
            .innerJoin('namespaces', 'namespaces.id', 'lists.namespace')
            .where('campaign_lists.campaign', campaignId)
            .orderBy('campaign_lists.id', 'asc'),
        ['lists.id', 'lists.name', 'lists.cid', 'namespaces.name', 'segments.name']
    );
}

async function getByIdTx(tx, context, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', id, 'view');
    const entity = await tx('lists').where('id', id).first();
    return entity;
}

async function getById(context, id) {
    return await knex.transaction(async tx => {
        // note that permissions are not obtained here as this methods is used only with synthetic admin context
        return await getByIdTx(tx, context, id);
    });
}

async function getByIdWithListFields(context, id) {
    return await knex.transaction(async tx => {
        const entity = await getByIdTx(tx, context, id);
        entity.permissions = await shares.getPermissionsTx(tx, context, 'list', id);
        entity.listFields = await fields.listByOrderListTx(tx, id);
        return entity;
    });
}

async function getByCidTx(tx, context, cid) {
    const entity = await tx('lists').where('cid', cid).first();
    if (!entity) {
        shares.throwPermissionDenied();
    }

    await shares.enforceEntityPermissionTx(tx, context, 'list', entity.id, 'view');
    return entity;
}

async function getByCid(context, cid) {
    return await knex.transaction(async tx => {
        return getByCidTx(tx, context, cid);
    });
}

async function _validateAndPreprocess(tx, entity) {
    await namespaceHelpers.validateEntity(tx, entity);
    enforce(entity.unsubscription_mode >= UnsubscriptionMode.MIN && entity.unsubscription_mode <= UnsubscriptionMode.MAX, 'Unknown unsubscription mode');
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createList');

        await _validateAndPreprocess(tx, entity);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.cid = shortid.generate();

        const ids = await tx('lists').insert(filteredEntity);
        const id = ids[0];

        await knex.schema.raw('CREATE TABLE `subscription__' + id + '` (\n' +
            '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
            '  `cid` varchar(255) CHARACTER SET ascii NOT NULL,\n' +
            '  `email` varchar(255) CHARACTER SET utf8 NOT NULL,\n' +
            '  `hash_email` varchar(255) CHARACTER SET ascii NOT NULL,\n' +
            '  `source_email` int(10) unsigned,\n' + // This references imports if the source is an import, 0 means some import in version 1, NULL if the source is via subscription or edit of the subscription
            '  `opt_in_ip` varchar(100) DEFAULT NULL,\n' +
            '  `opt_in_country` varchar(2) DEFAULT NULL,\n' +
            '  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,\n' +
            '  `status` tinyint(4) unsigned NOT NULL DEFAULT \'1\',\n' +
            '  `is_test` tinyint(4) unsigned NOT NULL DEFAULT \'0\',\n' +
            '  `status_change` timestamp NULL DEFAULT NULL,\n' +
            '  `latest_open` timestamp NULL DEFAULT NULL,\n' +
            '  `latest_click` timestamp NULL DEFAULT NULL,\n' +
            '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`id`),\n' +
            '  UNIQUE KEY `email` (`email`),\n' +
            '  UNIQUE KEY `cid` (`cid`),\n' +
            '  KEY `status` (`status`),\n' +
            '  KEY `subscriber_tz` (`tz`),\n' +
            '  KEY `is_test` (`is_test`),\n' +
            '  KEY `latest_open` (`latest_open`),\n' +
            '  KEY `latest_click` (`latest_click`),\n' +
            '  KEY `created` (`created`)\n' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', entity.id, 'edit');

        const existing = await tx('lists').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, entity);

        await namespaceHelpers.validateMove(context, entity, existing, 'list', 'createList', 'delete');

        await tx('lists').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'list', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', id, 'delete');

        await fields.removeAllByListIdTx(tx, context, id);
        await segments.removeAllByListIdTx(tx, context, id);

        await tx('lists').where('id', id).del();
        await knex.schema.dropTableIfExists('subscription__' + id);
    });
}

async function removeFormFromAllTx(tx, context, formId) {
    await knex.transaction(async tx => {
        const entities = tx('lists').where('default_form', formId).select(['id']);

        for (const entity of entities) {
            await shares.enforceEntityPermissionTx(tx, context, 'list', entity.id, 'edit');
            await tx('lists').where('id', entity.id).update({default_form: null});
        }
    });
}

async function getMergeTags(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', id, ['view']);
        const groupedFields = await fields.listGroupedTx(tx, id);

        const mergeTags = [];
        for (const field of groupedFields) {
            mergeTags.push({
                key: field.key,
                value: field.name
            });

        }

        return mergeTags;
    });
}


module.exports.UnsubscriptionMode = UnsubscriptionMode;
module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listWithSegmentByCampaignDTAjax = listWithSegmentByCampaignDTAjax;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.getByIdWithListFields = getByIdWithListFields;
module.exports.getByCidTx = getByCidTx;
module.exports.getByCid = getByCid;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.removeFormFromAllTx = removeFormFromAllTx;
module.exports.getMergeTags = getMergeTags;
