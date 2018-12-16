'use strict';

import React, {Component} from 'react';
import PropTypes
    from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import axios
    from "../lib/axios";
import {getUrl} from "../lib/urls";
import {AlignedRow} from "../lib/form";
import {Icon} from "../lib/bootstrap-components";

import styles
    from "./styles.scss";
import {Link} from "react-router-dom";

@withTranslation()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class Statistics extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            entity: props.entity,
            statisticsOverview: props.statisticsOverview
        };

        this.refreshTimeoutHandler = ::this.periodicRefreshTask;
        this.refreshTimeoutId = 0;
    }

    static propTypes = {
        entity: PropTypes.object,
        statisticsOverview: PropTypes.object
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        let resp;

        resp = await axios.get(getUrl(`rest/campaigns-stats/${this.props.entity.id}`));
        const entity = resp.data;

        resp = await axios.get(getUrl(`rest/campaign-statistics/${this.props.entity.id}/overview`));
        const statisticsOverview = resp.data;

        this.setState({
            entity,
            statisticsOverview
        });
    }

    async periodicRefreshTask() {
        // The periodic task runs all the time, so that we don't have to worry about starting/stopping it as a reaction to the buttons.
        await this.refreshEntity();
        if (this.refreshTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 60000);
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

        const stats = this.state.statisticsOverview;

        const renderMetrics = (key, label, showZoomIn = true) => {
            const val = stats[key]

            return (
                <AlignedRow label={label}><span className={styles.statsMetrics}>{val}</span>{showZoomIn && <span className={styles.zoomIn}><Link to={`/campaigns/${entity.id}/statistics/${key}`}><Icon icon="zoom-in"/></Link></span>}</AlignedRow>
            );
        }

        const renderMetricsWithProgress = (key, label, progressBarClass, showZoomIn = true) => {
            const val = stats[key]

            if (!stats.total) {
                return renderMetrics(key, label);
            }

            const rate = Math.round(val / stats.total * 100);

            return (
                <AlignedRow label={label}>
                    {showZoomIn && <span className={styles.statsProgressBarZoomIn}><Link to={`/campaigns/${entity.id}/statistics/${key}`}><Icon icon="zoom-in"/></Link></span>}
                    <div className={`progress ${styles.statsProgressBar}`}>
                        <div
                            className={`progress-bar progress-bar-${progressBarClass}`}
                            role="progressbar"
                            aria-valuenow={stats.bounced}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{minWidth: '6em', width: rate + '%'}}>
                            {val}&nbsp;({rate}%)
                        </div>
                    </div>
                </AlignedRow>
            );
        }

        return (
            <div>
                <Title>{t('campaignStatistics')}</Title>

                {renderMetrics('total', t('Total'), false)}
                {renderMetrics('delivered', t('Delivered'))}
                {renderMetrics('blacklisted', t('Blacklisted'), false)}
                {renderMetricsWithProgress('bounced', t('Bounced'), 'info')}
                {renderMetricsWithProgress('complained', t('Complaints'), 'danger')}
                {renderMetricsWithProgress('unsubscribed', t('Unsubscribed'), 'warning')}
                {!entity.open_tracking_disabled && renderMetricsWithProgress('opened', t('Opened'), 'success')}
                {!entity.click_tracking_disabled && renderMetricsWithProgress('clicks', t('Clicked'), 'success')}
           </div>
        );
    }
}