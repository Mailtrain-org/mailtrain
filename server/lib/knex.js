'use strict';

const config = require('./config');
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
    pool: {
        min: 2,
        max: 10,
        afterCreate: function(conn, cb) {
            conn.query('SET sql_mode="ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";', function (err) {
               cb(err, conn);
	    });
	}
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
