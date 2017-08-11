'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { TreeTable } from '../lib/tree';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import axios from '../lib/axios';

@translate()
@withErrorHandling
@withPageHelpers
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const request = {
            createNamespace: {
                entityTypeId: 'namespace',
                requiredOperations: ['createNamespace']
            }
        };

        const result = await axios.post('/rest/permissions-check', request);

        this.setState({
            createPermitted: result.data.createNamespace
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const actions = node => {
            const actions = [];

            if (node.data.permissions.includes('edit')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                    link: `/namespaces/${node.key}/edit`
                });
            }

            if (node.data.permissions.includes('share')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-share-alt" aria-hidden="true" title="Share"></span>,
                    link: `/namespaces/${node.key}/share`
                });
            }

            return actions;
        };

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                    </Toolbar>
                }

                <Title>{t('Namespaces')}</Title>

                <TreeTable withHeader withDescription dataUrl="/rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
