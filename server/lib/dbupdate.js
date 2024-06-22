'use strict';

const log = require("./log");
const knex = require("./knex");
const fs = require("fs");
const path = require("path");

async function upgradeV2Migrations() {
    const migrationNames = [
        '20170506102634_v1_to_v2.js',
        '20181226090000_verp_header_options_in_send_configurations.js',
        '20190422084800_file_cache.js',
        '20190615000000_generalization_of_queued_and_file_locking.js',
        '20190616000000_drop_subject_in_send_configurations.js',
        '20190629000000_add_start_at_to_campaigns.js',
        '20190629170000_generalization_of_queued.js',
        '20190630210000_tag_language.js',
        '20190705220000_test_messages.js',
        '20190722110000_hash_email.js',
        '20190722150000_ensure_help_column_in_custom_fields.js',
        '20191007120000_add_updated_to_subscriptions.js',
        '20200617172500_add_channels.js',
        '20200824160149_convert_to_utf8mb4.js',
        '20200830140000_required_custom_fields.js'
    ];

    let allMigrations = (await knex('knex_migrations').select('name')).map(mgr => mgr.name);

    if (allMigrations.includes('20170506102634_v1_to_v2.js')) {
        for (const migration of allMigrations) {
            if (!migrationNames.includes(migration)) {
                throw new Error(`Database contains unexpected migration: ${migration}.`);
            }
        }

        for (const name of migrationNames) {
            if (!allMigrations.includes(name)) {
                throw new Error(`Migration ${name} has not been executed.`);
            }
        }

        await knex('knex_migrations').del();
    }
}

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

    await upgradeV2Migrations();

    await knex.migrate.latest(); // And now the current migration with Knex
}

module.exports.initDb = initDb;