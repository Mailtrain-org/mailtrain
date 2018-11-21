'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from '../../lib/i18n';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import { Table } from '../../lib/table';
import { SubscriptionStatus } from '../../../../shared/lists';
import moment from 'moment';
import {
    Dropdown, Form,
    withForm
} from '../../lib/form';
import {Icon, Button} from "../../lib/bootstrap-components";
import axios, {HTTPMethod} from '../../lib/axios';
import {getFieldTypes, getSubscriptionStatusLabels} from './helpers';
import {getUrl, getPublicUrl} from "../../lib/urls";
import {
    DeleteModalDialog,
    RestActionModalDialog,
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../../lib/modals";
import listStyles from "../styles.scss";
import styles from '../../lib/styles.scss';

@withTranslation()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {};
        tableDeleteDialogInit(this);

        this.subscriptionStatusLabels = getSubscriptionStatusLabels(t);
        this.fieldTypes = getFieldTypes(t);

        this.initForm({
            onChange: {
                segment: (newState, key, oldValue, value) => {
                    this.navigateTo(`/lists/${this.props.list.id}/subscriptions` + (value ? '?segment=' + value : ''));
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

    @withAsyncErrorHandler
    async unsubscribeSubscription(id) {
        await axios.post(getUrl(`rest/subscriptions-unsubscribe/${this.props.list.id}/${id}`));
        this.table.refresh();
    }

    @withAsyncErrorHandler
    async blacklistSubscription(email) {
        await axios.post(getUrl('rest/blacklist'), { email });
        this.table.refresh();
    }

    render() {
        const t = this.props.t;
        const list = this.props.list;
        const segments = this.props.segments;

        const columns = [
            { data: 1, title: t('id'), render: data => <code>{data}</code> },
            { data: 2, title: t('email'), render: data => data === null ? <span className={listStyles.erased}>{t('erased')}</span> : data },
            { data: 3, title: t('status'), render: (data, display, rowData) => this.subscriptionStatusLabels[data] + (rowData[5] ? ', ' + t('blacklisted') : '') },
            { data: 4, title: t('created'), render: data => data ? moment(data).fromNow() : '' }
        ];

        let colIdx = 6;

        for (const fld of list.listFields) {

            const indexable = this.fieldTypes[fld.type].indexable;

            columns.push({
                data: colIdx,
                title: fld.name,
                sortable: indexable,
                searchable: indexable
            });

            colIdx += 1;
        }

        if (list.permissions.includes('manageSubscriptions')) {
            columns.push({
                actions: data => {
                    const actions = [];
                    const id = data[0];
                    const email = data[2];
                    const status = data[3];

                    actions.push({
                        label: <Icon icon="edit" title={t('edit')}/>,
                        link: `/lists/${this.props.list.id}/subscriptions/${id}/edit`
                    });

                    if (email && status === SubscriptionStatus.SUBSCRIBED) {
                        actions.push({
                            label: <Icon icon="off" title={t('unsubscribe')}/>,
                            action: () => this.unsubscribeSubscription(id)
                        });
                    }

                    if (email && !data[5]) {
                        actions.push({
                            label: <Icon icon="ban-circle" title={t('blacklist')}/>,
                            action: () => this.blacklistSubscription(email)
                        });
                    }

                    tableDeleteDialogAddDeleteButton(actions, this, null, id, email);

                    return actions;
                }
            });
        }

        const segmentOptions = [
            {key: '', label: t('allSubscriptions')},
            ...segments.map(x => ({ key: x.id.toString(), label: x.name}))
        ];


        let dataUrl = 'rest/subscriptions-table/' + list.id;
        if (this.props.segmentId) {
            dataUrl += '/' + this.props.segmentId;
        }


        // FIXME - presents segments in a data table as in campaign edit
        return (
            <div>
                {tableDeleteDialogRender(this, `rest/subscriptions/${this.props.list.id}`, t('deletingSubscription'), t('subscriptionDeleted'))}
                <Toolbar>
                    <a href={getPublicUrl(`subscription/${this.props.list.cid}`)}><Button label={t('subscriptionForm')} className="btn-default"/></a>
                    <a href={getUrl(`subscriptions/export/${this.props.list.id}/`+ (this.props.segmentId || 0))}><Button label={t('exportAsCsv')} className="btn-primary"/></a>
                    <NavButton linkTo={`/lists/${this.props.list.id}/subscriptions/create`} className="btn-primary" icon="plus" label={t('addSubscriber')}/>
                </Toolbar>

                <Title>{t('subscribers')}</Title>

                {list.description &&
                    <div className="well well-sm">{list.description}</div>
                }

                <div className="well well-sm">
                    <Form format="inline" stateOwner={this}>
                        <Dropdown format="inline" className="input-sm" id="segment" label={t('segment')} options={segmentOptions}/>
                    </Form>
                </div>


                <Table ref={node => this.table = node} withHeader dataUrl={dataUrl} columns={columns} />
            </div>
        );
    }
}