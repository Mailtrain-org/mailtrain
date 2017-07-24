exports.up = function(knex, Promise) {
    return knex.schema.createTable('namespaces', table => {
            table.increments('id').primary();
            table.string('name');
            table.text('description');
            table.integer('namespace').unsigned().references('namespaces.id').onDelete('CASCADE');
        })

        .then(() => knex('namespaces').insert({
            id: 1,
            name: 'Global',
            description: 'Global namespace'
        }))

        .then(() => knex.schema.table('users', table => {
            table.integer('namespace').unsigned().notNullable();
        }))
        .then(() => knex('users').update({
            namespace: 1
        }))
        .then(() => knex.schema.table('users', table => {
            table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
        }))

        .then(() => knex.schema.table('lists', table => {
            table.integer('namespace').unsigned().notNullable();
        }))
        .then(() => knex('lists').update({
            namespace: 1
        }))
        .then(() => knex.schema.table('lists', table => {
            table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
        }))

        .then(() => knex.schema.table('report_templates', table => {
            table.integer('namespace').unsigned().notNullable();
        }))
        .then(() => knex('report_templates').update({
            namespace: 1
        }))
        .then(() => knex.schema.table('report_templates', table => {
            table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
        }))

        .then(() => knex.schema.table('reports', table => {
            table.integer('namespace').unsigned().notNullable();
        }))
        .then(() => knex('reports').update({
            namespace: 1
        }))
        .then(() => knex.schema.table('reports', table => {
            table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
        }))

        ;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('namespaces');
};