const { CampaignSource } = require('../../../../shared/campaigns');
const { TagLanguages } = require('../../../../shared/templates');

exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('templates', table => {
        table.string('tag_language', 48);
    });

    await knex('templates').update({
       tag_language: 'simple'
    });

    await knex.schema.table('templates', table => {
        table.string('tag_language', 48).notNullable().index().alter();
    });


    await knex.schema.table('mosaico_templates', table => {
        table.string('tag_language', 48);
    });

    await knex('mosaico_templates').update({
        tag_language: TagLanguages.SIMPLE
    });

    await knex.schema.table('mosaico_templates', table => {
        table.string('tag_language', 48).notNullable().index().alter();
    });

    const rows = await knex('campaigns').whereIn('source', [CampaignSource.CUSTOM, CampaignSource.CUSTOM_FROM_CAMPAIGN, CampaignSource.CUSTOM_FROM_TEMPLATE]);
    for (const row of rows) {
        const data = JSON.parse(row.data);

        data.sourceCustom.tag_language = TagLanguages.SIMPLE;

        await knex('campaigns').where('id', row.id).update({data: JSON.stringify(data)});
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
