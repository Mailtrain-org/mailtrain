exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_forms_data', table => {
        table.dropColumn('id');
        table.string('data_key', 128).alter();
        table.primary(['form', 'data_key']);
    })
})();

exports.down = (knex, Promise) => (async() => {
})();