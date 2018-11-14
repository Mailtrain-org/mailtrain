'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes
    from 'prop-types';
import {ModalDialog} from "../lib/bootstrap-components";
import {
    requiresAuthenticatedUser,
    withPageHelpers
} from "../lib/page";
import {
    Form,
    TableSelect,
    withForm
} from "../lib/form";
import {withErrorHandling} from "../lib/error-handling";
import moment
    from "moment";
import {getMailerTypes} from "../send-configurations/helpers";
import axios from '../lib/axios';
import {getUrl} from "../lib/urls";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export class TestSendModalDialog extends Component {
    constructor(props) {
        super(props);

        this.mailerTypes = getMailerTypes(props.t);

        this.initForm();
    }

    static propTypes = {
        stateOwner: PropTypes.object,
        visible: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        getDataAsync: PropTypes.func.isRequired
    }

    componentDidMount() {
        this.populateFormValues({
            list: null,
            testUser: null,
            sendConfiguration: null
        });
    }

    async hideModal() {
        this.props.onHide();
    }

    async performAction() {
        const props = this.props;
        const t = props.t;

        if (this.isFormWithoutErrors()) {

            try {
                this.hideFormValidation();
                this.disableForm();
                this.setFormStatusMessage('info', t('Sending test email'));

                const data = await this.props.getDataAsync();
                data.listCid = this.getFormValue('list');
                data.subscriptionCid = this.getFormValue('testUser');
                data.sendConfigurationId = this.getFormValue('sendConfiguration');

                await axios.post(getUrl('rest/template-test-send'), data);

                this.clearFormStatusMessage();

                this.enableForm();
                await this.hideModal();

            } catch (err) {
                throw err;
            }
        } else {
            this.showFormValidation();
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['sendConfiguration', 'value'])) {
            state.setIn(['sendConfiguration', 'error'], t('Send configuration has to be selected.'))
        } else {
            state.setIn(['sendConfiguration', 'error'], null);
        }

        if (!state.getIn(['list', 'value'])) {
            state.setIn(['list', 'error'], t('List has to be selected.'))
        } else {
            state.setIn(['list', 'error'], null);
        }

        if (!state.getIn(['testUser', 'value'])) {
            state.setIn(['testUser', 'error'], t('Subscription has to be selected.'))
        } else {
            state.setIn(['testUser', 'error'], null);
        }
    }

    render() {
        const t = this.props.t;

        const listId = this.getFormValue('list');

        const testUsersColumns = [
            { data: 1, title: t('Subscription ID'), render: data => <code>{data}</code> },
            { data: 2, title: t('Email') }
        ];

        const listsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Subscribers') },
            { data: 4, title: t('Description') },
            { data: 5, title: t('Namespace') }
        ];

        const sendConfigurationsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Description') },
            { data: 4, title: t('Type'), render: data => this.mailerTypes[data].typeName },
            { data: 5, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 6, title: t('Namespace') }
        ];

        return (
            <ModalDialog hidden={!this.props.visible} title={t('Send Test Email')} onCloseAsync={() => this.hideModal()} buttons={[
                { label: t('Send'), className: 'btn-danger', onClickAsync: ::this.performAction },
                { label: t('Cancel'), className: 'btn-primary', onClickAsync: ::this.hideModal }
            ]}>
                <Form stateOwner={this} format="wide">
                    <TableSelect id="sendConfiguration" format="wide" label={t('Send configuration')} withHeader dropdown dataUrl='rest/send-configurations-with-send-permission-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />
                    <TableSelect id="list" format="wide" label={t('List')} withHeader dropdown dataUrl={`rest/lists-table`} columns={listsColumns} selectionKeyIndex={2} selectionLabelIndex={1} />
                    { listId &&
                        <TableSelect id="testUser" format="wide" label={t('Subscription')} withHeader dropdown dataUrl={`rest/subscriptions-test-user-table/${listId}`} columns={testUsersColumns} selectionKeyIndex={1} selectionLabelIndex={2} />
                    }
                </Form>
            </ModalDialog>
        );
    }
}
