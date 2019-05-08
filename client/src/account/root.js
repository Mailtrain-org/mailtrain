'use strict';

import React from 'react';
import Account from './Account';
import API from './API';


function getMenus(t) {
    return {
        'account': {
            title: t('account'),
            link: '/account',
            panelComponent: Account,

            children: {
                api: {
                    title: t('api'),
                    link: '/account/api',
                    panelComponent: API
                }
            }
        }
    };
}

export default {
    getMenus
}
