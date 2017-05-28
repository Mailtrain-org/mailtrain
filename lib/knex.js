'use strict';

const config = require('config');

const knex = require('knex')({
    client: 'mysql',
    connection: config.mysql,
    migrations: {
        directory: __dirname + '/../setup/knex/migrations'
    }
});

knex.migrate.latest();

module.exports = knex;
