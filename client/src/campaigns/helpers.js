'use strict';

import {CampaignStatus, CampaignType} from "../../../shared/campaigns";

export function getCampaignLabels(t) {

    const campaignTypeLabels = {
        [CampaignType.REGULAR]: t('regular'),
        [CampaignType.TRIGGERED]: t('triggered'),
        [CampaignType.RSS]: t('rss')
    };

    const campaignStatusLabels = {
        [CampaignStatus.IDLE]: t('idle'),
        [CampaignStatus.SCHEDULED]: t('scheduled'),
        [CampaignStatus.PAUSED]: t('paused'),
        [CampaignStatus.FINISHED]: t('finished'),
        [CampaignStatus.PAUSED]: t('paused'),
        [CampaignStatus.INACTIVE]: t('inactive'),
        [CampaignStatus.ACTIVE]: t('active'),
        [CampaignStatus.SENDING]: t('sending')
    };


    return {
        campaignStatusLabels,
        campaignTypeLabels
    };
}


