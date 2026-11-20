exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('send_configurations', table => {
        table.string('cc').nullable().defaultTo(null);
        table.string('bcc').nullable().defaultTo(null);
    });
})();

exports.down = (knex, Promise) => (async() => {
    await knex.schema.table('send_configurations', table => {
        table.dropColumn('cc');
        table.dropColumn('bcc');
    });
})();
