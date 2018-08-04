'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const {EntityVals, EventVals, Entity} = require('../shared/triggers');
const campaigns = require('./campaigns');

const allowedKeys = new Set(['name', 'description', 'entity', 'event', 'seconds_after', 'enabled', 'source_campaign']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, campaignId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'viewTriggers');

        const entity = await tx('triggers').where({campaign: campaignId, id}).first();

        return entity;
    });
}

async function listByCampaignDTAjax(context, campaignId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'viewTriggers');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('triggers')
                .innerJoin('campaigns', 'campaigns.id', 'triggers.campaign')
                .innerJoin('lists', 'lists.id', 'campaigns.list')
                .where('triggers.campaign', campaignId),
            [ 'triggers.id', 'triggers.name', 'triggers.description', 'lists.name', 'triggers.entity', 'triggers.event', 'triggers.seconds_after', 'triggers.enabled' ]
        );
    });
}

async function listByListDTAjax(context, listId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['viewTriggers'] }],
        params,
        builder => builder
            .from('triggers')
            .innerJoin('campaigns', 'campaigns.id', 'triggers.campaign')
            .where('campaigns.list', listId),
        [ 'triggers.id', 'triggers.name', 'triggers.description', 'campaigns.name', 'triggers.entity', 'triggers.event', 'triggers.seconds_after', 'triggers.enabled', 'triggers.campaign' ]
    );
}

async function _validateAndPreprocess(tx, context, campaignId, entity) {
    enforce(Number.isInteger(entity.seconds_after));
    enforce(entity.seconds_after >= 0, 'Seconds after must not be negative');
    enforce(entity.entity in EntityVals, 'Invalid entity');
    enforce(entity.event in EventVals[entity.entity], 'Invalid event');

    if (entity.entity === Entity.CAMPAIGN) {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', entity.source_campaign, 'view');
    }

    await campaigns.enforceSendPermissionTx(tx, context, campaignId);
}

async function create(context, campaignId, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'manageTriggers');

        await _validateAndPreprocess(tx, context, campaignId, entity);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.campaign = campaignId;

        const ids = await tx('triggers').insert(filteredEntity);
        const id = ids[0];

        await knex.schema.raw('CREATE TABLE `trigger__' + id + '` (\n' +
            '  `list` int(11) unsigned NOT NULL,\n' +
            '  `subscription` int(11) unsigned NOT NULL,\n' +
            '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`list`,`subscription`)\n' +
            ') ENGINE=InnoDB DEFAULT CHARSET=utf8;\n');

        return id;
    });
}

async function updateWithConsistencyCheck(context, campaignId, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'manageTriggers');

        const existing = await tx('triggers').where({campaign: campaignId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, context, campaignId, entity);

        await tx('triggers').where({campaign: campaignId, id: entity.id}).update(filterObject(entity, allowedKeys));
    });
}

async function removeTx(tx, context, campaignId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'campaign', campaignId, 'manageTriggers');

    await tx('triggers').where({campaign: campaignId, id}).del();

    await knex.schema.dropTableIfExists('trigger__' + id);
}

async function remove(context, campaignId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, campaignId, id);
    });
}

async function removeAllByCampaignIdTx(tx, context, campaignId) {
    const entities = await tx('triggers').where('list', campaignId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, campaignId, entity.id);
    }
}



// This is to handle circular dependency with campaigns.js
Object.assign(module.exports, {
    hash,
    getById,
    listByCampaignDTAjax,
    listByListDTAjax,
    create,
    updateWithConsistencyCheck,
    removeTx,
    remove,
    removeAllByCampaignIdTx
});