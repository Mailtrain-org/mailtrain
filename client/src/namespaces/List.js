'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { TreeTable } from '../lib/tree';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import axios from '../lib/axios';
import {Icon} from "../lib/bootstrap-components";
import {checkPermissions} from "../lib/permissions";
import {
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../lib/modals";
import {getGlobalNamespaceId} from "../../../shared/namespaces";

@translate()
@withErrorHandling
@withPageHelpers
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableDeleteDialogInit(this);
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createNamespace: {
                entityTypeId: 'namespace',
                requiredOperations: ['createNamespace']
            }
        });

        this.setState({
            createPermitted: result.data.createNamespace
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const actions = node => {
            const actions = [];

            if (node.data.permissions.includes('edit')) {
                actions.push({
                    label: <Icon icon="edit" title={t('Edit')}/>,
                    link: `/namespaces/${node.key}/edit`
                });
            }

            if (node.data.permissions.includes('share')) {
                actions.push({
                    label: <Icon icon="share-alt" title={t('Share')}/>,
                    link: `/namespaces/${node.key}/share`
                });
            }

            if (Number.parseInt(node.key) !== getGlobalNamespaceId()) {
                tableDeleteDialogAddDeleteButton(actions, this, node.data.permissions, node.key, node.data.unsanitizedTitle);
            }

            return actions;
        };

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/namespaces`, t('Deleting namespace ...'), t('Namespace deleted'))}
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                    </Toolbar>
                }

                <Title>{t('Namespaces')}</Title>

                <TreeTable ref={node => this.table = node} withHeader withDescription dataUrl="rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
