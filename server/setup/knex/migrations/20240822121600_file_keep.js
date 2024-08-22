const entityTypesWithFiles = {
    campaign: {
        file: 'files_campaign_file',
        attachment: 'files_campaign_attachment',
    },
    template: {
        file: 'files_template_file'
    },
    mosaico_template: {
        file: 'files_mosaico_template_file',
        block: 'files_mosaico_template_block'
    }
};

exports.up = (knex, Promise) => (async() => {
    for (const type in entityTypesWithFiles) {
        const typeEntry = entityTypesWithFiles[type];

        for (const subType in typeEntry) {
            const subTypeEntry = typeEntry[subType];

            await knex.schema.table(subTypeEntry, table => {
                table.boolean('gc_allowed').notNullable().defaultTo(false);
            });
        }
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
