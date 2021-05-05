'use strict';

const config = require('./config');
const path = require('path');

const knexConstructor = require('knex');

const knex = require('knex')({
    client: 'mysql',
    connection: {
        ...config.mysql,

	charset: 'utf8mb4',
	multipleStatements: true,

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

/*
This is to enable logging on mysql side:
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/tmp/mysql-all.log';
*/



module.exports = knex;
