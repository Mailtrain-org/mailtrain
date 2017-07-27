'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { Table } from '../lib/table';
import axios from '../lib/axios';
import mailtrainConfig from 'mailtrainConfig';

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class UserShares extends Component {
    constructor(props) {
        super(props);

        this.sharesTables = {};

        this.state = {
            userId: parseInt(props.match.params.id)
        };
    }

    @withAsyncErrorHandler
    async loadEntity() {
        const response = await axios.get(`/rest/users/${this.state.userId}`);
        this.setState({
            username: response.data.username
        });
    }

    @withAsyncErrorHandler
    async deleteShare(entityTypeId, entityId) {
        const data = {
            entityTypeId,
            entityId,
            userId: this.state.userId
        };

        await axios.put('/rest/shares', data);
        for (const key in this.sharesTables) {
            this.sharesTables[key].refresh();
        }
    }

    componentDidMount() {
        this.loadEntity();
    }

    render() {
        const renderSharesTable = (entityTypeId, title) => {
            const actions = data => {
                const actions = [];
                const perms = data[3];

                if (perms.includes('share')) {
                    actions.push({
                        label: 'Delete',
                        action: () => this.deleteShare(entityTypeId, data[2])
                    });
                }

                return actions;
            };

            const columns = [
                { data: 0, title: t('Name') },
                { data: 1, title: t('Role') }
            ];

            return (
                <div>
                    <h3>{title}</h3>
                    <Table ref={node => this.sharesTables[entityTypeId] = node} withHeader dataUrl={`/rest/shares-table-by-user/${entityTypeId}/${this.state.userId}`} columns={columns} actions={actions}/>
                </div>
            );
        };

        const t = this.props.t;

        return (
            <div>
                <Title>{t('Shares for user "{{username}}"', {username: this.state.username})}</Title>

                {renderSharesTable('namespace', t('Namespaces'))}
                {renderSharesTable('reportTemplate', t('Report Templates'))}
                {renderSharesTable('report', t('Reports'))}
            </div>
        );
    }
}
