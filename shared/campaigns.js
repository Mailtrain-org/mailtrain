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

const CampaignStatus = {
    MIN: 1,

    // For campaign types: NORMAL
    IDLE: 1,
    SCHEDULED: 2,
    FINISHED: 3,
    PAUSED: 4,

    // For campaign types: NORMAL
    SENDING: 5,
    PAUSING: 6,

    MAX: 6
};


const CampaignMessageStatus = {
    MIN: 0,

    SENT: 1,
    UNSUBSCRIBED: 2,
    BOUNCED: 3,
    COMPLAINED: 4,
    SCHEDULED: 5,

    FAILED: 6,

    MAX: 6
};

const CampaignMessageErrorType = {
  TRANSIENT: 0,
  PERMANENT: 1
};


const campaignOverridables = ['from_name', 'from_email', 'reply_to'];

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
    CampaignStatus,
    campaignOverridables,
    CampaignMessageStatus,
    CampaignMessageErrorType,
    getSendConfigurationPermissionRequiredForSend
};
