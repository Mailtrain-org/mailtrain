'use strict';

const knex = require('../lib/knex');
const config = require('config');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const permissions = require('../lib/permissions');
const interoperableErrors = require('../shared/interoperable-errors');
const log = require('npmlog');
const {getGlobalNamespaceId} = require('../shared/namespaces');

// TODO: This would really benefit from some permission cache connected to rebuildPermissions
// A bit of the problem is that the cache would have to expunged as the result of other processes modifying entites/permissions


async function listByEntityDTAjax(context, entityTypeId, entityId, params) {
    return await knex.transaction(async (tx) => {
        const entityType = permissions.getEntityType(entityTypeId);
        await enforceEntityPermissionTx(tx, context, entityTypeId, entityId, 'share');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from(entityType.sharesTable)
                .innerJoin('users', entityType.sharesTable + '.user', 'users.id')
                .innerJoin('generated_role_names', 'generated_role_names.role', 'users.role')
                .where('generated_role_names.entity_type', entityTypeId)
                .where(`${entityType.sharesTable}.entity`, entityId),
            ['users.username', 'users.name', 'generated_role_names.name', 'users.id', entityType.sharesTable + '.auto']
        );
    });
}

async function listByUserDTAjax(context, entityTypeId, userId, params) {
    return await knex.transaction(async (tx) => {
        const user = await tx('users').where('id', userId).first();
        if (!user) {
            shares.throwPermissionDenied();
        }

        await enforceEntityPermissionTx(tx, context, 'namespace', user.namespace, 'manageUsers');

        const entityType = permissions.getEntityType(entityTypeId);

        return await dtHelpers.ajaxListWithPermissionsTx(
            tx,
            context,
            [{entityTypeId}],
            params,
            builder => builder
                .from(entityType.sharesTable)
                .innerJoin(entityType.entitiesTable, entityType.sharesTable + '.entity', entityType.entitiesTable + '.id')
                .innerJoin('generated_role_names', 'generated_role_names.role', entityType.sharesTable + '.role')
                .where('generated_role_names.entity_type', entityTypeId)
                .where(entityType.sharesTable + '.user', userId),
            [entityType.entitiesTable + '.name', 'generated_role_names.name', entityType.entitiesTable + '.id', entityType.sharesTable + '.auto']
        );
    });
}

async function listUnassignedUsersDTAjax(context, entityTypeId, entityId, params) {
    return await knex.transaction(async (tx) => {
        const entityType = permissions.getEntityType(entityTypeId);

        await enforceEntityPermissionTx(tx, context, entityTypeId, entityId, 'share');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('users')
                .whereNotExists(function () {
                    return this
                        .select('*')
                        .from(entityType.sharesTable)
                        .whereRaw(`users.id = ${entityType.sharesTable}.user`)
                        .andWhere(`${entityType.sharesTable}.entity`, entityId);
                }),
            ['users.id', 'users.username', 'users.name']
        );
    });
}

async function listRolesDTAjax(entityTypeId, params) {
    return await dtHelpers.ajaxList(
        params,
        builder => builder
            .from('generated_role_names')
            .where({entity_type: entityTypeId}),
        ['role', 'name', 'description']
    );
}

async function assign(context, entityTypeId, entityId, userId, role) {
    const entityType = permissions.getEntityType(entityTypeId);

    await knex.transaction(async tx => {
        await enforceEntityPermissionTx(tx, context, entityTypeId, entityId, 'share');

        enforce(await tx('users').where('id', userId).select('id').first(), 'Invalid user id');
        enforce(await tx(entityType.entitiesTable).where('id', entityId).select('id').first(), 'Invalid entity id');

        const entry = await tx(entityType.sharesTable).where({user: userId, entity: entityId}).select('role').first();

        if (entry) {
            if (!role) {
                await tx(entityType.sharesTable).where({user: userId, entity: entityId}).del();
            } else if (entry.role !== role) {
                await tx(entityType.sharesTable).where({user: userId, entity: entityId}).update('role', role);
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
            await rebuildPermissionsTx(tx, {userId});
        } else if (role) {
            await rebuildPermissionsTx(tx, { entityTypeId, entityId, userId });
        }
    });
}

async function rebuildPermissionsTx(tx, restriction) {
    restriction = restriction || {};

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


    // To prevent users locking out themselves, we consider user with id 1 to be the admin and always assign it
    // the admin role. The admin role is a global role that has admin===true
    // If this behavior is not desired, it is enough to delete the user with id 1.
    const adminUser = await tx('users').where('id', 1 /* Admin user id */).first();
    if (adminUser) {
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
    }


    // Reset root and own namespace shares as per the user roles
    const usersWithRoleInOwnNamespaceQuery = tx('users')
        .leftJoin(namespaceEntityType.sharesTable, {
            'users.id': `${namespaceEntityType.sharesTable}.user`,
            'users.namespace': `${namespaceEntityType.sharesTable}.entity`
        })
        .select(['users.id', 'users.namespace', 'users.role as userRole', `${namespaceEntityType.sharesTable}.role`]);
    if (restriction.userId) {
        usersWithRoleInOwnNamespaceQuery.where('users.id', restriction.userId);
    }
    const usersWithRoleInOwnNamespace = await usersWithRoleInOwnNamespaceQuery;

    for (const user of usersWithRoleInOwnNamespace) {
        const roleConf = config.roles.global[user.userRole];

        if (roleConf) {
            const desiredRole = roleConf.ownNamespaceRole;
            if (desiredRole && user.role !== desiredRole) {
                await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: user.namespace }).del();
                await tx(namespaceEntityType.sharesTable).insert({ user: user.id, entity: user.namespace, role: desiredRole, auto: true });
            }
        }
    }


    const usersWithRoleInRootNamespaceQuery = tx('users')
        .leftJoin(namespaceEntityType.sharesTable, {
            'users.id': `${namespaceEntityType.sharesTable}.user`,
            [`${namespaceEntityType.sharesTable}.entity`]: getGlobalNamespaceId()
        })
        .select(['users.id', 'users.role as userRole', `${namespaceEntityType.sharesTable}.role`]);
    if (restriction.userId) {
        usersWithRoleInRootNamespaceQuery.andWhere('users.id', restriction.userId);
    }
    const usersWithRoleInRootNamespace = await usersWithRoleInRootNamespaceQuery;

    for (const user of usersWithRoleInRootNamespace) {
        const roleConf = config.roles.global[user.userRole];

        if (roleConf) {
            const desiredRole = roleConf.rootNamespaceRole;
            if (desiredRole && user.role !== desiredRole) {
                await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: getGlobalNamespaceId() }).del();
                await tx(namespaceEntityType.sharesTable).insert({ user: user.id, entity: getGlobalNamespaceId(), role: desiredRole, auto: 1 });
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
                    const userPerms = {};
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

async function rebuildPermissions(restriction) {
    await knex.transaction(async tx => {
        await rebuildPermissionsTx(tx, restriction);
    });
}

async function regenerateRoleNamesTable() {
    await knex.transaction(async tx => {
        await tx('generated_role_names').del();

        const entityTypeIds = ['global', ...Object.keys(permissions.getEntityTypes())];

        for (const entityTypeId of entityTypeIds) {
            const roles = config.roles[entityTypeId];

            for (const role in roles) {
                await tx('generated_role_names').insert({
                    entity_type: entityTypeId,
                    role,
                    name: roles[role].name,
                    description: roles[role].description,
                });
            }
        }
    });
}


function throwPermissionDenied() {
    throw new interoperableErrors.PermissionDeniedError('Permission denied');
}

async function removeDefaultShares(tx, user) {
    const namespaceEntityType = permissions.getEntityType('namespace');

    const roleConf = config.roles.global[user.role];

    if (roleConf) {
        const desiredRole = roleConf.rootNamespaceRole;

        if (roleConf.ownNamespaceRole) {
            await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: user.namespace }).del();
        }

        if (roleConf.rootNamespaceRole) {
            await tx(namespaceEntityType.sharesTable).where({ user: user.id, entity: getGlobalNamespaceId() }).del();
        }
    }
}

function checkGlobalPermission(context, requiredOperations) {
    if (!context.user) {
        return false;
    }

    if (typeof requiredOperations === 'string') {
        requiredOperations = [ requiredOperations ];
    }

    if (context.user.restrictedAccessHandler) {
        log.verbose('check global permissions with restrictedAccessHandler --  requiredOperations: ' + requiredOperations);
        const allowedPerms = context.user.restrictedAccessHandler.globalPermissions;
        if (allowedPerms) {
            requiredOperations = requiredOperations.filter(perm => allowedPerms.has(perm));
        }
    }

    if (requiredOperations.length === 0) {
        return false;
    }

    if (context.user.admin) { // This handles the getAdminContext() case
        return true;
    }

    const roleSpec = config.roles.global[context.user.role];
    let success = false;
    if (roleSpec) {
        for (const requiredOperation of requiredOperations) {
            if (roleSpec.permissions.includes(requiredOperation)) {
                success = true;
                break;
            }
        }
    }

    return success;
}

function enforceGlobalPermission(context, requiredOperations) {
    if (!checkGlobalPermission(context, requiredOperations)) {
        throwPermissionDenied();
    }
}

async function _checkPermissionTx(tx, context, entityTypeId, entityId, requiredOperations) {
    if (!context.user) {
        return false;
    }

    const entityType = permissions.getEntityType(entityTypeId);

    if (typeof requiredOperations === 'string') {
        requiredOperations = [ requiredOperations ];
    }

    if (context.user.restrictedAccessHandler) {
        log.verbose('check permissions with restrictedAccessHandler --  entityTypeId: ' + entityTypeId + '  entityId: ' + entityId + '  requiredOperations: ' + requiredOperations);
        if (context.user.restrictedAccessHandler.permissions && context.user.restrictedAccessHandler.permissions[entityTypeId]) {
            const allowedPerms = context.user.restrictedAccessHandler.permissions[entityTypeId][entityId];
            if (allowedPerms) {
                requiredOperations = requiredOperations.filter(perm => allowedPerms.has(perm));
            }
        }
    }

    if (requiredOperations.length === 0) {
        return false;
    }

    if (context.user.admin) { // This handles the getAdminContext() case. In this case we don't check the permission, but just the existence.
        const existsQuery = tx(entityType.entitiesTable);

        if (entityId) {
            existsQuery.where('id', entityId);
        }

        const exists = await existsQuery.first();

        return !!exists;

    } else {
        const permsQuery = tx(entityType.permissionsTable)
            .where('user', context.user.id)
            .whereIn('operation', requiredOperations);

        if (entityId) {
            permsQuery.andWhere('entity', entityId);
        }

        const perms = await permsQuery.first();

        return !!perms;
    }
}

async function checkEntityPermission(context, entityTypeId, entityId, requiredOperations) {
    if (!entityId) {
        return false;
    }

    return await knex.transaction(async tx => {
        return await _checkPermissionTx(tx, context, entityTypeId, entityId, requiredOperations);
    });
}

async function checkTypePermission(context, entityTypeId, requiredOperations) {
    return await knex.transaction(async tx => {
        return await _checkPermissionTx(tx, context, entityTypeId, null, requiredOperations);
    });
}

async function enforceEntityPermission(context, entityTypeId, entityId, requiredOperations) {
    if (!entityId) {
        throwPermissionDenied();
    }
    await knex.transaction(async tx => {
        const result = await _checkPermissionTx(tx, context, entityTypeId, entityId, requiredOperations);
        if (!result) {
            log.info(`Denying permission ${entityTypeId}.${entityId} ${requiredOperations}`);
            throwPermissionDenied();
        }
    });
}

async function enforceEntityPermissionTx(tx, context, entityTypeId, entityId, requiredOperations) {
    if (!entityId) {
        throwPermissionDenied();
    }
    const result = await _checkPermissionTx(tx, context, entityTypeId, entityId, requiredOperations);
    if (!result) {
        log.info(`Denying permission ${entityTypeId}.${entityId} ${requiredOperations}`);
        throwPermissionDenied();
    }
}

async function enforceTypePermission(context, entityTypeId, requiredOperations) {
    await knex.transaction(async tx => {
        const result = await _checkPermissionTx(tx, context, entityTypeId, null, requiredOperations);
        if (!result) {
            log.info(`Denying permission ${entityTypeId} ${requiredOperations}`);
            throwPermissionDenied();
        }
    });
}

async function enforceTypePermissionTx(tx, context, entityTypeId, requiredOperations) {
    const result = await _checkPermissionTx(tx, context, entityTypeId, null, requiredOperations);
    if (!result) {
        log.info(`Denying permission ${entityTypeId} ${requiredOperations}`);
        throwPermissionDenied();
    }
}

function getGlobalPermissions(context) {
    if (!context.user) {
        return [];
    }

    enforce(!context.user.admin, 'getPermissions is not supposed to be called by assumed admin');

    return (config.roles.global[context.user.role] || {}).permissions || [];
}

async function getPermissionsTx(tx, context, entityTypeId, entityId) {
    if (!context.user) {
        return [];
    }

    enforce(!context.user.admin, 'getPermissions is not supposed to be called by assumed admin');

    const entityType = permissions.getEntityType(entityTypeId);

    const rows = await tx(entityType.permissionsTable)
        .select('operation')
        .where('entity', entityId)
        .where('user', context.user.id);

    return rows.map(x => x.operation);
}

module.exports = {
    listByEntityDTAjax,
    listByUserDTAjax,
    listUnassignedUsersDTAjax,
    listRolesDTAjax,
    assign,
    rebuildPermissionsTx,
    rebuildPermissions,
    removeDefaultShares,
    enforceEntityPermission,
    enforceEntityPermissionTx,
    enforceTypePermission,
    enforceTypePermissionTx,
    checkEntityPermission,
    checkTypePermission,
    enforceGlobalPermission,
    checkGlobalPermission,
    throwPermissionDenied,
    regenerateRoleNamesTable,
    getGlobalPermissions,
    getPermissionsTx
};