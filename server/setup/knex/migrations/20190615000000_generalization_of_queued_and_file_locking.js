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
    await knex.schema.table('queued', table => {
        table.integer('send_configuration').unsigned().notNullable();
        table.integer('type').unsigned().notNullable(); // The values come from message-sender.js:MessageType
        table.text('data', 'longtext');
    });

    const queued = await knex('queued')
        .leftJoin('campaigns', 'queued.campaign', 'campaigns.id')
        .select(['queued.id', 'queued.trigger', 'queued.campaign', 'campaigns.send_configuration']);

    for (const queuedEntry of queued) {
        const data = {};

        if (queued.trigger) {
            data.triggerId = queuedEntry.trigger;
            data.campaignId = queuedEntry.campaign;
        }

        knex('queued')
            .where('id', queuedEntry.id)
            .update({
                send_configuration: queuedEntry.send_configuration,
                data: JSON.stringify(data)
            });
    }

    await knex.schema.table('queued', table => {
        table.dropColumn('trigger');
        table.dropColumn('campaign');
    });


    for (const type in entityTypesWithFiles) {
        const typeEntry = entityTypesWithFiles[type];

        for (const subType in typeEntry) {
            const subTypeEntry = typeEntry[subType];

            await knex.schema.table(subTypeEntry, table => {
                table.boolean('delete_pending').notNullable().defaultTo(false);
                table.integer('lock_count').notNullable().defaultTo(0);
            });
        }
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
