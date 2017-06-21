'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page'
import CUD from './CUD'
import List from './List'

const getStructure = t => ({
    '': {
        title: t('Home'),
        externalLink: '/',
        children: {
            'users': {
                title: t('Users'),
                link: '/users',
                component: List,
                children: {
                    'edit' : {
                        title: t('Edit User'),
                        params: [':id', ':action?'],
                        render: props => (<CUD edit {...props} />)
                    },
                    'create' : {
                        title: t('Create User'),
                        render: props => (<CUD {...props} />)
                    }
                }
            }
        }
    }
});

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/users' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


