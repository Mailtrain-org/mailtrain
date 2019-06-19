'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../../lib/page';
import {AlignedRow, ButtonRow} from '../../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import {getImportLabels} from './helpers';
import {prepFinishedAndNotInProgress, runInProgress, runStatusInProgress} from '../../../../shared/imports';
import {Table} from "../../lib/table";
import {Button, Icon} from "../../lib/bootstrap-components";
import axios from "../../lib/axios";
import {getUrl} from "../../lib/urls";
import moment from "moment";
import interoperableErrors from '../../../../shared/interoperable-errors';
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
        list: PropTypes.object
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        const resp = await axios.get(getUrl(`rest/imports/${this.props.list.id}/${this.props.entity.id}`));
        this.setState({
            entity: resp.data
        });
    }

    async periodicRefreshTask() {
        // The periodic task runs all the time, so that we don't have to worry about starting/stopping it as a reaction to the buttons.
        await this.refreshEntity();
        if (this.refreshTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 2000);
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

    async startRunAsync() {
        try {
            await axios.post(getUrl(`rest/import-start/${this.props.list.id}/${this.props.entity.id}`));
        } catch (err) {
            if (err instanceof interoperableErrors.InvalidStateError) {
                // Just mask the fact that it's not possible to start anything and refresh instead.
            } else {
                throw err;
            }
        }

        await this.refreshEntity();

        if (this.runsTableNode) {
            this.runsTableNode.refresh();
        }
    }

    async stopRunAsync() {
        try {
            await axios.post(getUrl(`rest/import-stop/${this.props.list.id}/${this.props.entity.id}`));
        } catch (err) {
            if (err instanceof interoperableErrors.InvalidStateError) {
                // Just mask the fact that it's not possible to stop anything and refresh instead.
            } else {
                throw err;
            }
        }

        await this.refreshEntity();

        if (this.runsTableNode) {
            this.runsTableNode.refresh();
        }
    }

    render() {
        const t = this.props.t;
        const entity = this.state.entity;

        const columns = [
            { data: 1, title: t('started'), render: data => moment(data).fromNow() },
            { data: 2, title: t('finished'), render: data => data ? moment(data).fromNow() : '' },
            { data: 3, title: t('status'), render: data => this.runStatusLabels[data], sortable: false, searchable: false },
            { data: 4, title: t('processed') },
            { data: 5, title: t('new') },
            { data: 6, title: t('failed') },
            {
                actions: data => {
                    const actions = [];
                    const status = data[3];

                    let refreshTimeout;

                    if (runStatusInProgress(status)) {
                        refreshTimeout = 1000;
                    }

                    actions.push({
                        label: <Icon icon="eye" title={t('runStatus')}/>,
                        link: `/lists/${this.props.list.id}/imports/${this.props.entity.id}/status/${data[0]}`
                    });

                    return { refreshTimeout, actions };
                }
            }
        ];

        return (
            <div>
                <Title>{t('importStatus')}</Title>

                <AlignedRow label={t('name')}>{entity.name}</AlignedRow>
                <AlignedRow label={t('source')}>{this.importSourceLabels[entity.source]}</AlignedRow>
                <AlignedRow label={t('status')}>{this.importStatusLabels[entity.status]}</AlignedRow>
                {entity.error && <AlignedRow label={t('error')}><pre>{entity.error}</pre></AlignedRow>}

                <ButtonRow label={t('actions')}>
                    {prepFinishedAndNotInProgress(entity.status) && <Button className="btn-primary" icon="play" label={t('start')} onClickAsync={::this.startRunAsync}/>}
                    {runInProgress(entity.status) && <Button className="btn-primary" icon="stop" label={t('stop')} onClickAsync={::this.stopRunAsync}/>}
                </ButtonRow>

                <hr/>
                <h3>{t('importRuns')}</h3>
                <Table ref={node => this.runsTableNode = node} withHeader dataUrl={`rest/import-runs-table/${this.props.list.id}/${this.props.entity.id}`} columns={columns} />
            </div>
        );
    }
}