'use strict';

require('./config'); // Knex changes cwd to this directory before loading the file.
const knex = require('../../lib/knex');
const {prepareMigrations} = require('../../lib/migrations');

// Use the same read-only admission and history source as normal startup.
module.exports = async () => {
    try {
        const migrations = await prepareMigrations(knex);
        return {...knex.client.config, migrations};
    } finally {
        await knex.destroy();
    }
};
