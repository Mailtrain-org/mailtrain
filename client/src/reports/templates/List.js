'use strict';

import React, { Component } from 'react';
import { withTranslation } from '../../lib/i18n';
import {DropdownMenu, Icon} from '../../lib/bootstrap-components';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, MenuLink } from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import moment from 'moment';
import mailtrainConfig from 'mailtrainConfig';
import {checkPermissions} from "../../lib/permissions";
import {
    tableAddDeleteButton,
    tableRestActionDialogInit,
    tableRestActionDialogRender
} from "../../lib/modals";

@withTranslation()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableRestActionDialogInit(this);
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
            createPermitted: result.data.createReportTemplate && mailtrainConfig.globalPermissions.createJavascriptWithROAccess
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('created'), render: data => moment(data).fromNow() },
            { data: 4, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[5];

                    if (mailtrainConfig.globalPermissions.createJavascriptWithROAccess && perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/reports/templates/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('share')}/>,
                            link: `/reports/templates/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/report-templates/${data[0]}`, data[1], t('deletingReportTemplate'), t('reportTemplateDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.state.createPermitted &&
                    <Toolbar>
                        <DropdownMenu className="btn-primary" label={t('createReportTemplate')}>
                            <MenuLink to="/reports/templates/create">{t('blank')}</MenuLink>
                            <MenuLink to="/reports/templates/create/open-counts">{t('openCounts')}</MenuLink>
                            <MenuLink to="/reports/templates/create/open-counts-csv">{t('openCountsAsCsv')}</MenuLink>
                            <MenuLink to="/reports/templates/create/aggregated-open-counts">{t('aggregratedOpenCounts')}</MenuLink>
                        </DropdownMenu>
                    </Toolbar>
                }

                <Title>{t('reportTemplates')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/report-templates-table" columns={columns} />
            </div>
        );
    }
}