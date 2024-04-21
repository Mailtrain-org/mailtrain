'use strict';

const log = require("./log");
const knex = require("./knex");
const fs = require("fs");

async function initDb() {
    let fname = process.env.NODE_ENV === 'test' ? 'mailtrain-test.sql' : 'mailtrain.sql';
    let path = path.resolve(__dirname, 'setup', 'sql', fname);
    log.info('sql', 'Initializing DB from %s', fname);


    let tables = null;

    try {
        tables = await knex.raw("show tables");
    } catch (err) {
        log.error('Error', 'Failed to execute `show tables` command', err);
        throw err;
    }

    const dbEmpty = !tables || tables.length === 0;

    if (dbEmpty) {
        const sql = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
        return knex.raw(sql);
    }

    await knex.migrate.latest(); // And now the current migration with Knex
}

module.exports.initDb = initDb;