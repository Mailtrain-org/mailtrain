'use strict';

const {enforce} = require("../lib/helpers");
const shares = require("./shares");
const knex = require("../lib/knex");
const { CampaignMessageStatus } = require('../../shared/campaigns');

const statusFieldMapping = new Map();
statusFieldMapping.set(CampaignMessageStatus.UNSUBSCRIBED, 'unsubscribed');
statusFieldMapping.set(CampaignMessageStatus.BOUNCED, 'bounced');
statusFieldMapping.set(CampaignMessageStatus.COMPLAINED, 'complained');

async function changeStatusByMessageTx(tx, context, message, campaignMessageStatus) {
    enforce(statusFieldMapping.has(campaignMessageStatus));

    if (message.status === CampaignMessageStatus.SENT) {
        await shares.enforceEntityPermissionTx(tx, context, 'campaign', message.campaign, 'manageMessages');

        const statusField = statusFieldMapping.get(campaignMessageStatus);

        await tx('campaigns').increment(statusField, 1).where('id', message.campaign);

        await tx('campaign_messages')
            .where('id', message.id)
            .update({
                status: campaignMessageStatus,
                updated: knex.fn.now()
            });
    }
}

async function changeStatusByCampaignCidAndSubscriptionIdTx(tx, context, campaignCid, listId, subscriptionId, campaignMessageStatus) {
    const message = await tx('campaign_messages')
        .innerJoin('campaigns', 'campaign_messages.campaign', 'campaigns.id')
        .where('campaigns.cid', campaignCid)
        .where({subscription: subscriptionId, list: listId})
        .select([
            'campaign_messages.id', 'campaign_messages.campaign', 'campaign_messages.list', 'campaign_messages.subscription', 'campaign_messages.hash_email', 'campaign_messages.status'
        ])
        .first();

    if (message) { // If a test is send before the campaign is sent, the corresponding entry does not exists in campaign_messages. We ignore such situations as the subscriber gets unsubscribed anyway. We just don't account it to the campaign.
        await changeStatusByMessageTx(tx, context, message, campaignMessageStatus);
    }
}

module.exports.changeStatusByMessageTx = changeStatusByMessageTx;
module.exports.changeStatusByCampaignCidAndSubscriptionIdTx = changeStatusByCampaignCidAndSubscriptionIdTx;