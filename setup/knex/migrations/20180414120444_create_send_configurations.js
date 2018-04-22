exports.up = (knex, Promise) => (async() =>  {
    await knex.schema.createTable('send_configurations', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.string('from_email');
        table.boolean('from_email_overridable').defaultTo(false);
        table.string('from_name');
        table.boolean('from_name_overridable').defaultTo(false);
        table.string('subject');
        table.boolean('subject_overridable').defaultTo(false);
        table.string('mailer_type');
        table.text('mailer_settings', 'longtext');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.integer('namespace').unsigned().references('namespaces.id');
    });

    await knex.schema.createTable(`shares_send_configuration`, table => {
        table.integer('entity').unsigned().notNullable().references(`send_configurations.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('role', 128).notNullable();
        table.boolean('auto').defaultTo(false);
        table.primary(['entity', 'user']);
    });

    await knex.schema.createTable(`permissions_send_configuration`, table => {
        table.integer('entity').unsigned().notNullable().references(`send_configurations.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('operation', 128).notNullable();
        table.primary(['entity', 'user', 'operation']);
    });

})();

exports.down = (knex, Promise) => (async() =>  {
    await knex.schema
        .dropTable('shares_send_configuration')
        .dropTable('permissions_send_configuration')
        .dropTable('send_configurations')
    ;
})();
