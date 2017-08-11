'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import Account from './Account';
import Login from './Login';
import Reset from './Forgot';
import ResetLink from './Reset';
import API from './API';
import mailtrainConfig from 'mailtrainConfig';


const getStructure = t => {
    const subPaths = {
        login: {
            title: t('Sign in'),
            link: '/account/login',
            component: Login,
        },
        api: {
            title: t('API'),
            link: '/account/api',
            component: API
        }
    };

    if (mailtrainConfig.isAuthMethodLocal) {
        subPaths.forgot = {
            title: t('Password reset'),
                extraParams: [':username?'],
                link: '/account/forgot',
                component: Reset
        };

        subPaths.reset = {
            title: t('Password reset'),
                extraParams: [':username', ':resetToken'],
                link: '/account/reset',
                component: ResetLink
        };
    }

    return {
        '': {
            title: t('Home'),
            externalLink: '/',
            children: {
                account: {
                    title: t('Account'),
                    link: '/account',
                    component: Account,

                    children: subPaths

                }
            }
        }
    };
}

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/account/login' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


