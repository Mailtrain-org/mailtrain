exports.up = (knex, Promise) => (async() => {
    await knex.schema.dropTableIfExists('shares_report');
    await knex.schema.dropTableIfExists('shares_report_template');
    await knex.schema.dropTableIfExists('permissions_report');
    await knex.schema.dropTableIfExists('permissions_report_template');
    await knex.schema.dropTableIfExists('reports');
    await knex.schema.dropTableIfExists('report_templates');
    await knex.schema.dropTableIfExists('trigger_messages');
    await knex.schema.dropTableIfExists('triggers');
    await knex.schema.dropTableIfExists('rss');

    /*
    TODO:
report unsupported if campaign type is not 1
map campaign status in SQL 7 -> 5, 8 -> 6.

report unsupported message type 1
map message type 2 -> 1, 3 -> 2, 4 -> 3
     */

    await knex.schema.table('campaigns', table => {
        table.dropColumn('parent');
        table.dropColumn('lastCheck');
        table.dropColumn('type');
    });
})();

exports.down = (knex, Promise) => (async() => {
})();
