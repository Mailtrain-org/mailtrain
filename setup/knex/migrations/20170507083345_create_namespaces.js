const {getGlobalNamespaceId} = require('../../../shared/namespaces');

exports.up = (knex, Promise) => (async() => {
    const entityTypesAddNamespace = ['list', 'custom_form', 'template', 'campaign', 'report', 'report_template', 'user'];
    await knex.schema.createTable('namespaces', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.integer('namespace').unsigned().references('namespaces.id');
    });

    await knex('namespaces').insert({
        id: getGlobalNamespaceId(),
        name: 'Root',
        description: 'Root namespace'
    });

    for (const entityType of entityTypesAddNamespace) {
        await knex.schema.table(`${entityType}s`, table => {
            table.integer('namespace').unsigned().notNullable();
        });

        await knex(`${entityType}s`).update({
            namespace: getGlobalNamespaceId()
        });

        await knex.schema.table(`${entityType}s`, table => {
            table.foreign('namespace').references('namespaces.id');
        });
    }
})();

exports.down = (knex, Promise) => (async() => {
    await knex.schema.dropTable('namespaces');
})();