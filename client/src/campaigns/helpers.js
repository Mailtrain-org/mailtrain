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

/* FIXME - this is not used at the moment, but it's kept here because it will be probably needed at some later point of time.
export function getDefaultMergeTags(t) {
    return [{
        key: 'LINK_UNSUBSCRIBE',
        value: t('URL that points to the unsubscribe page')
    }, {
        key: 'LINK_PREFERENCES',
        value: t('URL that points to the preferences page of the subscriber')
    }, {
        key: 'LINK_BROWSER',
        value: t('URL to preview the message in a browser')
    }, {
        key: 'EMAIL',
        value: t('Email address')
    }, {
        key: 'SUBSCRIPTION_ID',
        value: t('Unique ID that identifies the recipient')
    }, {
        key: 'LIST_ID',
        value: t('Unique ID that identifies the list used for this campaign')
    }, {
        key: 'CAMPAIGN_ID',
        value: t('Unique ID that identifies current campaign')
    }];
}

export function getRSSMergeTags(t) {
    return [{
        key: 'RSS_ENTRY',
        value: t('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_TITLE',
        value: t('RSS entry title')
    }, {
        key: 'RSS_ENTRY_DATE',
        value: t('RSS entry date')
    }, {
        key: 'RSS_ENTRY_LINK',
        value: t('RSS entry link')
    }, {
        key: 'RSS_ENTRY_CONTENT',
        value: t('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_SUMMARY',
        value: t('RSS entry summary')
    }, {
        key: 'RSS_ENTRY_IMAGE_URL',
        value: t('RSS entry image URL')
    }];
}
*/

