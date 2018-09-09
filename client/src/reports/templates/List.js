'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {DropdownMenu, Icon} from '../../lib/bootstrap-components';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, MenuLink } from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import moment from 'moment';
import mailtrainConfig from 'mailtrainConfig';
import {checkPermissions} from "../../lib/permissions";

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
        const result = await checkPermissions({
            createReportTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createReportTemplate']
            }
        });

        this.setState({
            createPermitted: result.data.createReportTemplate && mailtrainConfig.globalPermissions.includes('createJavascriptWithROAccess')
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
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
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/reports/templates/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
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
                            <MenuLink to="/reports/templates/create">{t('Blank')}</MenuLink>
                            <MenuLink to="/reports/templates/create/subscribers-all">{t('All Subscribers')}</MenuLink>
                            <MenuLink to="/reports/templates/create/subscribers-grouped">{t('Grouped Subscribers')}</MenuLink>
                            <MenuLink to="/reports/templates/create/export-list-csv">{t('Export List as CSV')}</MenuLink>
                        </DropdownMenu>
                    </Toolbar>
                }

                <Title>{t('Report Templates')}</Title>

                <Table withHeader dataUrl="rest/report-templates-table" columns={columns} />
            </div>
        );
    }
}