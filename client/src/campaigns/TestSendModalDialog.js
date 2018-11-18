'use strict';

import React, {Component} from 'react';
import { withTranslation } from '../lib/i18n';
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
import {getMailerTypes} from "../send-configurations/helpers";
import axios from '../lib/axios';
import {} from '../lib/urls';
import {getUrl} from "../lib/urls";


@withTranslation()
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
        getDataAsync: PropTypes.func.isRequired,
        entity: PropTypes.object
    }

    componentDidMount() {
        this.populateFormValues({
            testUser: null,
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
                this.setFormStatusMessage('info', t('sendingTestEmail'));

                const data = await this.props.getDataAsync();

                const campaignCid = props.entity.cid;
                const [listCid, subscriptionCid] = this.getFormValue('testUser').split(':');

                data.listCid = listCid;
                data.subscriptionCid = subscriptionCid;
                data.sendConfigurationId = props.entity.send_configuration;
                data.campaignId = props.entity.id;

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

        if (!state.getIn(['testUser', 'value'])) {
            state.setIn(['testUser', 'error'], t('subscriptionHasToBeSelected'))
        } else {
            state.setIn(['testUser', 'error'], null);
        }
    }

    render() {
        const t = this.props.t;

        const testUsersColumns = [
            { data: 1, title: t('email') },
            { data: 2, title: t('subscriptionId'), render: data => <code>{data}</code> },
            { data: 3, title: t('listId'), render: data => <code>{data}</code> },
            { data: 4, title: t('list') },
            { data: 5, title: t('listNamespace') }
        ];

        return (
            <ModalDialog hidden={!this.props.visible} title={t('sendTestEmail')} onCloseAsync={() => this.hideModal()} buttons={[
                { label: t('send'), className: 'btn-danger', onClickAsync: ::this.performAction },
                { label: t('cancel'), className: 'btn-primary', onClickAsync: ::this.hideModal }
            ]}>
                <Form stateOwner={this} format="wide">
                    <TableSelect id="testUser" format="wide" label={t('subscription')} withHeader dropdown dataUrl={`rest/campaigns-test-users-table/${this.props.entity.id}`} columns={testUsersColumns} selectionLabelIndex={1} />
                </Form>
            </ModalDialog>
        );
    }
}
