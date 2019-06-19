'use strict';

require('./extensions-common');

const config = require('../ivis-core/server/lib/config');

module.exports = {
    client: 'mysql',
    connection: config.mysql,
    seeds: {
        directory: '../ivis-core/server/knex/seeds'
    },
    migrations: {
        directory: '../ivis-core/server/knex/migrations'
    }
};
