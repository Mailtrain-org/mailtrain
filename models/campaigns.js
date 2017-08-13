'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');

async function listDTAjax(params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'campaign', requiredOperations: ['view'] }],
        params,
        builder => builder.from('campaigns')
            .innerJoin('namespaces', 'namespaces.id', 'campaigns.namespace'),
        ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.status', 'campaigns.created']
    );

}

async function getById(context, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', 'view');
        const entity = await tx('campaigns').where('id', id).first();
        entity.permissions = await shares.getPermissionsTx(tx, context, 'campaign', id);
        return entity;
    });
}

module.exports = {
    listDTAjax,
    getById
};