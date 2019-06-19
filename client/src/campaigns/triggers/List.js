'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {getTriggerTypes} from './helpers';
import {Icon} from "../../lib/bootstrap-components";
import mailtrainConfig from 'mailtrainConfig';
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../../lib/modals";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        const {entityLabels, eventLabels} = getTriggerTypes(props.t);
        this.entityLabels = entityLabels;
        this.eventLabels = eventLabels;

        this.state = {};
        tableRestActionDialogInit(this);
    }

    static propTypes = {
        campaign: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('entity'), render: data => this.entityLabels[data], searchable: false },
            { data: 4, title: t('event'), render: (data, cmd, rowData) => this.eventLabels[rowData[3]][data], searchable: false },
            { data: 5, title: t('daysAfter'), render: data => Math.round(data / (3600 * 24)) },
            { data: 6, title: t('enabled'), render: data => data ? t('yes') : t('no'), searchable: false},
            {
                actions: data => {
                    const actions = [];

                    if (mailtrainConfig.globalPermissions.setupAutomation && this.props.campaign.permissions.includes('manageTriggers')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/campaigns/${this.props.campaign.id}/triggers/${data[0]}/edit`
                        });
                    }

                    if (this.props.campaign.permissions.includes('manageTriggers')) {
                        tableAddDeleteButton(actions, this, null, `rest/triggers/${this.props.campaign.id}/${data[0]}`, data[1], t('deletingTrigger'), t('triggerDeleted'));
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {mailtrainConfig.globalPermissions.setupAutomation && this.props.campaign.permissions.includes('manageTriggers') &&
                    <Toolbar>
                        <LinkButton to={`/campaigns/${this.props.campaign.id}/triggers/create`} className="btn-primary" icon="plus" label={t('createTrigger')}/>
                    </Toolbar>
                }

                <Title>{t('triggers')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/triggers-by-campaign-table/${this.props.campaign.id}`} columns={columns} />
            </div>
        );
    }
}