'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {Table} from '../lib/table';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import moment from 'moment';
import axios from '../lib/axios';
import {ReportState} from '../../../shared/reports';
import {Icon} from "../lib/bootstrap-components";
import {getUrl} from "../lib/urls";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";
import PropTypes from 'prop-types';

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

    static propTypes = {
        permissions: PropTypes.object
    }

    @withAsyncErrorHandler
    async stop(table, id) {
        await axios.post(getUrl(`rest/report-stop/${id}`));
        table.refresh();
    }

    @withAsyncErrorHandler
    async start(table, id) {
        await axios.post(getUrl(`rest/report-start/${id}`));
        table.refresh();
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createReport && permissions.executeReportTemplate;
        const templatesPermitted = permissions.createReportTemplate || permissions.viewReportTemplate;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('template') },
            { data: 3, title: t('description') },
            { data: 4, title: t('created'), render: data => data ? moment(data).fromNow() : '' },
            { data: 5, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[8];
                    const permsReportTemplate = data[9];

                    let viewContent, startStop, refreshTimeout;

                    const state = data[6];
                    const id = data[0];
                    const mimeType = data[7];

                    if (state === ReportState.PROCESSING || state === ReportState.SCHEDULED) {
                        viewContent = {
                            label: <Icon icon="hourglass" title={t('processing-2')}/>,
                        };

                        startStop = {
                            label: <Icon icon="stop" title={t('stop')}/>,
                            action: (table) => this.stop(table, id)
                        };

                        refreshTimeout = 1000;
                    } else if (state === ReportState.FINISHED) {
                        if (mimeType === 'text/html') {
                            viewContent = {
                                label: <Icon icon="eye" title={t('view')}/>,
                                link: `/reports/${id}/view`
                            };
                        } else if (mimeType === 'text/csv') {
                            viewContent = {
                                label: <Icon icon="file-download" title={t('download')}/>,
                                href: getUrl(`rpts/${id}/download`)
                            };
                        }

                        startStop = {
                            label: <Icon icon="redo" title={t('refreshReport')}/>,
                            action: (table) => this.start(table, id)
                        };

                    } else if (state === ReportState.FAILED) {
                        viewContent = {
                            label: <Icon icon="thumbs-down" title={t('reportGenerationFailed')}/>,
                        };

                        startStop = {
                            label: <Icon icon="redo" title={t('regenerateReport')}/>,
                            action: (table) => this.start(table, id)
                        };
                    }

                    if (perms.includes('viewContent')) {
                        actions.push(viewContent);
                    }

                    if (perms.includes('viewOutput')) {
                        actions.push(
                            {
                                label: <Icon icon="tv" title={t('viewConsoleOutput')}/>,
                                link: `/reports/${id}/output`
                            }
                        );
                    }

                    if (perms.includes('execute') && permsReportTemplate.includes('execute')) {
                        actions.push(startStop);
                    }

                    if (perms.includes('edit') && permsReportTemplate.includes('execute')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/reports/${id}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/reports/${id}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/reports/${data[0]}`, data[1], t('deletingReport'), t('reportDeleted'));

                    return { refreshTimeout, actions };
                }
            }
        ];


        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    {createPermitted &&
                        <LinkButton to="/reports/create" className="btn-primary" icon="plus" label={t('createReport')}/>
                    }
                    {templatesPermitted &&
                        <LinkButton to="/reports/templates" className="btn-primary" label={t('reportTemplates')}/>
                    }
                </Toolbar>

                <Title>{t('reports')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/reports-table" columns={columns} />
            </div>
        );
    }
}