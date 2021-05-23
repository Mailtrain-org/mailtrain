'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {SubscriptionStatus} from '../../../../shared/lists';
import moment from 'moment';
import {Dropdown, Form, withForm} from '../../lib/form';
import {Button, Icon} from "../../lib/bootstrap-components";
import {HTTPMethod} from '../../lib/axios';
import {getFieldTypes, getSubscriptionStatusLabels} from './helpers';
import {getPublicUrl, getUrl} from "../../lib/urls";
import {
    tableAddDeleteButton,
    tableAddRestActionButton,
    tableRestActionDialogInit,
    tableRestActionDialogRender
} from "../../lib/modals";
import listStyles from "../styles.scss";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {};
        tableRestActionDialogInit(this);

        this.subscriptionStatusLabels = getSubscriptionStatusLabels(t);
        this.fieldTypes = getFieldTypes(t);

        this.initForm({
            leaveConfirmation: false,
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

    componentDidMount() {
        this.populateFormValues({
            segment: this.props.segmentId || ''
        });
    }

    componentDidUpdate() {
        const segmentId = this.props.segmentId || '';

        if (this.getFormValue('segment') !== segmentId) {
            // Populate is used here because it does not invoke onChange
            this.populateFormValues({
                segment: segmentId
            });
        }
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
                        tableAddRestActionButton(
                            actions, this,
                            { method: HTTPMethod.POST, url: `rest/subscriptions-unsubscribe/${this.props.list.id}/${id}`},
                            { icon: 'power-off', label: t('unsubscribe') },
                            t('confirmUnsubscription'),
                            t('areYouSureYouWantToUnsubscribeEmail?', {email}),
                            t('unsubscribingEmail', {email}),
                            t('emailUnsubscribed', {email}),
                            null
                        );
                    }

                    if (email && !data[5]) {
                        tableAddRestActionButton(
                            actions, this,
                            { method: HTTPMethod.POST, url: `rest/blacklist`, data: {email} },
                            { icon: 'ban', label: t('blacklist') },
                            t('confirmEmailBlacklisting'),
                            t('areYouSureYouWantToBlacklistEmail?', {email}),
                            t('blacklistingEmail', {email}),
                            t('emailBlacklisted', {email}),
                            null
                        );
                    }

                    tableAddDeleteButton(actions, this, null, `rest/subscriptions/${this.props.list.id}/${id}`, email, t('deletingSubscription'), t('subscriptionDeleted'));

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
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    <a href={getPublicUrl(`subscription/${this.props.list.cid}`, {withLocale: true})}><Button label={t('subscriptionForm-1')} className="btn-secondary"/></a>
                    <a href={getUrl(`subscriptions/export/${this.props.list.id}/`+ (this.props.segmentId || 0))}><Button label={t('exportAsCsv')} className="btn-primary"/></a>
                    <LinkButton to={`/lists/${this.props.list.id}/subscriptions/create`} className="btn-primary" icon="plus" label={t('addSubscriber')}/>
                </Toolbar>

                <Title>{t('subscribers')}</Title>

                {list.description &&
                    <div className="well well-sm">{list.description}</div>
                }

                <div className="card bg-light">
                    <div className="card-body p-2">
                        <Form format="inline" stateOwner={this}>
                            <Dropdown format="inline" className="input-sm" id="segment" label={t('segment')} options={segmentOptions}/>
                        </Form>
                    </div>
                </div>

                <Table ref={node => this.table = node} withHeader dataUrl={dataUrl} columns={columns} />
            </div>
        );
    }
}