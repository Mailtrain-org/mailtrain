'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shortid = require('../lib/shortid');
const { enforce, filterObject } = require('../lib/helpers');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const { allTagLanguages } = require('../../shared/templates');
const { CampaignSource, } = require('../../shared/campaigns');
const segments = require('./segments');
const dependencyHelpers = require('../lib/dependency-helpers');

const {EntityActivityType, CampaignActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');

const allowedKeys = new Set(['name', 'description', 'namespace', 'cpg_name', 'cpg_description',
    'send_configuration', 'from_name_override', 'from_email_override', 'reply_to_override', 'subject', 'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url', 'source']);


function hash(entity) {
    let filteredEntity;

    filteredEntity = filterObject(entity, allowedKeys);
    filteredEntity.lists = entity.lists;

    return hasher.hash(filteredEntity);
}

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'channel', requiredOperations: ['view'] }],
        params,
        builder => {
            builder = builder.from('channels')
                .innerJoin('namespaces', 'namespaces.id', 'channels.namespace');
            return builder;
        },
        ['channels.id', 'channels.name', 'channels.cid', 'channels.description', 'namespaces.name']
    );
}

async function listWithCreateCampaignPermissionDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'channel', requiredOperations: ['createCampaign'] }],
        params,
        builder => {
            builder = builder.from('channels')
                .innerJoin('namespaces', 'namespaces.id', 'channels.namespace');
            return builder;
        },
        ['channels.id', 'channels.name', 'channels.cid', 'channels.description', 'namespaces.name']
    );
}


async function _getByTx(tx, context, key, id, withPermissions = true) {
    const entity = await tx('channels').where('channels.' + key, id)
        .leftJoin('channel_lists', 'channels.id', 'channel_lists.channel')
        .groupBy('channels.id')
        .select([
            'channels.id', 'channels.name', 'channels.cid', 'channels.description', 'channels.namespace', 'channels.cpg_name', 'channels.cpg_description', 'channels.source',
            'channels.send_configuration', 'channels.from_name_override', 'channels.from_email_override', 'channels.reply_to_override', 'channels.subject',
            'channels.data', 'channels.click_tracking_disabled', 'channels.open_tracking_disabled', 'channels.unsubscribe_url',
            knex.raw(`GROUP_CONCAT(CONCAT_WS(\':\', channel_lists.list, channel_lists.segment) ORDER BY channel_lists.id SEPARATOR \';\') as lists`)
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

    if (withPermissions) {
        entity.permissions = await shares.getPermissionsTx(tx, context, 'channel', id);
    }

    return entity;
}

async function getByIdTx(tx, context, id, withPermissions = true) {
    await shares.enforceEntityPermissionTx(tx, context, 'channel', id, 'view');

    return await _getByTx(tx, context, 'id', id, withPermissions);
}

async function getById(context, id, withPermissions = true) {
    return await knex.transaction(async tx => {
        return await getByIdTx(tx, context, id, withPermissions);
    });
}

async function _validateAndPreprocess(tx, context, entity, isCreate) {
    await namespaceHelpers.validateEntity(tx, entity);

    if (entity.source !== null) {
        enforce(Number.isInteger(entity.source));

        if (entity.source === CampaignSource.TEMPLATE || entity.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            await shares.enforceEntityPermissionTx(tx, context, 'template', entity.data.sourceTemplate, 'view');
        } else if (entity.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.data.sourceCampaign, 'view');
        } else if (entity.source === CampaignSource.CUSTOM) {
            enforce(allTagLanguages.includes(entity.data.sourceCustom.tag_language), `Invalid tag language '${entity.data.sourceCustom.tag_language}'`);
        } else if (entity.source === CampaignSource.URL) {
        } else {
            enforce(false, 'Unknown channel source');
        }
    }

    for (const lstSeg of entity.lists) {
        await shares.enforceEntityPermissionTx(tx, context, 'list', lstSeg.list, 'view');

        if (lstSeg.segment) {
            // Check that the segment under the list exists
            await segments.getByIdTx(tx, context, lstSeg.list, lstSeg.segment);
        }
    }

    if (entity.send_configuration) {
        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', entity.send_configuration, 'viewPublic');
    }

}

async function _createTx(tx, context, entity, content) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createCampaign');

        await _validateAndPreprocess(tx, context, entity, true, content);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.cid = shortid.generate();
        filteredEntity.data = JSON.stringify(filteredEntity.data);

        const ids = await tx('channels').insert(filteredEntity);
        const id = ids[0];

        await tx('channel_lists').insert(entity.lists.map(x => ({channel: id, ...x})));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'channel', entityId: id });

        await activityLog.logEntityActivity('channel', EntityActivityType.CREATE, id, {});

        return id;
    });
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        return await _createTx(tx, context, entity);
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'channel', entity.id, 'edit');

        const existing = await _getByTx(tx, context, 'id', entity.id, false);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, context, entity, false);

        let filteredEntity = filterObject(entity, allowedKeys);
        await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'channel', 'createCampaign', 'delete');

        await tx('channel_lists').where('channel', entity.id).del();
        await tx('channel_lists').insert(entity.lists.map(x => ({channel: entity.id, ...x})));

        filteredEntity.data = JSON.stringify(filteredEntity.data);
        await tx('channels').where('id', entity.id).update(filteredEntity);

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'channel', entityId: entity.id });

        await activityLog.logEntityActivity('channel', EntityActivityType.UPDATE, entity.id, {});
    });
}


async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'channel', id, 'delete');

        await dependencyHelpers.ensureNoDependencies(tx, context, id, [
            { entityTypeId: 'campaign', column: 'channel' }
        ]);

        await tx('channels').where('id', id).del();

        await activityLog.logEntityActivity('channel', EntityActivityType.REMOVE, id);
    });
}


module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listWithCreateCampaignPermissionDTAjax = listWithCreateCampaignPermissionDTAjax;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
