'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {getTriggerTypes} from './helpers';
import {Icon} from "../../lib/bootstrap-components";
import mailtrainConfig from 'mailtrainConfig';
import {
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../../lib/modals";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        const {entityLabels, eventLabels} = getTriggerTypes(props.t);
        this.entityLabels = entityLabels;
        this.eventLabels = eventLabels;

        this.state = {};
        tableDeleteDialogInit(this);
    }

    static propTypes = {
        campaign: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Entity'), render: data => this.entityLabels[data], searchable: false },
            { data: 4, title: t('Event'), render: (data, cmd, rowData) => this.eventLabels[rowData[3]][data], searchable: false },
            { data: 5, title: t('Days after'), render: data => Math.round(data / (3600 * 24)) },
            { data: 6, title: t('Enabled'), render: data => data ? t('Yes') : t('No'), searchable: false},
            {
                actions: data => {
                    const actions = [];

                    if (mailtrainConfig.globalPermissions.includes('setupAutomation') && this.props.campaign.permissions.includes('manageTriggers')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/campaigns/${this.props.campaign.id}/triggers/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('manageTriggers')) {
                        tableDeleteDialogAddDeleteButton(actions, this, null, data[0], data[1]);
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/triggers/${this.props.campaign.id}`, t('Deleting trigger ...'), t('Trigger deleted'))}
                {mailtrainConfig.globalPermissions.includes('setupAutomation') && this.props.campaign.permissions.includes('manageTriggers') &&
                    <Toolbar>
                        <NavButton linkTo={`/campaigns/${this.props.campaign.id}/triggers/create`} className="btn-primary" icon="plus" label={t('Create Trigger')}/>
                    </Toolbar>
                }

                <Title>{t('Triggers')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/triggers-by-campaign-table/${this.props.campaign.id}`} columns={columns} />
            </div>
        );
    }
}