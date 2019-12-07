'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const shortid = require('shortid');
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const fields = require('./fields');
const segments = require('./segments');
const imports = require('./imports');
const entitySettings = require('../lib/entity-settings');
const dependencyHelpers = require('../lib/dependency-helpers');

const {EntityActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');

const {UnsubscriptionMode, FieldWizard} = require('../../shared/lists');

const allowedKeys = new Set(['name', 'description', 'default_form', 'public_subscribe', 'unsubscription_mode', 'contact_email', 'homepage', 'namespace', 'to_name', 'listunsubscribe_disabled', 'send_configuration']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}


async function _listDTAjax(context, namespaceId, params) {
    const campaignEntityType = entitySettings.getEntityType('campaign');

    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'list', requiredOperations: ['view'] }],
        params,
        builder => {
            builder = builder
                .from('lists')
                .innerJoin('namespaces', 'namespaces.id', 'lists.namespace');
            if (namespaceId) {
                builder = builder.where('lists.namespace', namespaceId);
            }
            return builder;
        },
        ['lists.id', 'lists.name', 'lists.cid', 'lists.subscribers', 'lists.description', 'namespaces.name',
            {
                name: 'triggerCount',
                query: builder =>
                    builder.from('campaigns')
                        .innerJoin('campaign_lists', 'campaigns.id', 'campaign_lists.campaign')
                        .innerJoin('triggers', 'campaigns.id', 'triggers.campaign')
                        .innerJoin(campaignEntityType.permissionsTable, 'campaigns.id', `${campaignEntityType.permissionsTable}.entity`)
                        .whereRaw('campaign_lists.list = lists.id')
                        .where(`${campaignEntityType.permissionsTable}.operation`, 'viewTriggers')
                        .count()
                        .as('triggerCount')
            }
        ]
    );
}

async function listDTAjax(context, params) {
    return await _listDTAjax(context, undefined, params);
}

async function listByNamespaceDTAjax(context, namespaceId, params) {
    return await _listDTAjax(context, namespaceId, params);
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

        const fieldsToAdd = [];

        const fieldWizard = entity.fieldWizard;
        if (fieldWizard === FieldWizard.FIRST_LAST_NAME) {
            if (entity.to_name === null) {
                entity.to_name = '[MERGE_FIRST_NAME] [MERGE_LAST_NAME]';
            }

            fieldsToAdd.push({
                name: 'First name',
                key: 'MERGE_FIRST_NAME',
                default_value: '',
                type: 'text',
                group: null,
                settings: {}
            });

            fieldsToAdd.push({
                name: 'Last name',
                key: 'MERGE_LAST_NAME',
                default_value: '',
                type: 'text',
                group: null,
                settings: {}
            });

        } else if (fieldWizard === FieldWizard.NAME) {
            if (entity.to_name === null) {
                entity.to_name = '[MERGE_NAME]';
            }

            fieldsToAdd.push({
                name: 'Name',
                key: 'MERGE_NAME',
                default_value: '',
                type: 'text',
                group: null,
                settings: {}
            });
        }

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.cid = shortid.generate();

        const ids = await tx('lists').insert(filteredEntity);
        const id = ids[0];

        await knex.schema.raw('CREATE TABLE `subscription__' + id + '` (\n' +
            '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
            '  `cid` varchar(255) CHARACTER SET ascii NOT NULL,\n' +
            '  `email` varchar(255) CHARACTER SET utf8 DEFAULT NULL,\n' +
            '  `hash_email` varchar(255) CHARACTER SET ascii NOT NULL,\n' +
            '  `source_email` int(11) DEFAULT NULL,\n' +  // Altough this is a reference to an import, it is represented as signed int(11). This is because we use negative values for constant from SubscriptionSource
            '  `opt_in_ip` varchar(100) DEFAULT NULL,\n' +
            '  `opt_in_country` varchar(2) DEFAULT NULL,\n' +
            '  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,\n' +
            '  `status` tinyint(4) unsigned NOT NULL DEFAULT \'1\',\n' +
            '  `is_test` tinyint(4) unsigned NOT NULL DEFAULT \'0\',\n' +
            '  `status_change` timestamp NULL DEFAULT NULL,\n' +
            '  `unsubscribed` timestamp NULL DEFAULT NULL,\n' +
            '  `latest_open` timestamp NULL DEFAULT NULL,\n' +
            '  `latest_click` timestamp NULL DEFAULT NULL,\n' +
            '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`id`),\n' +
            '  UNIQUE KEY `hash_email` (`hash_email`),\n' +
            '  UNIQUE KEY `cid` (`cid`),\n' +
            '  KEY `email` (`email`),\n' +
            '  KEY `status` (`status`),\n' +
            '  KEY `subscriber_tz` (`tz`),\n' +
            '  KEY `is_test` (`is_test`),\n' +
            '  KEY `latest_open` (`latest_open`),\n' +
            '  KEY `latest_click` (`latest_click`),\n' +
            '  KEY `created` (`created`),\n' +
            '  KEY `updated` (`updated`)\n' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'list', entityId: id });

        for (const fld of fieldsToAdd) {
            await fields.createTx(tx, context, id, fld);
        }

        await activityLog.logEntityActivity('list', EntityActivityType.CREATE, id);

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

        await activityLog.logEntityActivity('list', EntityActivityType.UPDATE, entity.id);
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', id, 'delete');

        await dependencyHelpers.ensureNoDependencies(tx, context, id, [
            {
                entityTypeId: 'campaign',
                query: tx => tx('campaign_lists')
                    .where('campaign_lists.list', id)
                    .innerJoin('campaigns', 'campaign_lists.campaign', 'campaigns.id')
                    .select(['campaigns.id', 'campaigns.name'])
            }
        ]);

        await fields.removeAllByListIdTx(tx, context, id);
        await segments.removeAllByListIdTx(tx, context, id);
        await imports.removeAllByListIdTx(tx, context, id);

        await tx('lists').where('id', id).del();
        await knex.schema.dropTableIfExists('subscription__' + id);

        await activityLog.logEntityActivity('list', EntityActivityType.REMOVE, id);
    });
}


module.exports.UnsubscriptionMode = UnsubscriptionMode;
module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listByNamespaceDTAjax = listByNamespaceDTAjax;
module.exports.listWithSegmentByCampaignDTAjax = listWithSegmentByCampaignDTAjax;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.getByIdWithListFields = getByIdWithListFields;
module.exports.getByCidTx = getByCidTx;
module.exports.getByCid = getByCid;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
