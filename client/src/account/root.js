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


function getMenus(t) {
    const subPaths = {
        login: {
            title: t('Sign in'),
            link: '/account/login',
            panelComponent: Login,
        },
        api: {
            title: t('API'),
            link: '/account/api',
            panelComponent: API
        }
    };

    if (mailtrainConfig.isAuthMethodLocal) {
        subPaths.forgot = {
            title: t('Password reset'),
            extraParams: [':username?'],
            link: '/account/forgot',
            panelComponent: Reset
        };

        subPaths.reset = {
            title: t('Password reset'),
            extraParams: [':username', ':resetToken'],
            link: '/account/reset',
            panelComponent: ResetLink
        };
    }

    return {
        'account': {
            title: t('Account'),
            link: '/account',
            panelComponent: Account,

            children: subPaths
        }
    };
}

export default {
    getMenus
}
