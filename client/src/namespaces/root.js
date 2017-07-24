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
                    edit : {
                        title: t('Edit Namespace'),
                        params: [':id', ':action?'],
                        render: props => (<CUD edit {...props} />)
                    },
                    create : {
                        title: t('Create Namespace'),
                        render: props => (<CUD {...props} />)
                    },
                    share: {
                        title: t('Share Namespace'),
                        params: [':id'],
                        render: props => (<Share title={entity => t('Share Namespace "{{name}}"', {name: entity.name})} getUrl={id => `/rest/namespaces/${id}`} entityTypeId="namespace" {...props} />)
                    }
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


