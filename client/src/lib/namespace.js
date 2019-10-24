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
    static defaultProps = {
        namespaceFilter: null
    }

    render() {
        const t = this.props.t;
        return (
            <TreeTableSelect id="namespace" label={t('namespace')} dataUrl="rest/namespaces-tree" namespaceFilter={this.props.namespaceFilter}/>
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

export function getNamespaceFilterId() {
    const localStorage = window.localStorage;
    return localStorage.getItem('namespaceFilterId');
}

export function getNamespaceFilterName() {
    const localStorage = window.localStorage;
    return localStorage.getItem('namespaceFilterName');
}

export function clearNamespaceFilter() {
    const localStorage = window.localStorage;
    localStorage.removeItem('namespaceFilterId');
    localStorage.removeItem('namespaceFilterName');
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

export function processNamespaceFilterOnTree(tree, topNamespace){
    var namespaceTree = [];
    function process_node(node, namespaceTree, topNamespace){
        if(node){
            var found = false;
            if(node.key == topNamespace){
                namespaceTree.push(node);
                found = true;
            }
            if(node.children && !found){
                for(const key in node.children){
                    process_node(node.children[key], namespaceTree, topNamespace);
                } 
            }
        }
    }
    process_node(tree, namespaceTree, topNamespace);
    return namespaceTree;
}

export const NamespaceFilterContext = React.createContext()

export class NamespaceFilterProvider extends Component {

    state = {
       namespaceId : null,
       namespaceName: "Namespace Filter",
       setNamespace: (id, name) => {
            this.setState({namespaceId: id, namespaceName: name})
       }
    }
   
    render() {
       return <NamespaceFilterContext.Provider value={this.state}>
         {this.props.children}
       </NamespaceFilterContext.Provider>
     }
}