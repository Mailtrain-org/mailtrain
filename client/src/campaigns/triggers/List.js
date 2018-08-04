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
        campaign: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('List') },
            { data: 4, title: t('Entity'), render: data => this.entityLabels[data], searchable: false },
            { data: 5, title: t('Event'), render: (data, cmd, rowData) => this.eventLabels[rowData[4]][data], searchable: false },
            { data: 6, title: t('Days after'), render: data => Math.round(data / (3600 * 24)) },
            { data: 7, title: t('Enabled'), render: data => data ? t('Yes') : t('No'), searchable: false},
            {
                actions: data => {
                    const actions = [];

                    if (this.props.campaign.permissions.includes('manageTriggers')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/campaigns/${this.props.campaign.id}/triggers/${data[0]}/edit`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {this.props.campaign.permissions.includes('manageTriggers') &&
                    <Toolbar>
                        <NavButton linkTo={`/campaigns/${this.props.campaign.id}/triggers/create`} className="btn-primary" icon="plus" label={t('Create Trigger')}/>
                    </Toolbar>
                }

                <Title>{t('Triggers')}</Title>

                <Table withHeader dataUrl={`rest/triggers-by-campaign-table/${this.props.campaign.id}`} columns={columns} />
            </div>
        );
    }
}