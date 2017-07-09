'use strict';

const config = require('config');

class ListPermission {
    constructor(name) {
        this.name = name;
        this.entityType = 'list';
    }
}

class NamespacePermission {
    constructor(name) {
        this.name = name;
        this.entityType = 'namespace';
    }
}

const ListPermissions = {
    View: new ListPermissions('view')
};

const NamespacePermissions = {
    View: new NamespacePermission('view'),
    Edit: new NamespacePermission('edit'),
    Create: new NamespacePermission('create'),
    Delete: new NamespacePermission('delete'),
    CreateList: new NamespacePermission('create list')
};

async function can(context, operation, entityId) {
    if (!context.user) {
        return false;
    }

    const result = await knex('permissions_' + operation.entityType).select(['id']).where({
        entity: entityId,
        user: context.user.id,
        operation: operation.name
    }).first();

    return !!result;
}

async function buildPermissions() {

}

can(ctx, ListPermissions.View, 3)
can(ctx, NamespacePermissions.CreateList, 2)
