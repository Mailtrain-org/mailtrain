exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('send_configurations', table => {
        table.dropColumn('subject');
        table.dropColumn('subject_overridable');
    });

    await knex.schema.table('campaigns', table => {
        table.renameColumn('subject_override', 'subject');
    });

    await knex('campaigns').whereNull('subject').update('subject', '');
})();

exports.down = (knex, Promise) => (async() => {
})();
