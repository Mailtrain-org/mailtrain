'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page'
import CreateOrEdit from './CreateOrEdit'
import List from './List'

const getStructure = t => ({
    '': {
        title: t('Home'),
        externalLink: '/',
        children: {
            'namespaces': {
                title: t('Namespaces'),
                link: '/namespaces',
                component: List,
                children: {
                    'edit' : {
                        title: t('Edit Namespace'),
                        params: [':nsId'],
                        render: props => (<CreateOrEdit edit {...props} />)
                    },
                    'create' : {
                        title: t('Create Namespace'),
                        link: '/namespaces/create',
                        render: props => (<CreateOrEdit {...props} />)
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


