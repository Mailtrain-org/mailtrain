'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../../lib/page';
import {AlignedRow} from '../../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import {getImportLabels} from './helpers';
import axios from "../../lib/axios";
import {getUrl} from "../../lib/urls";
import moment from "moment";
import {runStatusInProgress} from "../../../../shared/imports";
import {Table} from "../../lib/table";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Status extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: props.entity
        };

        const {importSourceLabels, importStatusLabels, runStatusLabels} = getImportLabels(props.t);
        this.importSourceLabels = importSourceLabels;
        this.importStatusLabels = importStatusLabels;
        this.runStatusLabels = runStatusLabels;

        this.refreshTimeoutHandler = ::this.periodicRefreshTask;
        this.refreshTimeoutId = 0;
    }

    static propTypes = {
        entity: PropTypes.object,
        imprt: PropTypes.object,
        list: PropTypes.object
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        const resp = await axios.get(getUrl(`rest/import-runs/${this.props.list.id}/${this.props.imprt.id}/${this.props.entity.id}`));
        this.setState({
            entity: resp.data
        });

        if (this.failedTableNode) {
            this.failedTableNode.refresh();
        }
    }

    async periodicRefreshTask() {
        if (runStatusInProgress(this.state.entity.status)) {
            await this.refreshEntity();
            if (this.refreshTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
                this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 2000);
            }
        }
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.periodicRefreshTask();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutHandler = null;
    }

    render() {
        const t = this.props.t;
        const entity = this.state.entity;
        const imprt = this.props.imprt;

        const columns = [
            { data: 1, title: t('row') },
            { data: 2, title: t('email') },
            { data: 3, title: t('reason'), render: data => t(...JSON.parse(data)) }
        ];

        return (
            <div>
                <Title>{t('importRunStatus')}</Title>

                <AlignedRow label={t('importName')}>{imprt.name}</AlignedRow>
                <AlignedRow label={t('importSource')}>{this.importSourceLabels[imprt.source]}</AlignedRow>
                <AlignedRow label={t('runStarted')}>{moment(entity.created).fromNow()}</AlignedRow>
                {entity.finished && <AlignedRow label={t('runFinished')}>{moment(entity.finished).fromNow()}</AlignedRow>}
                <AlignedRow label={t('runStatus')}>{this.runStatusLabels[entity.status]}</AlignedRow>
                <AlignedRow label={t('processedEntries')}>{entity.processed}</AlignedRow>
                <AlignedRow label={t('newEntries')}>{entity.new}</AlignedRow>
                <AlignedRow label={t('failedEntries')}>{entity.failed}</AlignedRow>
                {entity.error && <AlignedRow label={t('error')}><pre>{entity.error}</pre></AlignedRow>}

                <hr/>
                <h3>{t('failedRows')}</h3>
                <Table ref={node => this.failedTableNode = node} withHeader dataUrl={`rest/import-run-failed-table/${this.props.list.id}/${this.props.imprt.id}/${this.props.entity.id}`} columns={columns} />

            </div>
        );
    }
}