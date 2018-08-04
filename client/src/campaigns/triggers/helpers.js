'use strict';

import {Entity, Event} from '../../../../shared/triggers';

export function getTriggerTypes(t) {

    const entityLabels = {
        [Entity.SUBSCRIPTION]: t('Subscription'),
        [Entity.CAMPAIGN]: t('Campaign')
    };

    const SubscriptionEvent = Event[Entity.SUBSCRIPTION];
    const CampaignEvent = Event[Entity.CAMPAIGN];

    const eventLabels = {
        [Entity.SUBSCRIPTION]: {
            [SubscriptionEvent.CREATED]: t('Created'),
            [SubscriptionEvent.LATEST_OPEN]: t('Latest open'),
            [SubscriptionEvent.LATEST_CLICK]: t('Latest click')
        },
        [Entity.CAMPAIGN]: {
            [CampaignEvent.DELIVERED]: t('Delivered'),
            [CampaignEvent.OPENED]: t('Opened'),
            [CampaignEvent.CLICKED]: t('Clicked'),
            [CampaignEvent.NOT_OPENED]: t('Not opened'),
            [CampaignEvent.NOT_CLICKED]: t('Not clicked')
        }
    };

    return {
        entityLabels,
        eventLabels
    };
}

