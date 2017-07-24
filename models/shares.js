'use strict';

const knex = require('../lib/knex');
const config = require('config');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const entityTypes = {
  reportTemplate: {
      entitiesTable: 'report_templates',
      sharesTable: 'shares_report_template',
      permissionsTable: 'permissions_report_template'
  }
};

function getEntityType(entityTypeId) {
    const entityType = entityTypes[entityTypeId];

    if (!entityType) {
        throw new Error(`Unknown entity type ${entityTypeId}`);
    }

    return entityType
}

async function listDTAjax(entityTypeId, entityId, params) {
    const entityType = getEntityType(entityTypeId);
    return await dtHelpers.ajaxList(params, tx => tx(entityType.sharesTable).innerJoin('users', entityType.sharesTable + '.user', 'users.id'), [entityType.sharesTable + '.id', 'users.username', 'users.name', entityType.sharesTable + '.role', 'users.id']);
}

async function listUnassignedUsersDTAjax(entityTypeId, entityId, params) {
    const entityType = getEntityType(entityTypeId);
    return await dtHelpers.ajaxList(
        params,
        tx => tx('users').whereNotExists(function() { return this.select('*').from(entityType.sharesTable).whereRaw(`users.id = ${entityType.sharesTable}.user`); }),
        ['users.id', 'users.username', 'users.name']);
}


async function assign(entityTypeId, entityId, userId, role) {
    const entityType = getEntityType(entityTypeId);
    await knex.transaction(async tx => {
        enforce(await tx('users').where('id', userId).select('id').first(), 'Invalid user id');
        enforce(await tx(entityType.entitiesTable).where('id', entityId).select('id').first(), 'Invalid entity id');

        const entry = await tx(entityType.sharesTable).where({user: userId, entity: entityId}).select('id', 'role').first();

        if (entry) {
            if (!role) {
                await tx(entityType.sharesTable).where('id', entry.id).del();
            } else if (entry.role !== role) {
                await tx(entityType.sharesTable).where('id', entry.id).update('role', role);
            }
        } else {
            await tx(entityType.sharesTable).insert({
                user: userId,
                entity: entityId,
                role
            });
        }

        await tx(entityType.permissionsTable).where({user: userId, entity: entityId}).del();
        if (role) {
            const permissions = config.roles[entityTypeId][role].permissions;
            const data = permissions.map(operation => ({user: userId, entity: entityId, operation}));
            await tx(entityType.permissionsTable).insert(data);
        }
    });
}

async function rebuildPermissions() {
    await knex.transaction(async tx => {
        for (const entityTypeId in entityTypes) {
            const entityType = entityTypes[entityTypeId];

            await tx(entityType.permissionsTable).del();

            const shares = await tx(entityType.sharesTable).select(['entity', 'user', 'role']);
            for (const share in shares) {
                const permissions = config.roles[entityTypeId][share.role].permissions;
                const data = permissions.map(operation => ({user: share.user, entity: share.entity, operation}));
                await tx(entityType.permissionsTable).insert(data);
            }
        }
    });
}

module.exports = {
    listDTAjax,
    listUnassignedUsersDTAjax,
    assign,
    rebuildPermissions
};