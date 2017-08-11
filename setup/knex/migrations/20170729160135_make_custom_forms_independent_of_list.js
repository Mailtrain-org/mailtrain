exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_forms', table => {
        table.dropForeign('list', 'custom_forms_ibfk_1');
        table.dropColumn('list');
    })
})();

exports.down = (knex, Promise) => (async() => {
})();