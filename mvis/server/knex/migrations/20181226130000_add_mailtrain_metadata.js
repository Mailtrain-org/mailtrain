exports.up = (knex, Promise) => (async () => {
    await knex.schema.table('signal_sets', table => {
        table.integer('mt_dataset_type');
    });

    await knex.schema.table('namespaces', table => {
        table.integer('mt_campaign').unsigned();
    });
})();

exports.down = (knex, Promise) => (async () => {
})();