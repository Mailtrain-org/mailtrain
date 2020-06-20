exports.up = (knex, Promise) => (async() => {
    await knex.schema.createTable('channels', table => {
        table.increments('id').primary();
        table.string('cid').unique().collate('utf8_general_ci');
        table.string('name');
        table.text('description');
        table.string('cpg_name');
        table.text('cpg_description');
        table.string('from_email_override');
        table.string('from_name_override');
        table.string('reply_to_override');
        table.string('subject');
        table.integer('send_configuration').unsigned().references(`send_configurations.id`);
        table.integer('source').unsigned().notNullable();
        table.text('data', 'longtext');
        table.boolean('click_tracking_disabled').defaultTo(false);
        table.boolean('open_tracking_disabled').defaultTo(false);
        table.string('unsubscribe_url');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.integer('namespace').unsigned().references('namespaces.id');

    });

    await knex.schema.createTable('channel_lists', table => {
        table.increments('id').primary();
        table.integer('channel').unsigned().notNullable().references('channels.id');
        table.integer('list').unsigned().notNullable().references('lists.id');
        table.integer('segment').unsigned().references('segments.id');
    });

    await knex.schema.table('campaigns', table => {
        table.integer('channel').unsigned().references('channels.id');
    });

    const entityType = 'channel';
    await knex.schema
        .createTable(`shares_${entityType}`, table => {
            table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('role', 128).notNullable();
            table.boolean('auto').defaultTo(false);
            table.primary(['entity', 'user']);
        })
        .createTable(`permissions_${entityType}`, table => {
            table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('operation', 128).notNullable();
            table.primary(['entity', 'user', 'operation']);
        });

})();

exports.down = (knex, Promise) => (async() => {
})();
