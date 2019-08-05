'use strict';

import React from 'react';
import CUD from './CUD';
import List from './List';
import Share from '../shares/Share';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers";
import {namespaceCheckPermissions} from "../lib/namespace";

function getMenus(t) {
    return {
        namespaces: {
            title: t('namespaces'),
            link: '/namespaces',
            checkPermissions: {
                createNamespace: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createNamespace']
                },
                ...namespaceCheckPermissions('createNamespace')
            },
            panelRender: props => <List permissions={props.permissions}/>,
            children: {
                ':namespaceId([0-9]+)': {
                    title: resolved => t('namespaceName', {name: ellipsizeBreadcrumbLabel(resolved.namespace.name)}),
                    resolve: {
                        namespace: params => `rest/namespaces/${params.namespaceId}`
                    },
                    link: params => `/namespaces/${params.namespaceId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/namespaces/${params.namespaceId}/edit`,
                            visible: resolved => resolved.namespace.permissions.includes('edit'),
                            panelRender: props => <CUD action={props.match.params.action} entity={props.resolved.namespace} permissions={props.permissions} />
                        },
                        share: {
                            title: t('share'),
                            link: params => `/namespaces/${params.namespaceId}/share`,
                            visible: resolved => resolved.namespace.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.namespace} entityTypeId="namespace" />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <CUD action="create" permissions={props.permissions} />
                },
            }
        }
    };
}


export default {
    getMenus
}
