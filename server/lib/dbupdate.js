'use strict';

const log = require("./log");
const knex = require("./knex");
const fs = require("fs");
const path = require("path");

async function initDb() {
    let qryResult = null;

    try {
        qryResult = await knex.raw("show tables");
    } catch (err) {
        log.error('Error', 'Failed to execute `show tables` command', err);
        throw err;
    }

    const dbEmpty = !qryResult || qryResult.length === 0 || qryResult[0].length === 0;

    if (dbEmpty) {
        let fname = process.env.NODE_ENV === 'test' ? 'mailtrain-test.sql' : 'mailtrain.sql';
        let initSqlPath = path.resolve(__dirname, '..', 'setup', 'sql', fname);
        log.info('sql', 'Initializing DB from %s', initSqlPath);

        const sql = fs.readFileSync(initSqlPath, 'utf8');
        await knex.raw(sql);
    }

    const migrations = await require('./migrations').prepareMigrations(knex);
    await knex.migrate.latest(migrations); // And now the current migration with Knex
}

module.exports.initDb = initDb;