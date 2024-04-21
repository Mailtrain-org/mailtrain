exports.up = (knex, Promise) => (async() => {
    await knex.schema.dropTableIfExists('shares_report');
    await knex.schema.dropTableIfExists('shares_report_template');
    await knex.schema.dropTableIfExists('permissions_report');
    await knex.schema.dropTableIfExists('permissions_report_template');
    await knex.schema.dropTableIfExists('reports');
    await knex.schema.dropTableIfExists('report_templates');
})();

exports.down = (knex, Promise) => (async() => {
})();
