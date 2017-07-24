'use strict';

const knex = require('../lib/knex');
const config = require('config');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

const entityTypes = {
    namespace: {
        entitiesTable: 'namespaces',
        sharesTable: 'shares_namespace',
        permissionsTable: 'permissions_namespace'
    },
    report: {
        entitiesTable: 'reports',
        sharesTable: 'shares_report',
        permissionsTable: 'permissions_report'
    },
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
    return await dtHelpers.ajaxList(params, tx => tx(entityType.sharesTable).innerJoin('users', entityType.sharesTable + '.user', 'users.id').where(`${entityType.sharesTable}.entity`, entityId), [entityType.sharesTable + '.id', 'users.username', 'users.name', entityType.sharesTable + '.role', 'users.id']);
}

async function listUnassignedUsersDTAjax(entityTypeId, entityId, params) {
    const entityType = getEntityType(entityTypeId);
    return await dtHelpers.ajaxList(
        params,
        tx => tx('users').whereNotExists(function() { return this.select('*').from(entityType.sharesTable).whereRaw(`users.id = ${entityType.sharesTable}.user`).andWhere(`${entityType.sharesTable}.entity`, entityId); }),
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
        if (entityTypeId === 'namespace') {
            await rebuildPermissions(tx, {userId});
        } else if (role) {
            await rebuildPermissions(tx, { entityTypeId, entityId, userId });
        }
    });
}

async function rebuildPermissions(tx, restriction) {
    restriction = restriction || {};

    let restrictedEntityTypes;
    if (restriction.entityTypeId) {
        restrictedEntityTypes = {
            [restriction.entityTypeId]: entityTypes[restriction.entityTypeId]
        };
    } else {
        restrictedEntityTypes = entityTypes;
    }


    const namespaces = await tx('namespaces').select(['id', 'namespace']);

    // nsMap is a map of namespaces - each of the following shape:
    // .id - id of the namespace
    // .namespace - id of the parent or null if no parent
    // .userPermissions - Map userId -> [entityTypeId] -> array of permissions
    // .transitiveUserPermissions - the same as above, but taking into account transitive permission obtained from namespace parents
    const nsMap = new Map();
    for (const namespace of namespaces) {
        namespace.userPermissions = new Map();
        nsMap.set(namespace.id, namespace);
    }

    // This populates .userPermissions
    const nsSharesQuery = tx(entityTypes.namespace.sharesTable).select(['entity', 'user', 'role']);
    if (restriction.userId) {
        nsSharesQuery.andWhere('user', restriction.userId);
    }

    const nsShares = await nsSharesQuery;
    for (const nsShare of nsShares) {
        const ns = nsMap.get(nsShare.entity);

        const userPerms = {};
        ns.userPermissions.set(nsShare.user, userPerms);

        for (const entityTypeId in restrictedEntityTypes) {
            if (config.roles.namespace[nsShare.role] &&
                config.roles.namespace[nsShare.role].childperms &&
                config.roles.namespace[nsShare.role].childperms[entityTypeId]) {

                userPerms[entityTypeId] = new Set(config.roles.namespace[nsShare.role].childperms[entityTypeId]);

            } else {
                userPerms[entityTypeId] = new Set();
            }
        }
    }

    // This computes .transitiveUserPermissions
    for (const ns of nsMap.values()) {
        ns.transitiveUserPermissions = new Map();

        for (const userPermsPair of ns.userPermissions) {
            const userPerms = {};
            ns.transitiveUserPermissions.set(userPermsPair[0], userPerms);

            for (const entityTypeId in restrictedEntityTypes) {
                userPerms[entityTypeId] = new Set(userPermsPair[1][entityTypeId]);
            }
        }

        let parentId = ns.namespace;
        while (parentId) {
            const parent = nsMap.get(parentId);

            for (const userPermsPair of parent.userPermissions) {
                const user = userPermsPair[0];

                if (ns.transitiveUserPermissions.has(user)) {
                    const userPerms = ns.transitiveUserPermissions.get(user);

                    for (const entityTypeId in restrictedEntityTypes) {
                        for (const perm of userPermsPair[1][entityTypeId]) {
                            userPerms[entityTypeId].add(perm);
                        }
                    }
                } else {
                    const userPerms = {}
                    ns.transitiveUserPermissions.set(user, userPerms);

                    for (const entityTypeId in restrictedEntityTypes) {
                        userPerms[entityTypeId] = new Set(userPermsPair[1][entityTypeId]);
                    }
                }
            }

            parentId = parent.namespace;
        }
    }


    // This reads direct shares from DB, joins it with the permissions from namespaces and stores the permissions into DB
    for (const entityTypeId in restrictedEntityTypes) {
        const entityType = restrictedEntityTypes[entityTypeId];

        const expungeQuery = tx(entityType.permissionsTable).del();
        if (restriction.entityId) {
            expungeQuery.andWhere('entity', restriction.entityId);
        }
        if (restriction.userId) {
            expungeQuery.andWhere('user', restriction.userId);
        }
        await expungeQuery;

        const entitiesQuery = tx(entityType.entitiesTable).select(['id', 'namespace']);
        if (restriction.entityId) {
            entitiesQuery.andWhere('id', restriction.entityId);
        }
        const entities = await entitiesQuery;

        for (const entity of entities) {
            const permsPerUser = new Map();

            if (entity.namespace) { // The root namespace has not parent namespace, thus the test
                const transitiveUserPermissions = nsMap.get(entity.namespace).transitiveUserPermissions;
                for (const transitivePermsPair of transitiveUserPermissions.entries()) {
                    permsPerUser.set(transitivePermsPair[0], [...transitivePermsPair[1][entityTypeId]]);
                }
            }

            const directSharesQuery = tx(entityType.sharesTable).select(['user', 'role']).where('entity', entity.id);
            if (restriction.userId) {
                directSharesQuery.andWhere('user', restriction.userId);
            }
            const directShares = await directSharesQuery;

            for (const share of directShares) {
                let userPerms;
                if (permsPerUser.has(share.user)) {
                    userPerms = permsPerUser.get(share.user);
                } else {
                    userPerms = new Set();
                    permsPerUser.set(share.user, userPerms);
                }

                if (config.roles[entityTypeId][share.role] &&
                    config.roles[entityTypeId][share.role].permissions) {

                    for (const perm of config.roles[entityTypeId][share.role].permissions) {
                        userPerms.add(perm);
                    }
                }
            }

            for (const userPermsPair of permsPerUser.entries()) {
                const data = [];

                for (const operation of userPermsPair[1]) {
                    data.push({user: userPermsPair[0], entity: entity.id, operation});
                }

                if (data.length > 0) {
                    await tx(entityType.permissionsTable).insert(data);
                }
            }
        }
    }
}

module.exports = {
    listDTAjax,
    listUnassignedUsersDTAjax,
    assign,
    rebuildPermissions
};