'use strict';

const config = require('config');
const path = require('path');

const knexConstructor = require('knex');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        ...config.mysql,

        // DATE and DATETIME types contain no timezone info. The MySQL driver tries to interpret them w.r.t. to local time, which
        // does not work well with assigning these values in UTC and handling them as if in UTC
        dateStrings: [
            'DATE',
            'DATETIME'
        ]
    },
    migrations: {
        directory: path.join(__dirname, '..', 'setup', 'knex', 'migrations')
    }
    //, debug: true
});



module.exports = knex;
