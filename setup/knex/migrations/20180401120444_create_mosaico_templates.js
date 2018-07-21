const mosaicoTemplates = require('../../../shared/mosaico-templates');

exports.up = (knex, Promise) => (async() =>  {
    await knex.schema.createTable('mosaico_templates', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.string('type');
        table.text('data', 'longtext');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.integer('namespace').unsigned().references('namespaces.id');
    });

    await knex.schema.createTable(`shares_mosaico_template`, table => {
        table.integer('entity').unsigned().notNullable().references(`mosaico_templates.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('role', 128).notNullable();
        table.boolean('auto').defaultTo(false);
        table.primary(['entity', 'user']);
    });

    await knex.schema.createTable(`permissions_mosaico_template`, table => {
        table.integer('entity').unsigned().notNullable().references(`mosaico_templates.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('operation', 128).notNullable();
        table.primary(['entity', 'user', 'operation']);
    });

    await knex.schema.createTable(`files_mosaico_template`, table => {
        table.increments('id').primary();
        table.integer('entity').unsigned().notNullable().references('mosaico_templates.id');
        table.string('filename');
        table.string('originalname');
        table.string('mimetype');
        table.string('encoding');
        table.integer('size');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.index(['entity', 'originalname']);
    });

    const versafix = {
        name: 'Versafix One',
        description: 'Default Mosaico Template',
        type: 'html',
        namespace: 1,
        data: JSON.stringify({
            html: mosaicoTemplates.getVersafix()
        })
    };

    await knex('mosaico_templates').insert(versafix);
})();

exports.down = (knex, Promise) => (async() =>  {
    await knex.schema
        .dropTable('shares_mosaico_template')
        .dropTable('permissions_mosaico_template')
        .dropTable('files_mosaico_template')
        .dropTable('mosaico_templates')
    ;
})();
