'use strict';

import React from 'react';
import CUD from './CUD';
import List from './List';
import Share from '../shares/Share';

function getMenus(t) {
    return {
        namespaces: {
            title: t('Namespaces'),
            link: '/namespaces',
            panelComponent: List,
            children: {
                ':namespaceId([0-9]+)': {
                    title: resolved => t('Namespace "{{name}}"', {name: resolved.namespace.name}),
                    resolve: {
                        namespace: params => `/rest/namespaces/${params.namespaceId}`
                    },
                    link: params => `/namespaces/${params.namespaceId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('Edit'),
                            link: params => `/namespaces/${params.namespaceId}/edit`,
                            visible: resolved => resolved.namespace.permissions.includes('edit'),
                            panelRender: props => <CUD action={props.match.params.action} entity={props.resolved.namespace} />
                        },
                        share: {
                            title: t('Share'),
                            link: params => `/namespaces/${params.namespaceId}/share`,
                            visible: resolved => resolved.namespace.permissions.includes('share'),
                            panelRender: props => <Share title={t('Share')} entity={props.resolved.namespace} entityTypeId="namespace" />
                        }
                    }
                },
                create: {
                    title: t('Create'),
                    panelRender: props => <CUD action="create" />
                },
            }
        }
    };
}


export default {
    getMenus
}
