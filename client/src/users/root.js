'use strict';

import React from 'react';
import CUD from './CUD';
import List from './List';
import UserShares from '../shares/UserShares';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers";
import {namespaceCheckPermissions} from "../lib/namespace";
import MosaicoCUD from "../templates/mosaico/CUD";

function getMenus(t) {
    return {
        'users': {
            title: t('users'),
            link: '/users',
            checkPermissions: {
                ...namespaceCheckPermissions('manageUsers')
            },
            panelComponent: List,
            children: {
                ':userId([0-9]+)': {
                    title: resolved => t('userName-1', {name: ellipsizeBreadcrumbLabel(resolved.user.name)}),
                    resolve: {
                        user: params => `rest/users/${params.userId}`
                    },
                    link: params => `/users/${params.userId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/users/${params.userId}/edit`,
                            panelRender: props => <CUD action={props.match.params.action} entity={props.resolved.user} permissions={props.permissions} />
                        },
                        shares: {
                            title: t('shares'),
                            link: params => `/users/${params.userId}/shares`,
                            panelRender: props => <UserShares user={props.resolved.user} />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <CUD action="create" permissions={props.permissions} />
                },
            }
        }
    };
};

export default {
    getMenus
}
