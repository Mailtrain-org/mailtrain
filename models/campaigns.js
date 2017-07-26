'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, builder => builder.from('campaigns'), ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.status', 'campaigns.created']);
}

async function getById(id) {
    const entity = await knex('campaigns').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}

module.exports = {
    listDTAjax,
    getById
};