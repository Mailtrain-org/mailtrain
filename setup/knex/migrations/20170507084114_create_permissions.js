const config = require('../config');

exports.up = function(knex, Promise) {
    return knex.schema.createTable('shares_list', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('lists.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('role', 64).notNullable();
            table.unique(['entity', 'user']);
        })

        .createTable('permissions_list', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('lists.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('operation', 64).notNullable();
            table.unique(['entity', 'user', 'operation']);
        })

        .createTable('shares_report_template', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('report_templates.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('role', 64).notNullable();
            table.unique(['entity', 'user']);
        })

        .createTable('permissions_report_template', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('report_templates.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('operation', 64).notNullable();
            table.unique(['entity', 'user', 'operation']);
        })

        .createTable('shares_namespace', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('namespaces.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('role', 64).notNullable();
            table.unique(['entity', 'user']);
        })

        .createTable('permissions_namespace', table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references('namespaces.id').onDelete('CASCADE');
            table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
            table.string('operation', 64).notNullable();
            table.unique(['entity', 'user', 'operation']);
        })

        .then(() => knex('shares_namespace').insert({
            id: 1,
            entity: 1,
            user: 1,
            role: 'master'
        }))

        ;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('shares_namespace')
        .dropTable('shares_list')
        .dropTable('permissions_namespace')
        .dropTable('permissions_list');
};