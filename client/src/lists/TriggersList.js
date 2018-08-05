'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import {getTriggerTypes} from '../campaigns/triggers/helpers';
import {Icon} from "../lib/bootstrap-components";
import mailtrainConfig from 'mailtrainConfig';

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
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Campaign') },
            { data: 4, title: t('Entity'), render: data => this.entityLabels[data], searchable: false },
            { data: 5, title: t('Event'), render: (data, cmd, rowData) => this.eventLabels[rowData[4]][data], searchable: false },
            { data: 6, title: t('Days after'), render: data => Math.round(data / (3600 * 24)) },
            { data: 7, title: t('Enabled'), render: data => data ? t('Yes') : t('No'), searchable: false},
            {
                actions: data => {
                    const actions = [];
                    const perms = data[9];
                    const campaignId = data[8];

                    if (mailtrainConfig.globalPermissions.includes('setupAutomation') && perms.includes('manageTriggers')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/campaigns/${campaignId}/triggers/${data[0]}/edit`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                <Title>{t('Triggers')}</Title>

                <Table withHeader dataUrl={`rest/triggers-by-list-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}