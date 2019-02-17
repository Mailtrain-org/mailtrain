'use strict';

async function _logActivity(typeId, data) {
    // TODO
}

/*
Extra data:

campaign:
- status : CampaignStatus

list:
- subscriptionId
- subscriptionStatus : SubscriptionStatus
- fieldId
- segmentId
- importId
- importStatus : ImportStatus
*/
async function logEntityActivity(entityTypeId, activityType, entityId, extraData = {}) {
    const data = {
        ...extraData,
        type: activityType,
        entity: entityId
    };

    await _logActivity(entityTypeId, data);
}

async function logCampaignTrackerActivity(activityType, campaignId, listId, subscriptionId, extraData = {}) {
    const data = {
        ...extraData,
        type: activityType,
        campaign: campaignId,
        list: listId,
        subscription: subscriptionId
    };

    await _logActivity('campaign_tracker', data);
}

async function logBlacklistActivity(activityType, email) {
    const data = {
        type: activityType,
        email
    };

    await _logActivity('blacklist', data);
}

module.exports.logEntityActivity = logEntityActivity;
module.exports.logBlacklistActivity = logBlacklistActivity;
module.exports.logCampaignTrackerActivity = logCampaignTrackerActivity;