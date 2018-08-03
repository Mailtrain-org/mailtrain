'use strict';

const ReplacementBehavior = {
    NONE: 1,
    REPLACE: 2,
    RENAME: 3
};

const entityTypes = {
    namespace: {
        entitiesTable: 'namespaces',
        sharesTable: 'shares_namespace',
        permissionsTable: 'permissions_namespace'
    },
    list: {
        entitiesTable: 'lists',
        sharesTable: 'shares_list',
        permissionsTable: 'permissions_list'
    },
    customForm: {
        entitiesTable: 'custom_forms',
        sharesTable: 'shares_custom_form',
        permissionsTable: 'permissions_custom_form'
    },
    campaign: {
        entitiesTable: 'campaigns',
        sharesTable: 'shares_campaign',
        permissionsTable: 'permissions_campaign',
        files: {
            file: {
                table: 'files_campaign_file',
                permissions: {
                    view: 'viewFiles',
                    manage: 'manageFiles'
                },
                defaultReplacementBehavior: ReplacementBehavior.REPLACE
            },
            attachment: {
                table: 'files_campaign_attachment',
                permissions: {
                    view: 'viewAttachments',
                    manage: 'manageAttachments'
                },
                defaultReplacementBehavior: ReplacementBehavior.NONE
            }
        }
    },
    template: {
        entitiesTable: 'templates',
        sharesTable: 'shares_template',
        permissionsTable: 'permissions_template',
        files: {
            file: {
                table: 'files_template_file',
                permissions: {
                    view: 'viewFiles',
                    manage: 'manageFiles'
                },
                defaultReplacementBehavior: ReplacementBehavior.REPLACE
            }
        }
    },
    sendConfiguration: {
        entitiesTable: 'send_configurations',
        sharesTable: 'shares_send_configuration',
        permissionsTable: 'permissions_send_configuration'
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
    },
    mosaicoTemplate: {
        entitiesTable: 'mosaico_templates',
        sharesTable: 'shares_mosaico_template',
        permissionsTable: 'permissions_mosaico_template',
        files: {
            file: {
                table: 'files_mosaico_template_file',
                permissions: {
                    view: 'viewFiles',
                    manage: 'manageFiles'
                },
                defaultReplacementBehavior: ReplacementBehavior.REPLACE
            },
            block: {
                table: 'files_mosaico_template_block',
                permissions: {
                    view: 'viewFiles',
                    manage: 'manageFiles'
                },
                defaultReplacementBehavior: ReplacementBehavior.REPLACE
            }
        }
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
    getEntityType,
    ReplacementBehavior
}