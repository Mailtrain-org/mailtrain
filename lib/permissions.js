'use strict';

const config = require('config');


// FIXME - redo or delete

/*
 class ReportTemplatePermission {
 constructor(name) {
 this.name = name;
 this.entityType = 'report-template';
 }
 }

 const ReportTemplatePermissions = {
 View: new ReportTemplatePermission('view'),
 Edit: new ReportTemplatePermission('edit'),
 Delete: new ReportTemplatePermission('delete')
 };


 class ListPermission {
    constructor(name) {
        this.name = name;
        this.entityType = 'list';
    }
}

const ListPermissions = {
    View: new ListPermissions('view')
};

class NamespacePermission {
    constructor(name) {
        this.name = name;
        this.entityType = 'namespace';
    }
}

const NamespacePermissions = {
    View: new NamespacePermission('view'),
    Edit: new NamespacePermission('edit'),
    Create: new NamespacePermission('create'),
    Delete: new NamespacePermission('delete'),
    CreateList: new NamespacePermission('create list')
};
*/

/*
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
can(ctx, ReportTemplatePermissions.ViewReport, 5)
*/

module.exports = {
}