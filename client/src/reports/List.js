'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { Table } from '../lib/table';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import moment from 'moment';
import axios from '../lib/axios';
import { ReportState } from '../../../shared/reports';

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
            createReport: {
                entityTypeId: 'namespace',
                requiredOperations: ['createReport']
            },
            executeReportTemplate: {
                entityTypeId: 'reportTemplate',
                requiredOperations: ['execute']
            },
            createReportTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createReportTemplate']
            },
            viewReportTemplate: {
                entityTypeId: 'reportTemplate',
                requiredOperations: ['view']
            },
        };

        const result = await axios.post('/rest/permissions-check', request);

        this.setState({
            createPermitted: result.data.createReport && result.data.executeReportTemplate,
            templatesPermitted: result.data.createReportTemplate || result.data.viewReportTemplate
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    @withAsyncErrorHandler
    async stop(table, id) {
        await axios.post(`/rest/report-stop/${id}`);
        table.refresh();
    }

    @withAsyncErrorHandler
    async start(table, id) {
        await axios.post(`/rest/report-start/${id}`);
        table.refresh();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Template') },
            { data: 3, title: t('Description') },
            { data: 4, title: t('Created'), render: data => data ? moment(data).fromNow() : '' },
            { data: 5, title: t('Namespace') },
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
                            label: <span className="glyphicon glyphicon-hourglass" aria-hidden="true" title="Processing"></span>,
                        };

                        startStop = {
                            label: <span className="glyphicon glyphicon-stop" aria-hidden="true" title="Stop"></span>,
                            action: (table) => this.stop(table, id)
                        };

                        refreshTimeout = 1000;
                    } else if (state === ReportState.FINISHED) {
                        if (mimeType === 'text/html') {
                            viewContent = {
                                label: <span className="glyphicon glyphicon-eye-open" aria-hidden="true" title="View"></span>,
                                link: `/reports/${id}/view`
                            };
                        } else if (mimeType === 'text/csv') {
                            viewContent = {
                                label: <span className="glyphicon glyphicon-download-alt" aria-hidden="true" title="Download"></span>,
                                href: `/reports/${id}/download`
                            };
                        }

                        startStop = {
                            label: <span className="glyphicon glyphicon-repeat" aria-hidden="true" title="Refresh report"></span>,
                            action: (table) => this.start(table, id)
                        };

                    } else if (state === ReportState.FAILED) {
                        viewContent = {
                            label: <span className="glyphicon glyphicon-thumbs-down" aria-hidden="true" title="Report generation failed"></span>,
                        };

                        startStop = {
                            label: <span className="glyphicon glyphicon-repeat" aria-hidden="true" title="Regenerate report"></span>,
                            action: (table) => this.start(table, id)
                        };
                    }

                    if (perms.includes('viewContent')) {
                        actions.push(viewContent);
                    }

                    if (perms.includes('viewOutput')) {
                        actions.push(
                            {
                                label: <span className="glyphicon glyphicon-modal-window" aria-hidden="true" title="View console output"></span>,
                                link: `/reports/${id}/output`
                            }
                        );
                    }

                    if (perms.includes('execute') && permsReportTemplate.includes('execute')) {
                        actions.push(startStop);
                    }

                    if (perms.includes('edit') && permsReportTemplate.includes('execute')) {
                        actions.push({
                            label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                            link: `/reports/${id}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <span className="glyphicon glyphicon-share-alt" aria-hidden="true" title="Share"></span>,
                            link: `/reports/${id}/share`
                        });
                    }

                    return { refreshTimeout, actions };
                }
            }
        ];


        return (
            <div>
                <Toolbar>
                    {this.state.createPermitted &&
                        <NavButton linkTo="/reports/create" className="btn-primary" icon="plus" label={t('Create Report')}/>
                    }
                    {this.state.templatesPermitted &&
                        <NavButton linkTo="/reports/templates" className="btn-primary" label={t('Report Templates')}/>
                    }
                </Toolbar>

                <Title>{t('Reports')}</Title>

                <Table withHeader dataUrl="/rest/reports-table" columns={columns} />
            </div>
        );
    }
}