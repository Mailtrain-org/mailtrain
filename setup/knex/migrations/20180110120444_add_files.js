const entityTypesWithFiles = {
    campaign: {
        file: 'files_campaign_file',
        attachment: 'files_campaign_attachment',
    },
    template: {
        file: 'files_template_file'
    },
    mosaicoTemplate: {
        file: 'files_mosaico_template_file',
        block: 'files_mosaico_template_block'
    }
};


exports.up = (knex, Promise) => (async() =>  {
    for (const type in entityTypesWithFiles) {
        const typeEntry = entityTypesWithFiles[type];

        for (const subType in typeEntry) {
            const subTypeEntry = typeEntry[subType];

            await knex.schema.createTable(subTypeEntry, table => {
                table.increments('id').primary();
                table.integer('entity').unsigned().notNullable().references(`${type}s.id`);
                table.string('filename');
                table.string('originalname');
                table.string('mimetype');
                table.string('encoding');
                table.integer('size');
                table.timestamp('created').defaultTo(knex.fn.now());
                table.index(['entity', 'originalname'])
            });
        }
    }
})();

exports.down = (knex, Promise) => (async() =>  {
})();
