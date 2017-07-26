'use strict';

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

function getEntityTypes() {
    return entityTypes;
}

function getEntityType(entityTypeId) {
    const entityType = entityTypes[entityTypeId];

    if (!entityType) {
        throw new Error(`Unknown entity type ${entityTypeId}`);
    }

    return entityType
}

module.exports = {
    getEntityTypes,
    getEntityType
}