const entityTypesWithFiles = ['template', 'campaign'];

exports.up = (knex, Promise) => (async() =>  {
    for (const entityType of entityTypesWithFiles) {

        await knex.schema.createTable(`files_${entityType}`, table => {
            table.increments('id').primary();
            table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`);
            table.string('filename');
            table.string('originalname');
            table.string('mimetype');
            table.string('encoding');
            table.integer('size');
            table.timestamp('created').defaultTo(knex.fn.now());
            table.index(['entity', 'originalname'])
        })

    }
})();

exports.down = (knex, Promise) => (async() =>  {
    for (const entityType of entityTypesWithFiles) {
        await knex.schema.dropTable(`files_${entityType}`);
    }
})();
