'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('campaigns'), ['campaigns.id', 'campaigns.name', 'campaigns.description', 'campaigns.status', 'campaigns.created']);
}


module.exports = {
    listDTAjax
};