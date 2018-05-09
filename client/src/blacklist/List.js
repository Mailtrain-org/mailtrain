'use strict';

import React, {Component} from "react";
import {translate} from "react-i18next";
import {requiresAuthenticatedUser, Title, withPageHelpers} from "../lib/page";
import {withAsyncErrorHandler, withErrorHandling} from "../lib/error-handling";
import {Table} from "../lib/table";
import {ButtonRow, Form, InputField, withForm, FormSendMethod} from "../lib/form";
import {Button, Icon} from "../lib/bootstrap-components";
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";

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
            state.setIn(['email', 'error'], t('Email must not be empty'));
        } else if (emailServerValidation && emailServerValidation.invalid) {
            state.setIn(['email', 'error'], t('Invalid email address.'));
        } else if (emailServerValidation && emailServerValidation.exists) {
            state.setIn(['email', 'error'], t('The email is already on blacklist.'));
        } else if (!emailServerValidation) {
            state.setIn(['email', 'error'], t('Validation is in progress...'));
        } else {
            state.setIn(['email', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/blacklist');

        if (submitSuccessful) {
            this.hideFormValidation();
            this.clearFields();
            this.enableForm();

            this.clearFormStatusMessage();
            this.blacklistTable.refresh();

        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and try again.'));
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
            { data: 0, title: t('Email') },
            {
                actions: data => [
                    {
                        label: <Icon icon="remove" title={t('Remove from blacklist')}/>,
                        action: () => this.deleteBlacklisted(data[0])
                    }
                ]
            }
        ];

        return (
            <div>
                <Title>{t('Blacklist')}</Title>

                <h3 className="legend">{t('Add Email to Blacklist')}</h3>
                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="email" label={t('Email')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Add to Blacklist')}/>
                    </ButtonRow>
                </Form>

                <hr/>

                <h3 className="legend">{t('Blacklisted Emails')}</h3>

                <Table ref={node => this.blacklistTable = node} withHeader dataUrl="rest/blacklist-table" columns={columns} />
            </div>
        );
    }
}