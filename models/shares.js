'use strict';

let _ = require('../lib/translate')._;
const knex = require('../lib/knex');
const config = require('config');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const permissions = require('../lib/permissions');
const interoperableErrors = require('../shared/interoperable-errors');


async function listDTAjax(context, entityTypeId, entityId, params) {
    const entityType = permissions.getEntityType(entityTypeId);

    await enforceEntityPermission(context, entityTypeId, entityId, 'share');

    return await dtHelpers.ajaxList(params, builder => builder.from(entityType.sharesTable).innerJoin('users', entityType.sharesTable + '.user', 'users.id').where(`${entityType.sharesTable}.entity`, entityId), [entityType.sharesTable + '.id', 'users.username', 'users.name', entityType.sharesTable + '.role', 'users.id']);
}

async function listUnassignedUsersDTAjax(context, entityTypeId, entityId, params) {
    const entityType = permissions.getEntityType(entityTypeId);

    await enforceEntityPermission(context, entityTypeId, entityId, 'share');

    return await dtHelpers.ajaxList(
        params,
        builder => builder.from('users').whereNotExists(function() { return this.select('*').from(entityType.sharesTable).whereRaw(`users.id = ${entityType.sharesTable}.user`).andWhere(`${entityType.sharesTable}.entity`, entityId); }),
        ['users.id', 'users.username', 'users.name']);
}


async function assign(context, entityTypeId, entityId, userId, role) {
    const entityType = permissions.getEntityType(entityTypeId);

    await enforceEntityPermission(context, entityTypeId, entityId, 'share');

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

async function _rebuildPermissions(tx, restriction) {
    const namespaceEntityType = permissions.getEntityType('namespace');

    // Collect entity types we care about
    let restrictedEntityTypes;
    if (restriction.entityTypeId) {
        const entityType = permissions.getEntityType(restriction.entityTypeId);
        restrictedEntityTypes = {
            [restriction.entityTypeId]: entityType
        };
    } else {
        restrictedEntityTypes = permissions.getEntityTypes();
    }


    // Change user 1 role to global role that has admin===true
    let adminRole;
    for (const role in config.roles.global) {
        if (config.roles.global[role].admin) {
            adminRole = role;
            break;
        }
    }

    if (adminRole) {
        await tx('users').update('role', adminRole).where('id', 1 /* Admin user id */);
    }


    // Reset root and own namespace shares as per the user roles
    const usersWithRoleInOwnNamespaceQuery = tx('users')
        .leftJoin(namespaceEntityType.sharesTable, {
            'users.id': `${namespaceEntityType.sharesTable}.user`,
            'users.namespace': `${namespaceEntityType.sharesTable}.entity`
        })
        .select(['users.id', 'users.namespace', 'users.role as userRole', `${namespaceEntityType.sharesTable}.role`]);
    if (restriction.userId) {
        usersWithRoleInOwnNamespaceQuery.where('user', restriction.userId);
    }
    const usersWithRoleInOwnNamespace = await usersWithRoleInOwnNamespaceQuery;

    for (const user of usersWithRoleInOwnNamespace) {
        const roleConf = config.roles.global[user.userRole];

        if (roleConf) {
            const desiredRole = roleConf.ownNamespaceRole;
            if (desiredRole && user.role !== desiredRole) {
                await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: user.namespace }).del();
                await tx(namespaceEntityType.sharesTable).insert({ user: user.id, entity: user.namespace, role: desiredRole });
            }
        }
    }


    const usersWithRoleInRootNamespaceQuery = tx('users')
        .leftJoin(namespaceEntityType.sharesTable, 'users.id', `${namespaceEntityType.sharesTable}.user`)
        .where(`${namespaceEntityType.sharesTable}.entity`, 1 /* Global namespace id */)
        .select(['users.id', 'users.role as userRole', `${namespaceEntityType.sharesTable}.role`]);
    if (restriction.userId) {
        usersWithRoleInRootNamespaceQuery.andWhere('user', restriction.userId);
    }
    const usersWithRoleInRootNamespace = await usersWithRoleInRootNamespaceQuery;

    for (const user of usersWithRoleInRootNamespace) {
        const roleConf = config.roles.global[user.userRole];

        if (roleConf) {
            const desiredRole = roleConf.rootNamespaceRole;
            if (desiredRole && user.role !== desiredRole) {
                await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: 1 /* Global namespace id */ }).del();
                await tx(namespaceEntityType.sharesTable).insert({ user: user.id, entity: 1 /* Global namespace id */, role: desiredRole });
            }
        }
    }



    // Build the map of all namespaces
    // nsMap is a map of namespaces - each of the following shape:
    // .id - id of the namespace
    // .namespace - id of the parent or null if no parent
    // .userPermissions - Map userId -> [entityTypeId] -> array of permissions
    // .transitiveUserPermissions - the same as above, but taking into account transitive permission obtained from namespace parents

    const namespaces = await tx('namespaces').select(['id', 'namespace']);

    const nsMap = new Map();
    for (const namespace of namespaces) {
        namespace.userPermissions = new Map();
        nsMap.set(namespace.id, namespace);
    }

    // This populates .userPermissions
    const nsSharesQuery = tx(namespaceEntityType.sharesTable).select(['entity', 'user', 'role']);
    if (restriction.userId) {
        nsSharesQuery.where('user', restriction.userId);
    }

    const nsShares = await nsSharesQuery;
    for (const nsShare of nsShares) {
        const ns = nsMap.get(nsShare.entity);

        const userPerms = {};
        ns.userPermissions.set(nsShare.user, userPerms);

        for (const entityTypeId in restrictedEntityTypes) {
            if (config.roles.namespace[nsShare.role] &&
                config.roles.namespace[nsShare.role].children &&
                config.roles.namespace[nsShare.role].children[entityTypeId]) {

                userPerms[entityTypeId] = new Set(config.roles.namespace[nsShare.role].children[entityTypeId]);

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


    // This reads direct shares from DB, joins each with the permissions from namespaces and stores the permissions into DB
    for (const entityTypeId in restrictedEntityTypes) {
        const entityType = restrictedEntityTypes[entityTypeId];

        const expungeQuery = tx(entityType.permissionsTable).del();
        if (restriction.entityId) {
            expungeQuery.where('entity', restriction.entityId);
        }
        if (restriction.userId) {
            expungeQuery.where('user', restriction.userId);
        }
        await expungeQuery;

        const entitiesQuery = tx(entityType.entitiesTable).select(['id', 'namespace']);
        if (restriction.entityId) {
            entitiesQuery.where('id', restriction.entityId);
        }
        const entities = await entitiesQuery;

        for (const entity of entities) {
            const permsPerUser = new Map();

            if (entity.namespace) { // The root namespace has not parent namespace, thus the test
                const transitiveUserPermissions = nsMap.get(entity.namespace).transitiveUserPermissions;
                for (const transitivePermsPair of transitiveUserPermissions.entries()) {
                    permsPerUser.set(transitivePermsPair[0], new Set(transitivePermsPair[1][entityTypeId]));
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


async function rebuildPermissions(tx, restriction) {
    restriction = restriction || {};

    if (tx) {
        await _rebuildPermissions(tx, restriction);
    } else {
        await knex.transaction(async tx => {
            await _rebuildPermissions(tx, restriction);
        });
    }
}

function throwPermissionDenied() {
    throw new interoperableErrors.PermissionDeniedError(_('Permission denied'));
}

function enforceGlobalPermission(context, requiredOperations) {
    if (typeof requiredOperations === 'string') {
        requiredOperations = [ requiredOperations ];
    }

    const roleSpec = config.roles.global[context.user.role];
    if (roleSpec) {
        for (const requiredOperation of requiredOperations) {
            if (roleSpec.permissions.includes(requiredOperation)) {
                return;
            }
        }
    }

    throwPermissionDenied();
}

async function _checkPermission(context, entityTypeId, entityId, requiredOperations) {
    const entityType = permissions.getEntityType(entityTypeId);

    if (typeof requiredOperations === 'string') {
        requiredOperations = [ requiredOperations ];
    }

    const permsQuery = await knex(entityType.permissionsTable)
        .where('user', context.user.id)
        .whereIn('operation', requiredOperations);

    if (entityId) {
        permsQuery.andWhere('entity', entityId);
    }

    const perms = await permsQuery.first();

    return !!perms;
}

async function checkEntityPermission(context, entityTypeId, entityId, requiredOperations) {
    if (!entityId) {
        return false;
    }

    return await _checkEntityPermission(context, entityTypeId, entityId, requiredOperations);
}

async function checkTypePermission(context, entityTypeId, requiredOperations) {
    return await _checkEntityPermission(context, entityTypeId, null, requiredOperations);
}

async function enforceEntityPermission(context, entityTypeId, entityId, requiredOperations) {
    const perms = await checkEntityPermission(context, entityTypeId, entityId, requiredOperations);
    if (!perms) {
        throwPermissionDenied();
    }
}

async function enforceTypePermission(context, entityTypeId, requiredOperations) {
    const perms = await checkTypePermission(context, entityTypeId, requiredOperations);
    if (!perms) {
        throwPermissionDenied();
    }
}


module.exports = {
    listDTAjax,
    listUnassignedUsersDTAjax,
    assign,
    rebuildPermissions,
    enforceEntityPermission,
    enforceTypePermission,
    checkEntityPermission,
    checkTypePermission,
    enforceGlobalPermission,
    throwPermissionDenied
};