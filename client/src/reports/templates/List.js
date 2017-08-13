'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { DropdownMenu } from '../../lib/bootstrap-components';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, DropdownLink } from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import moment from 'moment';
import mailtrainConfig from 'mailtrainConfig';

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
            createReportTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createReportTemplate']
            }
        };

        const result = await axios.post('/rest/permissions-check', request);

        this.setState({
            createPermitted: result.data.createReportTemplate && mailtrainConfig.globalPermissions.includes('createJavascriptWithROAccess')
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 4, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[5];

                    if (mailtrainConfig.globalPermissions.includes('createJavascriptWithROAccess') && perms.includes('edit')) {
                        actions.push({
                            label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                            link: `/reports/templates/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <span className="glyphicon glyphicon-share-alt" aria-hidden="true" title="Share"></span>,
                            link: `/reports/templates/${data[0]}/share`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <DropdownMenu className="btn-primary" label={t('Create Report Template')}>
                            <DropdownLink to="/reports/templates/create">{t('Blank')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/subscribers-all">{t('All Subscribers')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/subscribers-grouped">{t('Grouped Subscribers')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/export-list-csv">{t('Export List as CSV')}</DropdownLink>
                        </DropdownMenu>
                    </Toolbar>
                }

                <Title>{t('Report Templates')}</Title>

                <Table withHeader dataUrl="/rest/report-templates-table" columns={columns} />
            </div>
        );
    }
}