'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import {getTriggerTypes} from '../campaigns/triggers/helpers';
import {Icon} from "../lib/bootstrap-components";
import mailtrainConfig from 'mailtrainConfig';
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";

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
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('campaign') },
            { data: 4, title: t('entity'), render: data => this.entityLabels[data], searchable: false },
            { data: 5, title: t('event'), render: (data, cmd, rowData) => this.eventLabels[rowData[4]][data], searchable: false },
            { data: 6, title: t('daysAfter'), render: data => Math.round(data / (3600 * 24)) },
            { data: 7, title: t('enabled'), render: data => data ? t('yes') : t('no'), searchable: false},
            {
                actions: data => {
                    const actions = [];
                    const perms = data[9];
                    const campaignId = data[8];

                    if (mailtrainConfig.globalPermissions.setupAutomation && perms.includes('manageTriggers')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/campaigns/${campaignId}/triggers/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('manageTriggers')) {
                        tableAddDeleteButton(actions, this, null, `rest/triggers/${campaignId}/${data[0]}`, data[1], t('deletingTrigger'), t('triggerDeleted'));
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Title>{t('triggers')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/triggers-by-list-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}