'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import CUD from './CUD';
import List from './List';
import UserShares from '../shares/UserShares';

function getMenus(t) {
    return {
        'users': {
            title: t('Users'),
            link: '/users',
            panelComponent: List,
            children: {
                ':userId([0-9]+)': {
                    title: resolved => t('User "{{name}}"', {name: resolved.user.name}),
                    resolve: {
                        user: params => `rest/users/${params.userId}`
                    },
                    link: params => `/users/${params.userId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('Edit'),
                            link: params => `/users/${params.userId}/edit`,
                            panelRender: props => <CUD action={props.match.params.action} entity={props.resolved.user} />
                        },
                        shares: {
                            title: t('Shares'),
                            link: params => `/users/${params.userId}/shares`,
                            panelRender: props => <UserShares user={props.resolved.user} />
                        }
                    }
                },
                create: {
                    title: t('Create'),
                    panelRender: props => <CUD action="create" />
                },
            }
        }
    };
};

export default {
    getMenus
}
