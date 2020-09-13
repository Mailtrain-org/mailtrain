exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_fields', function(t) {
        t.boolean('required').notNull().defaultTo(0).after('default_value');
    });
})();

exports.down = (knex, Promise) => (async() => {
})();
