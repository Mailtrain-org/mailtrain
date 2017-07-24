exports.up = function(knex, Promise) {
    const entityTypesAddNamespace = ['list', 'report', 'report_template', 'user'];
    let schema = knex.schema;

    schema = schema.createTable('namespaces', table => {
            table.increments('id').primary();
            table.string('name');
            table.text('description');
            table.integer('namespace').unsigned().references('namespaces.id').onDelete('CASCADE');
        })
        .then(() => knex('namespaces').insert({
            id: 1,
            name: 'Global',
            description: 'Global namespace'
        }));

    for (const entityType of entityTypesAddNamespace) {
        schema = schema
            .then(() => knex.schema.table(`${entityType}s`, table => {
                table.integer('namespace').unsigned().notNullable();
            }))
            .then(() => knex(`${entityType}s`).update({
                namespace: 1
            }))
            .then(() => knex.schema.table(`${entityType}s`, table => {
                table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
            }));
    }

    return schema;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('namespaces');
};