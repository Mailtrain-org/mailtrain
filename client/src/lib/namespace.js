'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import {TreeTableSelect} from './form';
import {withComponentMixins} from "./decorator-helpers";
import mailtrainConfig from 'mailtrainConfig';


@withComponentMixins([
    withTranslation
])
export class NamespaceSelect extends Component {
    render() {
        const t = this.props.t;

        return (
            <TreeTableSelect id="namespace" label={t('namespace')} dataUrl="rest/namespaces-tree"/>
        );
    }
}

export function validateNamespace(t, state) {
    if (!state.getIn(['namespace', 'value'])) {
        state.setIn(['namespace', 'error'], t('namespaceMustBeSelected'));
    } else {
        state.setIn(['namespace', 'error'], null);
    }
}

export function getDefaultNamespace(permissions) {
    return permissions.viewUsersNamespace && permissions.createEntityInUsersNamespace ? mailtrainConfig.user.namespace : null;
}

export function namespaceCheckPermissions(createOperation) {
    if (mailtrainConfig.user) {
        return {
            createEntityInUsersNamespace: {
                entityTypeId: 'namespace',
                entityId: mailtrainConfig.user.namespace,
                requiredOperations: [createOperation]
            },
            viewUsersNamespace: {
                entityTypeId: 'namespace',
                entityId: mailtrainConfig.user.namespace,
                requiredOperations: ['view']
            }
        };
    } else {
        return {};
    }
}
