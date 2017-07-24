'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import axios from '../lib/axios';

@translate()
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
        const id = parseInt(this.props.match.params.id);
        const outputResp = await axios.get(`/rest/report-output/${id}`);
        const reportResp = await axios.get(`/rest/reports/${id}`);

        this.setState({
            output: outputResp.data,
            report: reportResp.data,
        });
    }

    componentDidMount() {
        this.loadOutput();
    }

    render() {
        const t = this.props.t;

        if (this.state.report) {
            return (
                <div>
                    <Title>{t('Output for report {{name}}', { name: this.state.report.name })}</Title>

                    <pre>{this.state.output}</pre>
                </div>
            );
        } else {
            return <div>{t('Loading report output ...')}</div>;
        }

    }
}
