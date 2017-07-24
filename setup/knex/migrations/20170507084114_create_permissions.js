const shareableEntityTypes = ['list', 'report', 'report_template', 'namespace'];

exports.up = function(knex, Promise) {
    let schema = knex.schema;

    for (const entityType of shareableEntityTypes) {
        schema = schema
            .createTable(`shares_${entityType}`, table => {
                table.increments('id').primary();
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('role', 64).notNullable();
                table.unique(['entity', 'user']);
            })
            .createTable(`permissions_${entityType}`, table => {
                table.increments('id').primary();
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('operation', 64).notNullable();
                table.unique(['entity', 'user', 'operation']);
            });
    }

    schema = schema.then(() => knex('shares_namespace').insert({
            id: 1,
            entity: 1,
            user: 1,
            role: 'master'
        }));

    return schema;
};

exports.down = function(knex, Promise) {
    let schema = knex.schema;

    for (const entityType of shareableEntityTypes) {
        schema = schema
            .dropTable(`shares_${entityType}`)
            .dropTable(`permissions_${entityType}`);
    }

    return schema;
};