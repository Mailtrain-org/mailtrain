'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { TreeTableSelect } from './form';


@translate()
class NamespaceSelect extends Component {
    render() {
        const t = this.props.t;

        return (
            <TreeTableSelect id="namespace" label={t('Namespace')} dataUrl="/rest/namespaces-tree"/>
        );
    }
}

function validateNamespace(t, state) {
    if (!state.getIn(['namespace', 'value'])) {
        state.setIn(['namespace', 'error'], t('Namespace must be selected'));
    } else {
        state.setIn(['namespace', 'error'], null);
    }
}

export {
    NamespaceSelect,
    validateNamespace
};