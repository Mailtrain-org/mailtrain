'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const entitySettings = require('../lib/entity-settings');
const namespaceHelpers = require('../lib/namespace-helpers');
const dependencyHelpers = require('../lib/dependency-helpers');


const allowedKeys = new Set(['name', 'description', 'namespace']);

async function listTree(context) {
    // FIXME - process permissions

    const entityType = entitySettings.getEntityType('namespace');

    // This builds a forest of namespaces that contains only those namespace that the user has access to
    // This goes in three steps: 1) tree with all namespaces is built with parent-children links, 2) the namespaces that are not accessible
    // by the user are pruned out, which potentially transforms the tree to a forest, 3) unneeded attributes (i.e. parent links)
    // are removed and children are turned to an array are sorted alphabetically by name

    // Build a tree
    const rows = await knex('namespaces')
        .leftJoin(entityType.permissionsTable, {
            [entityType.permissionsTable + '.entity']: 'namespaces.id',
            [entityType.permissionsTable + '.user']: context.user.id
        })
        .groupBy('namespaces.id')
        .select([
            'namespaces.id', 'namespaces.name', 'namespaces.description', 'namespaces.namespace',
            knex.raw(`GROUP_CONCAT(${entityType.permissionsTable + '.operation'} SEPARATOR \';\') as permissions`)
        ]);

    const entries = {};

    for (let row of rows) {
        let entry;
        if (!entries[row.id]) {
            entry = {
                children: {}
            };
            entries[row.id] = entry;
        } else {
            entry = entries[row.id];
        }

        if (row.namespace) {
            if (!entries[row.namespace]) {
                entries[row.namespace] = {
                    children: {}
                };
            }

            entries[row.namespace].children[row.id] = entry;
            entry.parent = entries[row.namespace];
        } else {
            entry.parent = null;
        }

        entry.key = row.id;
        entry.title = row.name;
        entry.description = row.description;
        entry.permissions = row.permissions ? row.permissions.split(';') : [];
    }

    // Prune out the inaccessible namespaces
    for (const entryId in entries) {
        const entry = entries[entryId];

        if (!entry.permissions.includes('view')) {
            for (const childId in entry.children) {
                const child = entry.children[childId];
                child.parent = entry.parent;

                if (entry.parent) {
                    entry.parent.children[childId] = child;
                }
            }

            if (entry.parent) {
                delete entry.parent.children[entryId];
            }

            delete entries[entryId];
        }
    }

    // Retrieve the roots before we discard the parent link
    const roots = Object.values(entries).filter(x => x.parent === null);

    // Remove parent link, transform children to an array and sort it
    for (const entryId in entries) {
        const entry = entries[entryId];

        entry.children = Object.values(entry.children);
        entry.children.sort((x, y) => x.title.localeCompare(y.title));

        delete entry.parent;
    }

    return roots;
}

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getById(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', id, 'view');
        const entity = await tx('namespaces').where('id', id).first();
        entity.permissions = await shares.getPermissionsTx(tx, context, 'namespace', id);
        return entity;
    });
}

async function create(context, entity) {
    enforce(entity.namespace, 'Parent namespace must be set');

    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createNamespace');

        const ids = await tx('namespaces').insert(filterObject(entity, allowedKeys));
        const id = ids[0];

        // We don't have to rebuild all entity types, because no entity can be a child of the namespace at this moment.
        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'namespace', entityId: id });

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    enforce(entity.id !== 1 || entity.namespace === null, 'Cannot assign a parent to the root namespace.');

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.id, 'edit');

        const existing = await tx('namespaces').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        // namespaceHelpers.validateEntity is not needed here because it is part of the tree traversal check below
        await namespaceHelpers.validateMove(context, entity, existing, 'namespace', 'createNamespace', 'delete');

        let iter = entity;
        while (iter.namespace != null) {
            iter = await tx('namespaces').where('id', iter.namespace).first();

            if (!iter) {
                throw new interoperableErrors.DependencyNotFoundError();
            }

            if (iter.id === entity.id) {
                throw new interoperableErrors.LoopDetectedError();
            }
        }

        await tx('namespaces').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissionsTx(tx);
    });
}

async function remove(context, id) {
    enforce(id !== 1, 'Cannot delete the root namespace.');

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', id, 'delete');

        const entityTypesWithNamespace = Object.keys(entitySettings.getEntityTypes());
        await dependencyHelpers.ensureNoDependencies(tx, context, id, entityTypesWithNamespace.map(entityTypeId => ({ entityTypeId: entityTypeId, column: 'namespace' })));

        await tx('namespaces').where('id', id).del();
    });
}

module.exports.hash = hash;
module.exports.listTree = listTree;
module.exports.getById = getById;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
