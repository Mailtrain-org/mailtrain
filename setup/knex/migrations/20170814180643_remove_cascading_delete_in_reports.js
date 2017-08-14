exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('reports', table => {
        table.dropForeign('report_template', 'report_template_ibfk_1');
        table.foreign('report_template').references('report_templates.id');
    });
})();

exports.down = (knex, Promise) => (async() => {
})();