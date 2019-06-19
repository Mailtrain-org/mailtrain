'use strict';

const CampaignSource = {
    MIN: 1,

    TEMPLATE: 1,
    CUSTOM: 2,
    CUSTOM_FROM_TEMPLATE: 3,
    CUSTOM_FROM_CAMPAIGN: 4,
    URL: 5,

    MAX: 5
};

const CampaignType = {
    MIN: 1,

    REGULAR: 1,
    RSS: 2,
    RSS_ENTRY: 3,
    TRIGGERED: 4,

    MAX: 4
};

const CampaignStatus = {
    MIN: 1,

    // For campaign types: NORMAL, RSS_ENTRY
    IDLE: 1,
    SCHEDULED: 2,
    FINISHED: 3,
    PAUSED: 4,

    // For campaign types: RSS, TRIGGERED
    INACTIVE: 5,
    ACTIVE: 6,

    // For campaign types: NORMAL, RSS_ENTRY
    SENDING: 7,

    MAX: 8
};

const campaignOverridables = ['from_name', 'from_email', 'reply_to', 'subject'];

function getSendConfigurationPermissionRequiredForSend(campaign, sendConfiguration) {
    let allowedOverride = false;
    let disallowedOverride = false;

    for (const overridable of campaignOverridables) {
        if (campaign[overridable + '_override'] !== null) {
            if (sendConfiguration[overridable + '_overridable']) {
                allowedOverride = true;
            } else {
                disallowedOverride = true;
            }
        }
    }

    let requiredPermission = 'sendWithoutOverrides';
    if (allowedOverride) {
        requiredPermission = 'sendWithAllowedOverrides';
    }
    if (disallowedOverride) {
        requiredPermission = 'sendWithAnyOverrides';
    }

    return requiredPermission;
}

module.exports = {
    CampaignSource,
    CampaignType,
    CampaignStatus,
    campaignOverridables,
    getSendConfigurationPermissionRequiredForSend
};