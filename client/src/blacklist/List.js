'use strict';

import React, {Component} from "react";
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from "../lib/page";
import {withErrorHandling} from "../lib/error-handling";
import {Table} from "../lib/table";
import {ButtonRow, Form, FormSendMethod, InputField, withForm} from "../lib/form";
import {Button} from "../lib/bootstrap-components";
import {HTTPMethod} from "../lib/axios";
import {tableAddRestActionButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";

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

        this.initForm({
            leaveConfirmation: false,
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
            this.table.refresh();

        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd-1'));
        }
    }

    componentDidMount() {
        this.clearFields();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 0, title: t('email') },
            {
                actions: data => {
                    const actions = [];

                    const email = data[0];

                    tableAddRestActionButton(
                        actions, this,
                        { method: HTTPMethod.DELETE, url: `rest/blacklist/${email}`},
                        { icon: 'trash-alt', label: t('removeFromBlacklist') },
                        t('confirmRemovalFromBlacklist'),
                        t('areYouSureYouWantToRemoveEmailFromThe', {email}),
                        t('removingEmailFromTheBlacklist', {email}),
                        t('emailRemovedFromTheBlacklist', {email}),
                        null
                    );

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Title>{t('blacklist')}</Title>

                <h3 className="legend">{t('addEmailToBlacklist-1')}</h3>
                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="email" label={t('email')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('addToBlacklist')}/>
                    </ButtonRow>
                </Form>

                <hr/>

                <h3 className="legend">{t('blacklistedEmails')}</h3>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/blacklist-table" columns={columns} />
            </div>
        );
    }
}