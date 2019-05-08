'use strict';

import React from 'react';
import Login from './Login';
import Reset from './Forgot';
import ResetLink from './Reset';
import mailtrainConfig from 'mailtrainConfig';


function getMenus(t) {
    const subPaths = {}

    if (mailtrainConfig.isAuthMethodLocal) {
        subPaths.forgot = {
            title: t('passwordReset-1'),
            extraParams: [':username?'],
            link: '/login/forgot',
            panelComponent: Reset
        };

        subPaths.reset = {
            title: t('passwordReset-1'),
            extraParams: [':username', ':resetToken'],
            link: '/login/reset',
            panelComponent: ResetLink
        };
    }

    return {
        'login': {
            title: t('signIn'),
            link: '/login',
            panelComponent: Login,

            children: subPaths
        }
    };
}

export default {
    getMenus
}
