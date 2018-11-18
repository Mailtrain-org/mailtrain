'use strict';

import React from 'react';
import Account from './Account';
import Login from './Login';
import Reset from './Forgot';
import ResetLink from './Reset';
import API from './API';
import mailtrainConfig from 'mailtrainConfig';


function getMenus(t) {
    const subPaths = {
        login: {
            title: t('signIn'),
            link: '/account/login',
            panelComponent: Login,
        },
        api: {
            title: t('api'),
            link: '/account/api',
            panelComponent: API
        }
    };

    if (mailtrainConfig.isAuthMethodLocal) {
        subPaths.forgot = {
            title: t('passwordReset-1'),
            extraParams: [':username?'],
            link: '/account/forgot',
            panelComponent: Reset
        };

        subPaths.reset = {
            title: t('passwordReset-1'),
            extraParams: [':username', ':resetToken'],
            link: '/account/reset',
            panelComponent: ResetLink
        };
    }

    return {
        'account': {
            title: t('account'),
            link: '/account',
            panelComponent: Account,

            children: subPaths
        }
    };
}

export default {
    getMenus
}
