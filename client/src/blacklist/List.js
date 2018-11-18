'use strict';

import React, {Component} from "react";
import { withTranslation } from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from "../lib/page";
import {withAsyncErrorHandler, withErrorHandling} from "../lib/error-handling";
import {Table} from "../lib/table";
import {ButtonRow, Form, InputField, withForm, FormSendMethod} from "../lib/form";
import {Button, Icon} from "../lib/bootstrap-components";
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";

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

        this.initForm({
            serverValidation: {
                url: 'rest/blacklist-validate',
                changed: ['email']
            }
        });
    }

    static propTypes = {
    }

    clearFields() {
        this.populateFormValues({
            email: ''
        });
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const email = state.getIn(['email', 'value']);
        const emailServerValidation = state.getIn(['email', 'serverValidation']);

        if (!email) {
            state.setIn(['email', 'error'], t('emailMustNotBeEmpty-1'));
        } else if (emailServerValidation && emailServerValidation.invalid) {
            state.setIn(['email', 'error'], t('invalidEmailAddress'));
        } else if (emailServerValidation && emailServerValidation.exists) {
            state.setIn(['email', 'error'], t('theEmailIsAlreadyOnBlacklist'));
        } else if (!emailServerValidation) {
            state.setIn(['email', 'error'], t('validationIsInProgress'));
        } else {
            state.setIn(['email', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/blacklist');

        if (submitSuccessful) {
            this.hideFormValidation();
            this.clearFields();
            this.enableForm();

            this.clearFormStatusMessage();
            this.blacklistTable.refresh();

        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd-1'));
        }
    }

    componentDidMount() {
        this.clearFields();
    }

    @withAsyncErrorHandler
    async deleteBlacklisted(email) {
        await axios.delete(getUrl(`rest/blacklist/${email}`));
        this.blacklistTable.refresh();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 0, title: t('email') },
            {
                actions: data => [
                    {
                        label: <Icon icon="remove" title={t('removeFromBlacklist')}/>,
                        action: () => this.deleteBlacklisted(data[0])
                    }
                ]
            }
        ];

        return (
            <div>
                <Title>{t('blacklist')}</Title>

                <h3 className="legend">{t('addEmailToBlacklist-1')}</h3>
                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="email" label={t('email')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('addToBlacklist')}/>
                    </ButtonRow>
                </Form>

                <hr/>

                <h3 className="legend">{t('blacklistedEmails')}</h3>

                <Table ref={node => this.blacklistTable = node} withHeader dataUrl="rest/blacklist-table" columns={columns} />
            </div>
        );
    }
}