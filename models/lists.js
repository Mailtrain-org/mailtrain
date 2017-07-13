'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('lists'), ['lists.id', 'lists.name', 'lists.cid', 'lists.subscribers', 'lists.description']);
}

async function getById(id) {
    const entity = await knex('lists').where('id', id).first();
    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    return entity;
}


module.exports = {
    listDTAjax,
    getById
};