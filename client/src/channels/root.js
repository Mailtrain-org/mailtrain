'use strict';

import React from 'react';
import CampaignsList from '../campaigns/List';
import CampaignsCUD from '../campaigns/CUD';
import ChannelsList from './List';
import ChannelsCUD from './CUD';
import Share from '../shares/Share';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers"
import {namespaceCheckPermissions} from "../lib/namespace";
import Clone from "../campaigns/Clone";
import {CampaignType} from "../../../shared/campaigns";

function getMenus(t) {
    const createLabels = {
        [CampaignType.REGULAR]: t('createRegularCampaign'),
        [CampaignType.RSS]: t('createRssCampaign'),
        [CampaignType.TRIGGERED]: t('createTriggeredCampaign')
    };

    return {
        'channels': {
            title: t('channels'),
            link: '/channels',
            checkPermissions: {
                createChannel: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createChannel']
                },
                createCampaign: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createCampaign']
                },
                ...namespaceCheckPermissions('createChannel'),
            },
            
            panelRender: props => <ChannelsList permissions={props.permissions}/>,
            children: {
                ':channelId([0-9]+)': {
                    title: resolved => t('channelName', {name: ellipsizeBreadcrumbLabel(resolved.channel.name)}),
                    resolve: {
                        channel: params => `rest/channels/${params.channelId}`
                    },
                    link: params => `/channels/${params.channelId}/campaigns`,
                    navs: {
                        campaigns: {
                            title: t('campaigns'),
                            link: params => `/channels/${params.channelId}/campaigns`,
                            visible: resolved => resolved.channel.permissions.includes('view'),
                            panelRender: props => <CampaignsList channel={props.resolved.channel} permissions={props.permissions} />
                        },
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/channels/${params.channelId}/edit`,
                            visible: resolved => resolved.channel.permissions.includes('view') || resolved.channel.permissions.includes('edit'),
                            panelRender: props => <ChannelsCUD action={props.match.params.action} entity={props.resolved.channel} permissions={props.permissions} />
                        },
                        share: {
                            title: t('share'),
                            link: params => `/channels/${params.channelId}/share`,
                            visible: resolved => resolved.channel.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.channel} entityTypeId="channel" />
                        }
                    },
                    children: {
                        create: {
                            title: t('createCampaign'),
                            link: params => `/channels/${params.channelId}/create`,
                            visible: resolved => resolved.channel.permissions.includes('createCampaign'),
                            panelRender: props => <CampaignsCUD action="create" createFromChannel={props.resolved.channel} permissions={props.permissions} />,
                        },
                        'clone': {
                            title: t('createCampaign'),
                            link: params => `/channels/${params.channelId}/clone`,
                            panelRender: props => <Clone cloneFromChannel={props.resolved.channel}/>,
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
                },
                'create': {
                    title: t('createChannel'),
                    panelRender: props => <ChannelsCUD action="create" permissions={props.permissions} />
                }
            }
        }
    };
}

export default {
    getMenus
}
