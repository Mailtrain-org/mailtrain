const config = require('../config');

exports.up = function(knex, Promise) {
    return knex.schema.createTable('shares_list', table => {
            table.increments('id').primary();
            table.integer('list').unsigned().notNullable().references('lists.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.integer('level').notNullable();
            table.unique(['list', 'user']);
        })

        .createTable('shares_namespace', table => {
            table.increments('id').primary();
            table.integer('namespace').unsigned().notNullable().references('namespaces.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('level', 64).notNullable();
            table.unique(['namespace', 'user']);
        })

        .createTable('permissions_list', table => {
            table.increments('id').primary();
            table.integer('list').unsigned().notNullable().references('lists.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('permission', 64).notNullable();
            table.unique(['list', 'user', 'permission']);
        })

        .createTable('permissions_namespace', table => {
            table.increments('id').primary();
            table.integer('namespace').unsigned().notNullable().references('lists.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('permission', 64).notNullable();
            table.unique(['namespace', 'user', 'permission']);
        })

        .then(() => knex('shares_namespace').insert({
            id: 1,
            namespace: 1,
            user: 1,
            level: 'master'
        }))

        ;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('shares_namespace')
        .dropTable('shares_list')
        .dropTable('permissions_namespace')
        .dropTable('permissions_list');
};