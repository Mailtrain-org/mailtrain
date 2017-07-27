'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const permissions = require('../lib/permissions');

const allowedKeys = new Set(['name', 'description', 'namespace']);

async function listTree(context) {
    // FIXME - process permissions

    const entityType = permissions.getEntityType('namespace');

    // This builds a forest of namespaces that contains only those namespace that the user has access to
    // This goes in three steps: 1) tree with all namespaces is built with parent-children links, 2) the namespaces that are not accessible
    // by the user are pruned out, which potentially transforms the tree to a forest, 3) unneeded attributes (i.e. parent links)
    // are removed and children are turned to an array are sorted alphabetically by name

    // Build a tree
    const rows = await knex('namespaces')
        .innerJoin(entityType.permissionsTable, {
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
        entry.permissions = row.permissions.split(';');
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
    await shares.enforceEntityPermission(context, 'namespace', id, 'view');

    const entity = await knex('namespaces').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

async function create(context, entity) {
    enforce(entity.namespace, 'Parent namespace must be set');
    await shares.enforceEntityPermission(context, 'namespace', entity.namespace, 'createNamespace');

    let id;
    await knex.transaction(async tx => {
        if (!await tx('namespaces').select(['id']).where('id', entity.namespace).first()) {
            throw new interoperableErrors.DependencyNotFoundError();
        }

        const ids = await tx('namespaces').insert(filterObject(entity, allowedKeys));
        id = ids[0];

        // We don't have to rebuild all entity types, because no entity can be a child of the namespace at this moment.
        await shares.rebuildPermissions(tx, { entityTypeId: 'namespace', entityId: id });
    });

    return id;
}

async function updateWithConsistencyCheck(context, entity) {
    enforce(entity.id !== 1 || entity.namespace === null, 'Cannot assign a parent to the root namespace.');
    await shares.enforceEntityPermission(context, 'namespace', entity.id, 'edit');

    await knex.transaction(async tx => {
        const existing = await tx('namespaces').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingHash = hash(existing);
        if (existingHash != entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        let iter = entity;
        while (iter.namespace != null) {
            iter = await tx('namespaces').where('id', iter.namespace).first();

            if (!iter) {
                throw new interoperableErrors.DependencyNotFoundError();
            }

            if (iter.id == entity.id) {
                throw new interoperableErrors.LoopDetectedError();
            }
        }

        await tx('namespaces').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissions(tx);
    });
}

async function remove(context, id) {
    enforce(id !== 1, 'Cannot delete the root namespace.');
    await shares.enforceEntityPermission(context, 'namespace', id, 'delete');

    await knex.transaction(async tx => {
        const childNs = await tx('namespaces').where('namespace', id).first();
        if (childNs) {
            throw new interoperableErrors.ChildDetectedError();
        }

        await tx('namespaces').where('id', id).del();
    });
}

module.exports = {
    hash,
    listTree,
    getById,
    create,
    updateWithConsistencyCheck,
    remove
};