'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { TreeTableSelect } from './form';


@translate()
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
        state.setIn(['namespace', 'error'], t('namespace.mustBeSelected'));
    } else {
        state.setIn(['namespace', 'error'], null);
    }
}

export {
    NamespaceSelect,
    validateNamespace
};