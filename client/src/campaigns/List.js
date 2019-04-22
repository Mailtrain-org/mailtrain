'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {ButtonDropdown, Icon} from '../lib/bootstrap-components';
import {DropdownLink, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import moment from 'moment';
import {CampaignSource, CampaignStatus, CampaignType} from "../../../shared/campaigns";
import {checkPermissions} from "../lib/permissions";
import {getCampaignLabels} from "./helpers";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";
import styles from "./styles.scss";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        const { campaignTypeLabels, campaignStatusLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;
        this.campaignStatusLabels = campaignStatusLabels;

        this.state = {};
        tableRestActionDialogInit(this);
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
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code>, className: styles.tblCol_id },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.campaignTypeLabels[data] },
            {
                data: 5,
                title: t('status'),
                render: (data, display, rowData) => {
                    if (data === CampaignStatus.SCHEDULED) {
                        const scheduled = rowData[6];
                        if (scheduled && new Date(scheduled) > new Date()) {
                            return t('sendingScheduled');
                        } else {
                            return t('sending');
                        }
                    } else {
                        return this.campaignStatusLabels[data];
                    }
                }
            },
            { data: 8, title: t('created'), render: data => moment(data).fromNow() },
            { data: 9, title: t('namespace') },
            {
                className: styles.tblCol_buttons,
                actions: data => {
                    const actions = [];
                    const perms = data[10];
                    const campaignType = data[4];
                    const status = data[5];
                    const campaignSource = data[7];

                    if (perms.includes('viewStats')) {
                        actions.push({
                            label: <Icon icon="envelope" title={t('status')}/>,
                            link: `/campaigns/${data[0]}/status`
                        });

                        actions.push({
                            label: <Icon icon="signal" title={t('statistics')}/>,
                            link: `/campaigns/${data[0]}/statistics`
                        });
                    }

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/campaigns/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('edit') && (campaignSource === CampaignSource.CUSTOM || campaignSource === CampaignSource.CUSTOM_FROM_TEMPLATE || campaignSource === CampaignSource.CUSTOM_FROM_CAMPAIGN)) {
                        actions.push({
                            label: <Icon icon="align-center" title={t('content')}/>,
                            link: `/campaigns/${data[0]}/content`
                        });
                    }

                    if (perms.includes('viewFiles') && (campaignSource === CampaignSource.CUSTOM || campaignSource === CampaignSource.CUSTOM_FROM_TEMPLATE || campaignSource === CampaignSource.CUSTOM_FROM_CAMPAIGN)) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('files')}/>,
                            link: `/campaigns/${data[0]}/files`
                        });
                    }

                    if (perms.includes('viewAttachments')) {
                        actions.push({
                            label: <Icon icon="paperclip" title={t('attachments')}/>,
                            link: `/campaigns/${data[0]}/attachments`
                        });
                    }

                    if (campaignType === CampaignType.TRIGGERED && perms.includes('viewTriggers')) {
                        actions.push({
                            label: <Icon icon="bell" title={t('triggers')}/>,
                            link: `/campaigns/${data[0]}/triggers`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/campaigns/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/campaigns/${data[0]}`, data[1], t('deletingCampaign'), t('campaignDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    {this.state.createPermitted &&
                    <ButtonDropdown buttonClassName="btn-primary" menuClassName="dropdown-menu-right" label={t('createCampaign')}>
                        <DropdownLink to="/campaigns/create-regular">{t('regular')}</DropdownLink>
                        <DropdownLink to="/campaigns/create-rss">{t('rss')}</DropdownLink>
                        <DropdownLink to="/campaigns/create-triggered">{t('triggered')}</DropdownLink>
                    </ButtonDropdown>
                    }
                </Toolbar>

                <Title>{t('campaigns')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/campaigns-table" columns={columns} />
            </div>
        );
    }
}