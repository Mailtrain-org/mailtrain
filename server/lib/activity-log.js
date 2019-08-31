'use strict';

const moment = require('moment');

const activityQueueLenthThreshold = 100;
const actitivyQueue = [];

let processQueueIsRunning = false;

async function processQueue() {
    if (processQueueIsRunning) {
        return;
    }

    processQueueIsRunning = true;

    // XXX submit data to IVIS if configured in config

    actitivyQueue.splice(0);

    processQueueIsRunning = false;
}

async function _logActivity(typeId, data) {
    actitivyQueue.push({
        typeId,
        data,
        timestamp: moment.utc().toISOString()
    });

    if (actitivyQueue.length >= activityQueueLenthThreshold) {
        // noinspection ES6MissingAwait
        processQueue();
    }
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