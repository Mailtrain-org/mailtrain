'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { Table } from '../lib/table';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import moment from 'moment';
import axios from '../lib/axios';
import { ReportState } from '../../../shared/reports';

@translate()
@withErrorHandling
@withPageHelpers
export default class List extends Component {

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

        const actions = data => {
            let view, startStop, refreshTimeout;

            const state = data[6];
            const id = data[0];
            const mimeType = data[7];
            
            if (state === ReportState.PROCESSING || state === ReportState.SCHEDULED) {
                view = {
                    label: <span className="glyphicon glyphicon-hourglass" aria-hidden="true" title="Processing"></span>,
                };

                startStop = {
                    label: <span className="glyphicon glyphicon-stop" aria-hidden="true" title="Stop"></span>,
                    action: (table) => this.stop(table, id)
                };

                refreshTimeout = 1000;
            } else if (state === ReportState.FINISHED) {
                if (mimeType === 'text/html') {
                    view = {
                        label: <span className="glyphicon glyphicon-eye-open" aria-hidden="true" title="View"></span>,
                        link: `reports/view/${id}`
                    };
                } else if (mimeType === 'text/csv') {
                    view = {
                        label: <span className="glyphicon glyphicon-download-alt" aria-hidden="true" title="Download"></span>,
                        href: `reports/download/${id}`
                    };
                }

                startStop = {
                    label: <span className="glyphicon glyphicon-repeat" aria-hidden="true" title="Refresh report"></span>,
                    action: (table) => this.start(table, id)
                };

            } else if (state === ReportState.FAILED) {
                view = {
                    label: <span className="glyphicon glyphicon-thumbs-down" aria-hidden="true" title="Report generation failed"></span>,
                };

                startStop = {
                    label: <span className="glyphicon glyphicon-repeat" aria-hidden="true" title="Regenerate report"></span>,
                    action: (table) => this.start(table, id)
                };
            }

            return {
                refreshTimeout,
                actions: [
                    view,
                    {
                        label: <span className="glyphicon glyphicon-modal-window" aria-hidden="true" title="View console output"></span>,
                        link: `reports/output/${id}`
                    },
                    startStop,
                    {
                        label: <span className="glyphicon glyphicon-wrench" aria-hidden="true" title="Edit"></span>,
                        link: `/reports/edit/${id}`
                    },
                    {
                        label: <span className="glyphicon glyphicon-share" aria-hidden="true" title="Share"></span>,
                        link: `/reports/share/${id}`
                    }
                ]
            };
        };

        const columns = [
            { data: 0, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('Template') },
            { data: 3, title: t('Description') },
            { data: 4, title: t('Created'), render: data => data ? moment(data).fromNow() : '' },
            { data: 5, title: t('Namespace') }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/reports/create" className="btn-primary" icon="plus" label={t('Create Report')}/>
                    <NavButton linkTo="/reports/templates" className="btn-primary" label={t('Report Templates')}/>
                </Toolbar>

                <Title>{t('Reports')}</Title>

                <Table withHeader dataUrl="/rest/reports-table" columns={columns} actions={actions} />
            </div>
        );
    }
}