exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('send_configurations', table => {
        table.boolean('verp_disable_sender_header').defaultTo(false);
    });
})();

exports.down = (knex, Promise) => (async() => {
})();
