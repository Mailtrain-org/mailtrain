'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../../lib/i18n';
import {ButtonDropdown, Icon} from '../../lib/bootstrap-components';
import {DropdownLink, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import moment from 'moment';
import mailtrainConfig from 'mailtrainConfig';
import {checkPermissions} from "../../lib/permissions";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../../lib/modals";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
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
                            label: <Icon icon="share" title={t('share')}/>,
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
                        <ButtonDropdown buttonClassName="btn-primary" menuClassName="dropdown-menu-right" label={t('createReportTemplate')}>
                            <DropdownLink to="/reports/templates/create">{t('blank')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/open-counts">{t('openCounts')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/open-counts-csv">{t('openCountsAsCsv')}</DropdownLink>
                            <DropdownLink to="/reports/templates/create/aggregated-open-counts">{t('aggregatedOpenCounts')}</DropdownLink>
                        </ButtonDropdown>
                    </Toolbar>
                }

                <Title>{t('reportTemplates')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/report-templates-table" columns={columns} />
            </div>
        );
    }
}