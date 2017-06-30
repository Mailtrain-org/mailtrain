'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page'
import Account from './Account'

const getStructure = t => ({
    '': {
        title: t('Home'),
        externalLink: '/',
        children: {
            'account': {
                title: t('Account'),
                link: '/account',
                component: Account
            }
        }
    }
});

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/account' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


