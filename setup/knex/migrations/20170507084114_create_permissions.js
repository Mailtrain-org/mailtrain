const shareableEntityTypes = ['list', 'report', 'report_template', 'namespace'];

exports.up = function(knex, Promise) {
    let schema = knex.schema;

    for (const entityType of shareableEntityTypes) {
        schema = schema
            .createTable(`shares_${entityType}`, table => {
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('role', 128).notNullable();
                table.primary(['entity', 'user']);
            })
            .createTable(`permissions_${entityType}`, table => {
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('operation', 128).notNullable();
                table.primary(['entity', 'user', 'operation']);
            });
    }
    /* The global share for admin is set automatically in rebuildPermissions, which is called upon every start */

    schema = schema
        .createTable('generated_role_names', table => {
            table.string('entity_type', 32).notNullable();
            table.string('role', 128).notNullable();
            table.string('name');
            table.string('description');
            table.primary(['entity_type', 'role']);
        });
    /* The generate_role_names table is repopulated in regenerateRoleNamesTable, which is called upon every start */

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