'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('lists'), ['lists.id', 'lists.name', 'lists.cid', 'lists.subscribers', 'lists.description']);
}


module.exports = {
    listDTAjax
};