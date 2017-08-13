exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_fields', table => {
        table.foreign('group').references('custom_fields.id').onDelete('CASCADE');
    });
})();

exports.down = (knex, Promise) => (async() => {
})();