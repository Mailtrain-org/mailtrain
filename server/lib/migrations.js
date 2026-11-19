'use strict';

const fs = require('fs').promises;
const path = require('path');

const v2Migrations = [
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


// Read-only admission must run before Knex creates its lock/ledger tables or
// acquires a migration lock. MySQL DDL cannot be rolled back on rejection.
async function prepareMigrations(knex) {
    const history = await knex.schema.hasTable('knex_migrations')
        ? (await knex('knex_migrations').select('name')).map(row => row.name) : [];
    const legacy = history.filter(name => v2Migrations.includes(name));
    if (legacy.length && v2Migrations.some(name => !history.includes(name))) {
        throw new Error('Finish all Mailtrain v2 migrations with v2 before upgrading to v3.');
    }

    if (await knex.schema.hasColumn('campaigns', 'type')) {
        const blockers = [];
        const shares = require('../models/shares');
        const config = require('./config');
        try {
            shares.getV2RoleUpdates(await knex('users').select('id', 'username', 'role'));
        } catch (error) {
            blockers.push(error.message);
        }
        for (const [type, settings] of Object.entries(require('./entity-settings').getEntityTypesWithPermissions())) {
            const roles = Object.keys(config.roles[type] || {});
            const missing = await knex(settings.sharesTable).whereNotIn('role', roles).select('entity', 'user', 'role');
            if (missing.length) blockers.push(`${settings.sharesTable} (undefined roles): ${JSON.stringify(missing)}`);
        }
        if (blockers.length) {
            throw new Error('Mailtrain v3 cannot upgrade undefined or unsafe v2 roles. No migrations have been run. ' +
                'Keep using v2 or resolve these records in v2 after backing up the database and files:\n' + blockers.join('\n'));
        }
    }

    // Keep completed v2 history, including ids, batches and timestamps. Older
    // v3 installs already discarded that history, so expose only recorded v2
    // checkpoints. They are never executable v3 migrations.
    const directory = path.join(__dirname, '..', 'setup', 'knex', 'migrations');
    const current = (await fs.readdir(directory)).filter(name => name.endsWith('.js')).sort();
    return {
        migrationSource: {
            getMigrations: async () => [...legacy, ...current],
            getMigrationName: name => name,
            getMigration: name => {
                if (v2Migrations.includes(name)) {
                    throw new Error('Run historical migrations and rollbacks with Mailtrain v2: ' + name);
                }
                return require(path.join(directory, name));
            }
        }
    };
}

module.exports.prepareMigrations = prepareMigrations;
