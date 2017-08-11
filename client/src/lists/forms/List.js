'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const request = {
            createCustomForm: {
                entityTypeId: 'namespace',
                requiredOperations: ['createCustomForm']
            }
        };

        const result = await axios.post('/rest/permissions-check', request);

        this.setState({
            createPermitted: result.data.createCustomForm
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const actions = data => {
            const actions = [];
            const perms = data[4];

            if (perms.includes('edit')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                    link: `/lists/forms/${data[0]}/edit`
                });
            }
            if (perms.includes('share')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-share-alt" aria-hidden="true" title="Share"></span>,
                    link: `/lists/forms/${data[0]}/share`
                });
            }

            return actions;
        };

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Namespace') }
        ];

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/lists/forms/create" className="btn-primary" icon="plus" label={t('Create Custom Form')}/>
                    </Toolbar>
                }

                <Title>{t('Forms')}</Title>

                <Table withHeader dataUrl="/rest/forms-table" columns={columns} actions={actions} />
            </div>
        );
    }
}