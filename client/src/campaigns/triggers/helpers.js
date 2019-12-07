'use strict';

import {Entity, Event} from '../../../../shared/triggers';

export function getTriggerTypes(t) {

    const entityLabels = {
        [Entity.SUBSCRIPTION]: t('subscription'),
        [Entity.CAMPAIGN]: t('campaign')
    };

    const SubscriptionEvent = Event[Entity.SUBSCRIPTION];
    const CampaignEvent = Event[Entity.CAMPAIGN];

    const eventLabels = {
        [Entity.SUBSCRIPTION]: {
            [SubscriptionEvent.CREATED]: t('created'),
            [SubscriptionEvent.UPDATED]: t('updated'),
            [SubscriptionEvent.LATEST_OPEN]: t('latestOpen'),
            [SubscriptionEvent.LATEST_CLICK]: t('latestClick')
        },
        [Entity.CAMPAIGN]: {
            [CampaignEvent.DELIVERED]: t('delivered'),
            [CampaignEvent.OPENED]: t('opened'),
            [CampaignEvent.CLICKED]: t('clicked'),
            [CampaignEvent.NOT_OPENED]: t('notOpened'),
            [CampaignEvent.NOT_CLICKED]: t('notClicked')
        }
    };

    return {
        entityLabels,
        eventLabels
    };
}

