'use strict';

import React from 'react';

import CampaignsCUD from './CUD';
import Content from './Content';
import CampaignsList from './List';
import Share from '../shares/Share';
import Files from "../lib/files";
import {
    CampaignSource,
    CampaignType
} from "../../../shared/campaigns";
import TriggersCUD from './triggers/CUD';
import TriggersList from './triggers/List';


function getMenus(t) {
    return {
        'campaigns': {
            title: t('Campaigns'),
            link: '/campaigns',
            panelComponent: CampaignsList,
            children: {
                ':campaignId([0-9]+)': {
                    title: resolved => t('Campaign "{{name}}"', {name: resolved.campaign.name}),
                    resolve: {
                        campaign: params => `rest/campaigns-settings/${params.campaignId}`
                    },
                    link: params => `/campaigns/${params.campaignId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('Edit'),
                            link: params => `/campaigns/${params.campaignId}/edit`,
                            visible: resolved => resolved.campaign.permissions.includes('edit'),
                            panelRender: props => <CampaignsCUD action={props.match.params.action} entity={props.resolved.campaign} />
                        },
                        content: {
                            title: t('Content'),
                            link: params => `/campaigns/${params.campaignId}/content`,
                            resolve: {
                                campaignContent: params => `rest/campaigns-content/${params.campaignId}`
                            },
                            visible: resolved => resolved.campaign.permissions.includes('edit') && (resolved.campaign.source === CampaignSource.CUSTOM || resolved.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || resolved.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN),
                            panelRender: props => <Content entity={props.resolved.campaignContent} />
                        },
                        files: {
                            title: t('Files'),
                            link: params => `/campaigns/${params.campaignId}/files`,
                            visible: resolved => resolved.campaign.permissions.includes('viewFiles') && (resolved.campaign.source === CampaignSource.CUSTOM || resolved.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || resolved.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN),
                            panelRender: props => <Files title={t('Files')} help={t('These files are publicly available via HTTP so that they can be linked to from the content of the campaign.')} entity={props.resolved.campaign} entityTypeId="campaign" entitySubTypeId="file" managePermission="manageFiles"/>
                        },
                        attachments: {
                            title: t('Attachments'),
                            link: params => `/campaigns/${params.campaignId}/attachments`,
                            visible: resolved => resolved.campaign.permissions.includes('viewAttachments'),
                            panelRender: props => <Files title={t('Attachments')} help={t('These files will be attached to the campaign emails as proper attachments. This means they count towards to resulting eventual size of the email.')} entity={props.resolved.campaign} entityTypeId="campaign" entitySubTypeId="attachment" managePermission="manageAttachments"/>
                        },
                        triggers: {
                            title: t('Triggers'),
                            link: params => `/campaigns/${params.campaignId}/triggers/`,
                            visible: resolved => resolved.campaign.type === CampaignType.TRIGGERED && resolved.campaign.permissions.includes('viewTriggers'),
                            panelRender: props => <TriggersList campaign={props.resolved.campaign} />,
                            children: {
                                ':triggerId([0-9]+)': {
                                    title: resolved => t('Trigger "{{name}}"', {name: resolved.trigger.name}),
                                    resolve: {
                                        trigger: params => `rest/triggers/${params.campaignId}/${params.triggerId}`,
                                    },
                                    link: params => `/campaigns/${params.campaignId}/triggers/${params.triggerId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('Edit'),
                                            link: params => `/campaigns/${params.campaignId}/triggers/${params.triggerId}/edit`,
                                            panelRender: props => <TriggersCUD action={props.match.params.action} entity={props.resolved.trigger} campaign={props.resolved.campaign} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    panelRender: props => <TriggersCUD action="create" campaign={props.resolved.campaign} />
                                }
                            }
                        },
                        share: {
                            title: t('Share'),
                            link: params => `/campaigns/${params.campaignId}/share`,
                            visible: resolved => resolved.campaign.permissions.includes('share'),
                            panelRender: props => <Share title={t('Share')} entity={props.resolved.campaign} entityTypeId="campaign" />
                        }
                    }
                },
                'create-regular': {
                    title: t('Create Regular Campaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.REGULAR} />
                },
                'create-rss': {
                    title: t('Create RSS Campaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.RSS} />
                },
                'create-triggered': {
                    title: t('Create Triggered Campaign'),
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.TRIGGERED} />
                }
            }
        }
    };
}

export default {
    getMenus
}
