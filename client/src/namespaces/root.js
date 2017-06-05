'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page'
import Create from './Create'
import Edit from './Edit'
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
                        component: Edit
                    },
                    'create' : {
                        title: t('Create Namespace'),
                        link: '/namespaces/create',
                        component: Create
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


