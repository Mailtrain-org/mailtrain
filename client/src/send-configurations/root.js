'use strict';

import React from 'react';

import CUD from './CUD';
import List from './List';
import Share from '../shares/Share';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers";


function getMenus(t) {
    return {
        'send-configurations': {
            title: t('sendConfigurations-1'),
            link: '/send-configurations',
            panelComponent: List,
            children: {
                ':sendConfigurationId([0-9]+)': {
                    title: resolved => t('templateName', {name: ellipsizeBreadcrumbLabel(resolved.sendConfiguration.name)}),
                    resolve: {
                        sendConfiguration: params => `rest/send-configurations-private/${params.sendConfigurationId}`
                    },
                    link: params => `/send-configurations/${params.sendConfigurationId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/send-configurations/${params.sendConfigurationId}/edit`,
                            visible: resolved => resolved.sendConfiguration.permissions.includes('edit'),
                            panelRender: props => <CUD action={props.match.params.action} entity={props.resolved.sendConfiguration} />
                        },
                        share: {
                            title: t('share'),
                            link: params => `/send-configurations/${params.sendConfigurationId}/share`,
                            visible: resolved => resolved.sendConfiguration.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.sendConfiguration} entityTypeId="sendConfiguration" />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <CUD action="create" />
                }
            }
        }
    };
}

export default {
    getMenus
}
