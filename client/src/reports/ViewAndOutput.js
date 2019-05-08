'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page'
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import axios from '../lib/axios';
import {ReportState} from '../../../shared/reports';
import {getUrl} from "../lib/urls";
import {Button} from "../lib/bootstrap-components";
import PropTypes from "prop-types";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class ViewAndOutput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            content: null
        };

        this.reloadTimeoutHandler = ::this.loadContent;
        this.reloadTimeoutId = 0;

        const t = props.t;
        this.viewTypes = {
            view: {
                url: 'rest/report-content',
                getTitle: name => t('reportName', { name }),
                loading: t('loadingReport'),
                finishedStates: new Set([ReportState.FINISHED]),
                getContent: content => <div dangerouslySetInnerHTML={{ __html: content }}/>
            },
            output: {
                url: 'rest/report-output',
                getTitle: name => t('outputForReportName', { name }),
                loading: t('loadingReportOutput'),
                finishedStates: new Set([ReportState.FINISHED, ReportState.FAILED]),
                getContent: content => <pre>{content}</pre>
            }
        }
    }

    static propTypes = {
        viewType: PropTypes.string.isRequired
    }

    @withAsyncErrorHandler
    async loadContent() {
        const id = parseInt(this.props.match.params.reportId);
        const contentRespPromise = axios.get(getUrl(this.viewTypes[this.props.viewType].url + '/' + id));
        const reportRespPromise = axios.get(getUrl(`rest/reports/${id}`));
        const [contentResp, reportResp] = await Promise.all([contentRespPromise, reportRespPromise]);

        this.setState({
            content: contentResp.data,
            report: reportResp.data
        });

        const state = reportResp.data.state;

        if (state === ReportState.PROCESSING || state === ReportState.SCHEDULED) {
            if (this.reloadTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
                this.reloadTimeoutId = setTimeout(this.reloadTimeoutHandler, 1000);
            }
        }
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.loadContent();
    }

    componentWillUnmount() {
        clearTimeout(this.reloadTimeoutId);
        this.reloadTimeoutHandler = null;
    }


    @withAsyncErrorHandler
    async refresh() {
        const id = parseInt(this.props.match.params.reportId);
        await axios.post(getUrl(`rest/report-start/${id}`));

        // noinspection JSIgnoredPromiseFromCall
        this.loadContent();
    }

    render() {
        const t = this.props.t;
        const viewType = this.viewTypes[this.props.viewType];

        if (this.state.report) {
            let reportContent = null;

            if (viewType.finishedStates.has(this.state.report.state)) {
                reportContent = viewType.getContent(this.state.content);
            } else if (this.state.report.state === ReportState.SCHEDULED || this.state.report.state === ReportState.PROCESSING) {
                reportContent = <div className="alert alert-info" role="alert">{t('reportIsBeingGenerated')}</div>;
            } else {
                reportContent = <div className="alert alert-danger" role="alert">{t('reportNotGenerated')}</div>;
            }

            return (
                <div>
                    <Toolbar>
                        <Button className="btn-primary" icon="repeat" label={t('refresh')} onClickAsync={::this.refresh}/>
                    </Toolbar>

                    <Title>{viewType.getTitle(this.state.report.name)}</Title>

                    {reportContent}
                </div>
            );
        } else {
            return <div>{viewType.loading}</div>;
        }
    }
}
