'use strict';

import React from 'react';
import CampaignsList from '../campaigns/List';
import CampaignsCUD from '../campaigns/CUD';
import ChannelsList from './List';
//import ChannelsCUD from './CUD';
import Share from '../shares/Share';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers"
import {namespaceCheckPermissions} from "../lib/namespace";

function getMenus(t) {
    return {
        'channels': {
            title: t('Channels'),
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
                            title: t('Campaigns'),
                            link: params => `/channels/${params.channelId}/campaigns`,
                            visible: resolved => resolved.channel.permissions.includes('view'),
                            panelRender: props => <CampaignsList channel={props.resolved.channel} />
                        },
                        /*
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/channels/${params.channelId}/edit`,
                            visible: resolved => resolved.channel.permissions.includes('view') || resolved.channel.permissions.includes('edit'),
                            panelRender: props => <ChannelsCUD action={props.match.params.action} entity={props.resolved.channel} permissions={props.permissions} />
                        },
                        */
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
                            panelRender: props => <CampaignsCUD action="create" channel={props.resolved.channel} permissions={props.permissions} />
                        }
                    }
                },
                'create': {
                    title: t('Create Channel'),
                    panelRender: props => <ChannelsCUD action="create" permissions={props.permissions} />
                }
            }
        }
    };
}

export default {
    getMenus
}
