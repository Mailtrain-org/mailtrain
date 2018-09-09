'use strict';

import {
    CampaignStatus,
    CampaignType
} from "../../../shared/campaigns";

export function getCampaignLabels(t) {

    const campaignTypeLabels = {
        [CampaignType.REGULAR]: t('Regular'),
        [CampaignType.TRIGGERED]: t('Triggered'),
        [CampaignType.RSS]: t('RSS')
    };

    const campaignStatusLabels = {
        [CampaignStatus.IDLE]: t('Idle'),
        [CampaignStatus.SCHEDULED]: t('Scheduled'),
        [CampaignStatus.PAUSED]: t('Paused'),
        [CampaignStatus.FINISHED]: t('Finished'),
        [CampaignStatus.PAUSED]: t('Paused'),
        [CampaignStatus.INACTIVE]: t('Inactive'),
        [CampaignStatus.ACTIVE]: t('Active')
    };


    return {
        campaignStatusLabels,
        campaignTypeLabels
    };
}
