'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import CUD from './CUD';
import List from './List';
import Share from '../shares/Share';

const getStructure = t => ({
    '': {
        title: t('Home'),
        externalLink: '/',
        children: {
            namespaces: {
                title: t('Namespaces'),
                link: '/namespaces',
                component: List,
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
                                render: props => <CUD action={props.match.params.action} entity={props.resolved.namespace} />
                            },
                            share: {
                                title: t('Share'),
                                link: params => `/namespaces/${params.namespaceId}/share`,
                                visible: resolved => resolved.namespace.permissions.includes('share'),
                                render: props => <Share title={t('Share')} entity={props.resolved.namespace} entityTypeId="namespace" />
                            }
                        }
                    },
                    create: {
                        title: t('Create'),
                        render: props => <CUD action="create" />
                    },
                }
            }
        }
    }
});

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/namespaces' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


