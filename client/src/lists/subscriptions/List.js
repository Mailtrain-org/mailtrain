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

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;
        this.state = {};

        this.subscriptionStatusLabels = {
            [SubscriptionStatus.SUBSCRIBED]: t('Subscribed'),
            [SubscriptionStatus.UNSUBSCRIBED]: t('Unubscribed'),
            [SubscriptionStatus.BOUNCED]: t('Bounced'),
            [SubscriptionStatus.COMPLAINED]: t('Complained'),
        };

        this.initForm({
            onChange: {
                segment: (newState, key, oldValue, value) => {
                    this.navigateTo(`/lists/${this.props.list.id}/subscriptions` + (value ? '/' + value : ''));
                }
            }
        });
    }

    static propTypes = {
        list: PropTypes.object,
        segments: PropTypes.array,
        segmentId: PropTypes.string
    }

    updateSegmentSelection(props) {
        this.populateFormValues({
            segment: props.segmentId || ''
        });
    }

    componentDidMount() {
        this.updateSegmentSelection(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.updateSegmentSelection(nextProps);
    }

    render() {
        const t = this.props.t;
        const list = this.props.list;
        const segments = this.props.segments;

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

        const segmentOptions = [
            {key: '', label: t('All subscriptions')},
            ...segments.map(x => ({ key: x.id.toString(), label: x.name}))
        ]


        let dataUrl = '/rest/subscriptions-table/' + list.id;
        if (this.props.segmentId) {
            dataUrl += '/' + this.props.segmentId;
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
                    <Form format="inline" stateOwner={this}>
                        <Dropdown format="inline" className="input-sm" id="segment" label={t('Segment')} options={segmentOptions}/>
                    </Form>
                </div>


                <Table ref={node => this.subscriptionsTable = node} withHeader dataUrl={dataUrl} columns={columns} />
            </div>
        );
    }
}