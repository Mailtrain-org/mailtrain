exports.up = function(knex, Promise) {
    const entityTypesAddNamespace = ['list', 'custom_form', 'report', 'report_template', 'user'];
    let promise = knex.schema.createTable('namespaces', table => {
            table.increments('id').primary();
            table.string('name');
            table.text('description');
            table.integer('namespace').unsigned().references('namespaces.id').onDelete('CASCADE');
        })
        .then(() => knex('namespaces').insert({
            id: 1, /* Global namespace id */
            name: 'Root',
            description: 'Root namespace'
        }));

    for (const entityType of entityTypesAddNamespace) {
        promise = promise
            .then(() => knex.schema.table(`${entityType}s`, table => {
                table.integer('namespace').unsigned().notNullable();
            }))
            .then(() => knex(`${entityType}s`).update({
                namespace: 1 /* Global namespace id */
            }))
            .then(() => knex.schema.table(`${entityType}s`, table => {
                table.foreign('namespace').references('namespaces.id').onDelete('CASCADE');
            }));
    }

    return promise;
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('namespaces');
};