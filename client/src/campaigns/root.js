'use strict';

import React from 'react';

import Status from './Status';
import Statistics from './Statistics';
import CampaignsCUD from './CUD';
import Content from './Content';
import CampaignsList from './List';
import Share from '../shares/Share';
import Files from "../lib/files";
import {CampaignSource, CampaignType} from "../../../shared/campaigns";
import TriggersCUD from './triggers/CUD';
import TriggersList from './triggers/List';
import StatisticsSubsList from "./StatisticsSubsList";
import {SubscriptionStatus} from "../../../shared/lists";
import StatisticsOpened from "./StatisticsOpened";
import StatisticsLinkClicks from "./StatisticsLinkClicks";
import {ellipsizeBreadcrumbLabel} from "../lib/helpers"
import {namespaceCheckPermissions} from "../lib/namespace";
import Clone from "./Clone";

function getMenus(t) {
    const aggLabels = {
        'countries': t('countries'),
        'devices': t('devices')
    };

    const createLabels = {
        [CampaignType.REGULAR]: t('createRegularCampaign'),
        [CampaignType.RSS]: t('createRssCampaign'),
        [CampaignType.TRIGGERED]: t('createTriggeredCampaign')
    };

    return {
        'campaigns': {
            title: t('campaigns'),
            link: '/campaigns',
            checkPermissions: {
                createCampaign: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createCampaign']
                },
                ...namespaceCheckPermissions('createCampaign')
            },
            panelRender: props => <CampaignsList permissions={props.permissions}/>,
            children: {
                ':campaignId([0-9]+)': {
                    title: resolved => t('campaignName', {name: ellipsizeBreadcrumbLabel(resolved.campaign.name)}),
                    resolve: {
                        campaign: params => `rest/campaigns-settings/${params.campaignId}`
                    },
                    link: params => `/campaigns/${params.campaignId}/status`,
                    navs: {
                        status: {
                            title: t('status'),
                            link: params => `/campaigns/${params.campaignId}/status`,
                            visible: resolved => resolved.campaign.permissions.includes('view'),
                            panelRender: props => <Status entity={props.resolved.campaign} />
                        },
                        statistics: {
                            title: t('statistics'),
                            link: params => `/campaigns/${params.campaignId}/statistics`,
                            visible: resolved => resolved.campaign.permissions.includes('viewStats'),
                            panelRender: props => <Statistics entity={props.resolved.campaign} />,
                            children: {
                                delivered: {
                                    title: t('delivered'),
                                    link: params => `/campaigns/${params.campaignId}/statistics/delivered`,
                                    panelRender: props => <StatisticsSubsList entity={props.resolved.campaign} title={t('deliveredEmails')} status={SubscriptionStatus.SUBSCRIBED} />
                                },
                                complained: {
                                    title: t('complained'),
                                    link: params => `/campaigns/${params.campaignId}/statistics/complained`,
                                    panelRender: props => <StatisticsSubsList entity={props.resolved.campaign} title={t('subscribersThatComplained')} status={SubscriptionStatus.COMPLAINED} />
                                },
                                bounced: {
                                    title: t('bounced'),
                                    link: params => `/campaigns/${params.campaignId}/statistics/bounced`,
                                    panelRender: props => <StatisticsSubsList entity={props.resolved.campaign} title={t('emailsThatBounced')} status={SubscriptionStatus.BOUNCED} />
                                },
                                unsubscribed: {
                                    title: t('unsubscribed'),
                                    link: params => `/campaigns/${params.campaignId}/statistics/unsubscribed`,
                                    panelRender: props => <StatisticsSubsList entity={props.resolved.campaign} title={t('subscribersThatUnsubscribed')} status={SubscriptionStatus.UNSUBSCRIBED} />
                                },
                                'opened': {
                                    title: t('opened'),
                                    resolve: {
                                        statisticsOpened: params => `rest/campaign-statistics/${params.campaignId}/opened`
                                    },
                                    link: params => `/campaigns/${params.campaignId}/statistics/opened/countries`,
                                    children: {
                                        ':agg(countries|devices)': {
                                            title: (resolved, params) => aggLabels[params.agg],
                                            link: params => `/campaigns/${params.campaignId}/statistics/opened/${params.agg}`,
                                            panelRender: props => <StatisticsOpened entity={props.resolved.campaign} statisticsOpened={props.resolved.statisticsOpened} agg={props.match.params.agg} />
                                        }
                                    }
                                },
                                'clicks': {
                                    title: t('clicks'),
                                    link: params => `/campaigns/${params.campaignId}/statistics/clicks`,
                                    panelRender: props => <StatisticsLinkClicks entity={props.resolved.campaign} />
                                }
                            }
                        },
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/campaigns/${params.campaignId}/edit`,
                            visible: resolved => resolved.campaign.permissions.includes('view') || resolved.campaign.permissions.includes('edit'),
                            panelRender: props => <CampaignsCUD action={props.match.params.action} entity={props.resolved.campaign} permissions={props.permissions} />
                        },
                        content: {
                            title: t('content'),
                            link: params => `/campaigns/${params.campaignId}/content`,
                            resolve: {
                                campaignContent: params => `rest/campaigns-content/${params.campaignId}`
                            },
                            visible: resolved => (resolved.campaign.permissions.includes('view') || resolved.campaign.permissions.includes('edit')) && (resolved.campaign.source === CampaignSource.CUSTOM || resolved.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || resolved.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN),
                            panelRender: props => <Content entity={props.resolved.campaignContent} setPanelInFullScreen={props.setPanelInFullScreen} />
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
                                    title: resolved => t('triggerName', {name: ellipsizeBreadcrumbLabel(resolved.trigger.name)}),
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
                    title: createLabels[CampaignType.REGULAR],
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.REGULAR} permissions={props.permissions} />
                },
                'create-rss': {
                    title: createLabels[CampaignType.RSS],
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.RSS} permissions={props.permissions} />
                },
                'create-triggered': {
                    title: createLabels[CampaignType.TRIGGERED],
                    panelRender: props => <CampaignsCUD action="create" type={CampaignType.TRIGGERED} permissions={props.permissions} />
                },
                'clone': {
                    title: t('createCampaign'),
                    link: params => `/campaigns/clone`,
                    panelRender: props => <Clone />,
                    children: {
                        ':existingCampaignId([0-9]+)': {
                            title: resolved => createLabels[resolved.existingCampaign.type],
                            resolve: {
                                existingCampaign: params => `rest/campaigns-settings/${params.existingCampaignId}`
                            },
                            panelRender: props => <CampaignsCUD action="create" createFromCampaign={props.resolved.existingCampaign} permissions={props.permissions} />
                        }
                    }
                }
            }
        }
    };
}

export default {
    getMenus
}
