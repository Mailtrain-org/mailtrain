'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../../lib/page';
import {AlignedRow} from '../../lib/form';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../../lib/error-handling';
import {getImportTypes} from './helpers';
import axios from "../../lib/axios";
import {getUrl} from "../../lib/urls";
import moment from "moment";
import {runStatusInProgress} from "../../../../shared/imports";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class Status extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: props.entity
        };

        const {importTypeLabels, importStatusLabels, runStatusLabels} = getImportTypes(props.t);
        this.importTypeLabels = importTypeLabels;
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
    }

    async periodicRefreshTask() {
        if (runStatusInProgress(this.state.entity.status)) {
            await this.refreshEntity();
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 2000);
        }
    }

    componentDidMount() {
        this.periodicRefreshTask();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
    }

    render() {
        const t = this.props.t;
        const entity = this.state.entity;
        const imprt = this.props.imprt;

       return (
            <div>
                <Title>{t('Import Run Status')}</Title>

                <AlignedRow label={t('Import name')}>{imprt.name}</AlignedRow>
                <AlignedRow label={t('Import type')}>{this.importTypeLabels[imprt.type]}</AlignedRow>
                <AlignedRow label={t('Run started')}>{moment(entity.created).fromNow()}</AlignedRow>
                {entity.finished && <AlignedRow label={t('Run finished')}>{moment(entity.finished).fromNow()}</AlignedRow>}
                <AlignedRow label={t('Run status')}>{this.runStatusLabels[entity.status]}</AlignedRow>
                <AlignedRow label={t('Processed entries')}>{entity.processed}</AlignedRow>
                <AlignedRow label={t('New entries')}>{entity.new}</AlignedRow>
                <AlignedRow label={t('Failed entries')}>{entity.failed}</AlignedRow>
                {entity.error && <AlignedRow label={t('Error')}><pre>{entity.error}</pre></AlignedRow>}
            </div>
        );
    }
}