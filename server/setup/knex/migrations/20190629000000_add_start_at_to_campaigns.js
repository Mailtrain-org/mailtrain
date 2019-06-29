const { CampaignType, CampaignStatus } = require('../../../../shared/campaigns');

exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('campaigns', table => {
        table.timestamp('start_at').nullable().defaultTo(null);
    });

    await knex('campaigns')
        .whereIn('type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
        .whereIn('status', [CampaignStatus.SCHEDULED, CampaignStatus.SENDING, CampaignStatus.PAUSING, CampaignStatus.PAUSED])
        .whereNotNull('scheduled')
        .update({
            start_at: knex.raw('scheduled')
        });

    await knex('campaigns')
        .whereIn('type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
        .whereIn('status', [CampaignStatus.SCHEDULED, CampaignStatus.SENDING, CampaignStatus.PAUSING, CampaignStatus.PAUSED])
        .whereNull('scheduled')
        .update({
            start_at: new Date()
        });
})();

exports.down = (knex, Promise) => (async() => {
})();
