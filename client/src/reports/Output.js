'use strict';

import React, { Component } from 'react';
import { withTranslation } from '../lib/i18n';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import axios from '../lib/axios';
import {getUrl} from "../lib/urls";

@withTranslation()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class Output extends Component {
    constructor(props) {
        super(props);

        this.state = {
            output: null
        };
    }

    @withAsyncErrorHandler
    async loadOutput() {
        const id = parseInt(this.props.match.params.reportId);
        const outputRespPromise = axios.get(getUrl(`rest/report-output/${id}`));
        const reportRespPromise = axios.get(getUrl(`rest/reports/${id}`));
        const [outputResp, reportResp] = await Promise.all([outputRespPromise, reportRespPromise]);

        this.setState({
            output: outputResp.data,
            report: reportResp.data,
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.loadOutput();
    }

    render() {
        const t = this.props.t;

        if (this.state.report) {
            return (
                <div>
                    <Title>{t('outputForReportName', { name: this.state.report.name })}</Title>

                    <pre>{this.state.output}</pre>
                </div>
            );
        } else {
            return <div>{t('loadingReportOutput')}</div>;
        }

    }
}
