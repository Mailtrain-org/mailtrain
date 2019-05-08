'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";

import Chart from 'react-google-charts';

import styles from "./styles.scss";
import {Table} from "../lib/table";
import {Link} from "react-router-dom";

import mailtrainConfig from "mailtrainConfig";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class StatisticsOpened extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            entity: props.entity,
            statisticsOpened: props.statisticsOpened
        };

        this.refreshTimeoutHandler = ::this.periodicRefreshTask;
        this.refreshTimeoutId = 0;
    }

    static propTypes = {
        entity: PropTypes.object,
        statisticsOpened: PropTypes.object,
        agg: PropTypes.string
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        let resp;

        resp = await axios.get(getUrl(`rest/campaigns-settings/${this.props.entity.id}`));
        const entity = resp.data;

        resp = await axios.get(getUrl(`rest/campaign-statistics/${this.props.entity.id}/opened`));
        const statisticsOpened = resp.data;

        this.setState({
            entity,
            statisticsOpened
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
        const agg = this.props.agg;

        const stats = this.state.statisticsOpened;

        const subscribersColumns = [
            { data: 0, title: t('email') },
            { data: 1, title: t('subscriptionId'), render: data => <code>{data}</code> },
            { data: 2, title: t('listId'), render: data => <code>{data}</code> },
            { data: 3, title: t('list') },
            { data: 4, title: t('listNamespace') },
            { data: 5, title: t('opensCount') }
        ];

        const renderNavPill = (key, label) => (
            <li role="presentation" className={agg === key ? 'active' : ''}>
                <Link to={`/campaigns/${entity.id}/statistics/opened/${key}`}>{label}</Link>
            </li>
        );

        const navPills = (
            <ul className={`nav nav-pills ${styles.navPills}`}>
                {renderNavPill('countries', t('countries'))}
                {renderNavPill('devices', t('devices'))}
            </ul>
        );


        let charts = null;

        const deviceTypes = {
            desktop: t('desktop'),
            tv: t('tv'),
            tablet: t('tablet'),
            phone: t('phone'),
            bot: t('bot'),
            car: t('car'),
            console: t('console')
        };

        if (agg === 'devices') {
            charts = (
                <div className={styles.charts}>
                    {navPills}
                    <h4 className={styles.chartTitle}>{t('distributionByDeviceType')}</h4>
                    <Chart
                        width="100%"
                        height="380px"
                        chartType="PieChart"
                        loader={<div>{t('loadingChart')}</div>}
                        data={[
                            [t('deviceType'), t('count')],
                            ...stats.devices.map(entry => [deviceTypes[entry.key] || t('unknown'), entry.count])
                        ]}
                        options={{
                            chartArea: {
                                left: "25%",
                                top: 15,
                                width: "100%",
                                height: 350
                            },
                            tooltip: {
                                showColorCode: true
                            },
                            legend: {
                                position: "right",
                                alignment: "start",
                                textStyle: {
                                    fontSize: 14
                                }
                            }
                        }}
                    />
                </div>
            );
        } else if (agg === 'countries') {
            charts = (
                <div className={styles.charts}>
                    {navPills}
                    <h4 className={styles.sectionTitle}>{t('distributionByCountry')}</h4>
                    <div className="row">
                        <div className={`col-md-6 ${styles.chart}`}>
                            <Chart
                                width="100%"
                                height="380px"
                                chartType="PieChart"
                                loader={<div>{t('loadingChart')}</div>}
                                data={[
                                    [t('country'), t('count')],
                                    ...stats.countries.map(entry => [entry.key || t('unknown'), entry.count])
                                ]}
                                options={{
                                    chartArea: {
                                        left: "25%",
                                        top: 15,
                                        width: "100%",
                                        height: 350
                                    },
                                    tooltip: {
                                        showColorCode: true
                                    },
                                    legend: {
                                        position: "right",
                                        alignment: "start",
                                        textStyle: {
                                            fontSize: 14
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className={`col-md-6 ${styles.chart}`}>
                            <Chart
                                width="100%"
                                height="380px"
                                chartType="GeoChart"
                                data={[
                                    ['Country', 'Count'],
                                    ...stats.countries.map(entry => [entry.key || t('unknown'), entry.count])
                                ]}
                                mapsApiKey={mailtrainConfig.mapsApiKey}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <Title>{t('detailedStatistics')}</Title>

                {charts}

                <hr/>

                <h4 className={styles.sectionTitle}>{t('listOfSubscribersThatOpenedTheCampaign')}</h4>
                <Table ref={node => this.table = node} withHeader dataUrl={`rest/campaigns-opens-table/${entity.id}`} columns={subscribersColumns} />
            </div>
        );
    }
}