'use strict';

import {CampaignType} from "../../../shared/campaigns";

export function getCampaignTypeLabels(t) {

    const campaignTypeLabels = {
        [CampaignType.REGULAR]: t('Regular'),
        [CampaignType.TRIGGERED]: t('Triggered'),
        [CampaignType.RSS]: t('RSS')
    };

    return campaignTypeLabels;
}
