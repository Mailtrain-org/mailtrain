exports.up = function(knex, Promise) {
    return knex.schema.createTable('namespaces', table => {
            table.increments('id').primary();
            table.string('name');
            table.text('description');
            table.integer('parent').unsigned().references('namespaces.id').onDelete('CASCADE');
        })
        .table('lists', table => {
            table.integer('namespace').unsigned().notNullable();
        })

        .then(() => knex('namespaces').insert({
            id: 1,
            name: 'Global',
            description: 'Global namespace'
        }))

        .then(() => knex('lists').update({
            namespace: 1
        }))

        .then(() => knex.schema.table('lists', table => {
            table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
        }))

        ;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('namespaces');
};