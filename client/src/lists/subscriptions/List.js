'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import { Table } from '../../lib/table';
import { SubscriptionStatus } from '../../../../shared/lists';
import moment from 'moment';
import {
    Dropdown, Form,
    withForm
} from '../../lib/form';
import axios from '../../lib/axios';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;
        this.state = {
            segmentOptions: [
                {key: 'none', label: t('All subscriptions')}
            ]
        };

        this.subscriptionStatusLabels = {
            [SubscriptionStatus.SUBSCRIBED]: t('Subscribed'),
            [SubscriptionStatus.UNSUBSCRIBED]: t('Unubscribed'),
            [SubscriptionStatus.BOUNCED]: t('Bounced'),
            [SubscriptionStatus.COMPLAINED]: t('Complained'),
        }

        this.initForm({
            onChange: {
                segment: ::this.onSegmentChange
            }
        });
    }

    static propTypes = {
        list: PropTypes.object
    }

    onSegmentChange(state, attr, oldValue, newValue) {
        // TODO

        this.subscriptionsTable.refresh();
    }

    @withAsyncErrorHandler
    async loadSegmentOptions() {
        const t = this.props.t;

        const result = await axios.get(`/rest/segments/${this.props.list.id}`);

        this.setState({
            segmentOptions: [
                {key: 'none', label: t('All subscriptions')},
                ...result.data.map(x => ({ key: x.id.toString(), label: x.name})),
            ]
        });
    }

    componentDidMount() {
        this.populateFormValues({
            segment: 'none'
        });

        this.loadSegmentOptions();
    }


    render() {
        const t = this.props.t;
        const list = this.props.list;

        const columns = [
            { data: 2, title: t('Email') },
            { data: 3, title: t('Status'), render: data => this.subscriptionStatusLabels[data] },
            { data: 4, title: t('Created'), render: data => data ? moment(data).fromNow() : '' }
        ];

        if (list.permissions.includes('manageSubscriptions')) {
            columns.push({
                actions: data => [{
                    label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                    link: `/lists/${this.props.list.id}/subscriptions/${data[0]}/edit`
                }]
            });
        }

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo={`/lists/${this.props.list.id}/subscriptions/create`} className="btn-primary" icon="plus" label={t('Add Subscriber')}/>
                </Toolbar>

                <Title>{t('Subscribers')}</Title>

                {list.description &&
                    <div className="well well-sm">{list.description}</div>
                }

                <div className="well well-sm">
                    <Form inline stateOwner={this}>
                        <Dropdown inline className="input-sm" id="segment" label={t('Segment')} options={this.state.segmentOptions}/>
                    </Form>
                </div>


                <Table ref={node => this.subscriptionsTable = node} withHeader dataUrl={`/rest/subscriptions-table/${list.id}`} columns={columns} />
            </div>
        );
    }
}