'use strict';

const knex = require('./knex');
const interoperableErrors = require('../../shared/interoperable-errors');
const entitySettings = require('./entity-settings');
const shares = require('../models/shares');

const defaultNoOfDependenciesReported = 20;

async function ensureNoDependencies(tx, context, id, depSpecs) {

    const deps = [];
    let andMore = false;

    for (const depSpec of depSpecs) {
        const entityType = entitySettings.getEntityType(depSpec.entityTypeId);

        let rows;

        if (depSpec.query) {
            rows = await depSpec.query(tx).limit(defaultNoOfDependenciesReported + 1);
        } else if (depSpec.column) {
            rows = await tx(entityType.entitiesTable).where(depSpec.column, id).forShare().select(['id', 'name']).limit(defaultNoOfDependenciesReported + 1);
        } else if (depSpec.rows) {
            rows = await depSpec.rows(tx, defaultNoOfDependenciesReported + 1)
        }

        for (const row of rows) {
            if (deps.length === defaultNoOfDependenciesReported) {
                andMore = true;
                break;
            }

            if (depSpec.viewPermission && await shares.checkEntityPermissionTx(tx, context, depSpec.viewPermission.entityTypeId, depSpec.viewPermission.entityId, depSpec.viewPermission.requiredOperations)) {
                deps.push({
                    entityTypeId: depSpec.entityTypeId,
                    name: row.name,
                    link: entityType.clientLink(row.id)
                });
            } else if (!depSpec.viewPermission && await shares.checkEntityPermissionTx(tx, context, depSpec.entityTypeId, row.id, 'view')) {
                deps.push({
                    entityTypeId: depSpec.entityTypeId,
                    name: row.name,
                    link: entityType.clientLink(row.id)
                });
            }
        }
    }

    if (deps.length > 0) {
        throw new interoperableErrors.DependencyPresentError('', {
            dependencies: deps,
            andMore
        });
    }
}

module.exports.ensureNoDependencies = ensureNoDependencies;
