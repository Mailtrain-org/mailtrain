'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import axios from '../lib/axios';
import { ReportState } from '../../../shared/reports';
import {getUrl} from "../lib/urls";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class View extends Component {
    constructor(props) {
        super(props);

        this.state = {
            content: null
        };
    }

    @withAsyncErrorHandler
    async loadContent() {
        const id = parseInt(this.props.match.params.id);
        const contentRespPromise = axios.get(getUrl(`rest/report-content/${id}`));
        const reportRespPromise = axios.get(getUrl(`rest/reports/${id}`));
        const [contentResp, reportResp] = await Promise.all([contentRespPromise, reportRespPromise]);

        this.setState({
            content: contentResp.data,
            report: reportResp.data
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.loadContent();
    }

    render() {
        const t = this.props.t;

        if (this.state.report) {
            if (this.state.report.state === ReportState.FINISHED) {
                return (
                    <div>
                        <Title>{t('Report {{name}}', { name: this.state.report.name })}</Title>

                        <div dangerouslySetInnerHTML={{ __html: this.state.content }}/>
                    </div>
                );
            } else {
                return <div className="alert alert-danger" role="alert">{t('Report not generated')}</div>;
            }
        } else {
            return <div>{t('Loading report ...')}</div>;
        }
    }
}
