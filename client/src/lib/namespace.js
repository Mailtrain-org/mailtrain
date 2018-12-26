'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import {TreeTableSelect} from './form';
import {withComponentMixins} from "./decorator-helpers";


@withComponentMixins([
    withTranslation
])
class NamespaceSelect extends Component {
    render() {
        const t = this.props.t;

        return (
            <TreeTableSelect id="namespace" label={t('namespace')} dataUrl="rest/namespaces-tree"/>
        );
    }
}

function validateNamespace(t, state) {
    if (!state.getIn(['namespace', 'value'])) {
        state.setIn(['namespace', 'error'], t('namespacemustBeSelected'));
    } else {
        state.setIn(['namespace', 'error'], null);
    }
}

export {
    NamespaceSelect,
    validateNamespace
};