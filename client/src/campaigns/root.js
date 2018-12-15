'use strict';

import React from 'react';

import Status from './Status';
import Statistics from './Statistics';
import CampaignsCUD from './CUD';
import Content from './Content';
import CampaignsList from './List';
import Share from '../shares/Share';
import Files from "../lib/files";
import {
    CampaignSource,
    CampaignStatus,
    CampaignType
} from "../../../shared/campaigns";
import TriggersCUD from './triggers/CUD';
import TriggersList from './triggers/List';


function getMenus(t) {
    return {
        'campaigns': {
            title: t('campaigns'),
            link: '/campaigns',
            panelComponent: CampaignsList,
            children: {
                ':campaignId([0-9]+)': {
                    title: resolved => t('campaignName', {name: resolved.campaign.name}),
                    resolve: {
                        campaign: params => `rest/campaigns-settings/${params.campaignId}`
                    },
                    link: params => `/campaigns/${params.campaignId}/edit`,
                    navs: {
                        status: {
                            title: t('status'),
                            link: params => `/campaigns/${params.campaignId}/status`,
                            visible: resolved => resolved.campaign.permissions.includes('viewStats'),
                            panelRender: props => <Status entity={props.resolved.campaign} />
                        },
                        statistics: {
                            title: t('statistics'),
                            link: params => `/campaigns/${params.campaignId}/statistics`,
                            visible: resolved => resolved.campaign.permissions.includes('viewStats') && (resolved.campaign.status === CampaignStatus.SENDING || resolved.campaign.status === CampaignStatus.PAUSED || resolved.campaign.status === CampaignStatus.FINISHED),
                            panelRender: props => <Statistics entity={props.resolved.campaign} />
                        },
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/campaigns/${params.campaignId}/edit`,
                            visible: resolved => resolved.campaign.permissions.includes('edit'),
                            panelRender: props => <CampaignsCUD action={props.match.params.action} entity={props.resolved.campaign} />
                        },
                        content: {
                            title: t('content'),
                            link: params => `/campaigns/${params.campaignId}/content`,
                            resolve: {
                                campaignContent: params => `rest/campaigns-content/${params.campaignId}`
                            },
                            visible: resolved => resolved.campaign.permissions.includes('edit') && (resolved.campaign.source === CampaignSource.CUSTOM || resolved.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || resolved.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN),
                            panelRender: props => <Content entity={props.resolved.campaignContent} />
                        },
                        files: {
                            title: t('files'),
                            link: params => `/campaigns/${params.campaignId}/files`,
                            visible: resolved => resolved.campaign.permissions.includes('viewFiles') && (resolved.campaign.source === CampaignSource.CUSTOM || resolved.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || resolved.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN),
                            panelRender: props => <Files title={t('files')} help={t('theseFilesArePubliclyAvailableViaHttpSo')} entity={props.resolved.campaign} entityTypeId="campaign" entitySubTypeId="file" managePermission="manageFiles"/>
                        },
                        attachments: {
                            title: t('attachments'),
                            link: params => `/campaigns/${params.campaignId}/attachments`,
                            visible: resolved => resolved.campaign.permissions.includes('viewAttachments'),
                            panelRender: props => <Files title={t('attachments')} help={t('theseFilesWillBeAttachedToTheCampaign')} entity={props.resolved.campaign} entityTypeId="campaign" entitySubTypeId="attachment" managePermission="manageAttachments"/>
                        },
                        triggers: {
                            title: t('triggers'),
                            link: params => `/campaigns/${params.campaignId}/triggers/`,
                            visible: resolved => resolved.campaign.type === CampaignType.TRIGGERED && resolved.campaign.permissions.includes('viewTriggers'),
                            panelRender: props => <TriggersList campaign={props.resolved.campaign} />,
                            children: {
                                ':triggerId([0-9]+)': {
                                    title: resolved => t('triggerName', {name: resolved.trigger.name}),
                                    resolve: {
                                        trigger: params => `rest/triggers/${params.campaignId}/${params.triggerId}`,
                                    },
                                    link: params => `/campaigns/${params.campaignId}/triggers/${params.triggerId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('edit'),
                                            link: params => `/campaigns/${params.campaignId}/triggers/${params.triggerId}/edit`,
                                            panelRender: props => <TriggersCUD action={props.match.params.action} entity={props.resolved.trigger} campaign={props.resolved.campaign} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('create'),
                                    panelRender: props => <TriggersCUD action="create" campaign={props.resolved.campaign} />
                                }
                            }
                        },
                        share: {
                            title: t('share'),
                            link: params => `/campaigns/${params.campaignId}/share`,
                            visible: resolved => resolved.campaign.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.campaign} entityTypeId="campaign" />
                        }
                    }
                },
                'create-regular': {
                    title: t('createRegularCampaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.REGULAR} />
                },
                'create-rss': {
                    title: t('createRssCampaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.RSS} />
                },
                'create-triggered': {
                    title: t('createTriggeredCampaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.TRIGGERED} />
                }
            }
        }
    };
}

export default {
    getMenus
}
