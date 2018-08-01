'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import {
    DropdownMenu,
    Icon
} from '../lib/bootstrap-components';
import {
    MenuLink,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from '../lib/page';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {Table} from '../lib/table';
import moment from 'moment';
import {
    CampaignSource,
    CampaignStatus,
    CampaignType
} from "../../../shared/campaigns";
import {checkPermissions} from "../lib/permissions";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.campaignStatuses = {
            [CampaignStatus.IDLE]: t('Idle'),
            [CampaignStatus.FINISHED]: t('Finished'),
            [CampaignStatus.PAUSED]: t('Paused'),
            [CampaignStatus.INACTIVE]: t('Inactive'),
            [CampaignStatus.ACTIVE]: t('Active')
        };

        this.campaignTypes = {
            [CampaignType.REGULAR]: t('Regular'),
            [CampaignType.TRIGGERED]: t('Triggered'),
            [CampaignType.RSS]: t('RSS')
        };

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createCampaign: {
                entityTypeId: 'namespace',
                requiredOperations: ['createCampaign']
            }
        });

        this.setState({
            createPermitted: result.data.createCampaign
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Type'), render: data => this.campaignTypes[data] },
            {
                data: 4,
                title: t('Status'),
                render: (data, display, rowData) => {
                    if (data === CampaignStatus.SCHEDULED) {
                        const scheduled = rowData[5];
                        if (scheduled && new Date(scheduled) > new Date()) {
                            return t('Sending scheduled');
                        } else {
                            return t('Sending');
                        }
                    } else {
                        return this.campaignStatuses[data];
                    }
                }
            },
            { data: 7, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 8, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[9];
                    const campaignSource = data[6];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/campaigns/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('manageFiles') && (campaignSource === CampaignSource.CUSTOM || campaignSource === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('Files')}/>,
                            link: `/campaigns/${data[0]}/files`
                        });
                    }

                    // FIXME: add attachments

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/campaigns/${data[0]}/share`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                <Toolbar>
                    {this.state.createPermitted &&
                    <DropdownMenu className="btn-primary" label={t('Create Campaign')}>
                        <MenuLink to="/campaigns/create-regular">{t('Regular')}</MenuLink>
                        <MenuLink to="/campaigns/create-rss">{t('RSS')}</MenuLink>
                        <MenuLink to="/campaigns/create-triggered">{t('Triggered')}</MenuLink>
                    </DropdownMenu>
                    }
                </Toolbar>

                <Title>{t('Campaigns')}</Title>

                <Table withHeader dataUrl="rest/campaigns-table" columns={columns} />
            </div>
        );
    }
}