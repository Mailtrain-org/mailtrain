'use strict';

const config = require('config');

const knex = require('knex')({
    client: 'mysql2',
    connection: config.mysql,
    migrations: {
        directory: __dirname + '/../setup/knex/migrations'
    }
    // , debug: true
});

knex.migrate.latest();

module.exports = knex;
