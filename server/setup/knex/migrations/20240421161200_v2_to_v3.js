exports.config = {transaction: false};

exports.up = (knex, Promise) => (async() => {

    // initDb and the Knex CLI admit v2 data before any migration writes.
    await require('../../../lib/migrations').prepareMigrations(knex);

    await require('../../../lib/legacy-v2').archiveV2(knex);

    for (const column of ['parent', 'last_check', 'type']) {
        if (await knex.schema.hasColumn('campaigns', column)) {
            await knex.schema.alterTable('campaigns', table => table.dropColumn(column));
        }
    }

    await knex.schema.dropTableIfExists('shares_report');
    await knex.schema.dropTableIfExists('shares_report_template');
    await knex.schema.dropTableIfExists('permissions_report');
    await knex.schema.dropTableIfExists('permissions_report_template');
    await knex.schema.dropTableIfExists('reports');
    await knex.schema.dropTableIfExists('report_templates');
    await knex.schema.dropTableIfExists('trigger_messages');
    await knex.schema.dropTableIfExists('triggers');
    await knex.schema.dropTableIfExists('rss');
})();

exports.down = (knex, Promise) => (async() => {
})();
