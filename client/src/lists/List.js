'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { Table } from '../lib/table';
import axios from '../lib/axios';

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
            createList: {
                entityTypeId: 'namespace',
                requiredOperations: ['createList']
            }
        };

        const result = await axios.post('/rest/permissions-check', request);

        this.setState({
            createPermitted: result.data.createList
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const actions = data => {
            const actions = [];
            const perms = data[6];

            if (perms.includes('edit')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                    link: `/lists/${data[0]}/edit`
                });
            }

            if (perms.includes('manageFields')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-th-list" aria-hidden="true" title="Manage Fields"></span>,
                    link: `/lists/${data[0]}/fields`
                });
            }

            if (perms.includes('share')) {
                actions.push({
                    label: <span className="glyphicon glyphicon-share-alt" aria-hidden="true" title="Share"></span>,
                    link: `/lists/${data[0]}/share`
                });
            }

            return actions;
        };

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Subscribers') },
            { data: 4, title: t('Description') },
            { data: 5, title: t('Namespace') }
        ];

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/lists/create" className="btn-primary" icon="plus" label={t('Create List')}/>
                        <NavButton linkTo="/lists/forms" className="btn-primary" label={t('Custom Forms')}/>
                    </Toolbar>
                }

                <Title>{t('Lists')}</Title>

                <Table withHeader dataUrl="/rest/lists-table" columns={columns} actions={actions} />
            </div>
        );
    }
}