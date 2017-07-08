'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withPageHelpers, Title } from '../lib/page'
import {
    withForm, Form, Fieldset, FormSendMethod, InputField, ButtonRow, Button
} from '../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import passwordValidator from '../../../shared/password-validator';
import mailtrainConfig from 'mailtrainConfig';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
export default class Account extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {};

        this.initForm({
            serverValidation: {
                url: '/rest/account-validate',
                changed: ['email', 'username', 'currentPassword']
            }
        });
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL('/rest/account', data => {
            data.password = '';
            data.password2 = '';
            data.currentPassword = '';
        });
    }

    componentDidMount() {
        this.loadFormValues();
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const email = state.getIn(['email', 'value']);
        const emailServerValidation = state.getIn(['email', 'serverValidation']);

        if (!email) {
            state.setIn(['email', 'error'], t('Email must not be empty.'));
        } else if (!emailServerValidation || emailServerValidation.invalid) {
            state.setIn(['email', 'error'], t('Invalid email address.'));
        } else if (!emailServerValidation || emailServerValidation.exists) {
            state.setIn(['email', 'error'], t('The email is already associated with another user in the system.'));
        } else {
            state.setIn(['email', 'error'], null);
        }


        const name = state.getIn(['name', 'value']);

        if (!name) {
            state.setIn(['name', 'error'], t('Full name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }


        const password = state.getIn(['password', 'value']) || '';
        const password2 = state.getIn(['password2', 'value']) || '';
        const currentPassword = state.getIn(['currentPassword', 'value']) || '';

        let passwordMsgs = [];

        if (password || currentPassword) {
            const passwordResults = this.passwordValidator.test(password);

            passwordMsgs.push(...passwordResults.errors);

            const currentPasswordServerValidation = state.getIn(['currentPassword', 'serverValidation']);

            if (!currentPassword) {
                state.setIn(['currentPassword', 'error'], t('Current password must not be empty.'));
            } else if (!currentPasswordServerValidation || currentPasswordServerValidation.incorrect) {
                state.setIn(['currentPassword', 'error'], t('Incorrect password.'));
            } else {
                state.setIn(['currentPassword', 'error'], null);
            }

        }

        if (passwordMsgs.length > 1) {
           passwordMsgs = passwordMsgs.map((msg, idx) => <div key={idx}>{msg}</div>)
        }

        state.setIn(['password', 'error'], passwordMsgs.length > 0 ? passwordMsgs : null);
        state.setIn(['password2', 'error'], password !== password2 ? t('Passwords must match') : null);
    }

    async submitHandler() {
        const t = this.props.t;

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Updating user profile ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, '/rest/account', data => {
                delete data.password2;
            });

            if (submitSuccessful) {
                this.setFlashMessage('success', t('User profile updated'));
                this.hideFormValidation();
                this.updateFormValue('password', '');
                this.updateFormValue('password2', '');
                this.updateFormValue('currentPassword', '');

                this.clearFormStatusMessage();
            } else {
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.IncorrectPasswordError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('The password is incorrect (possibly just changed in another window / session). Enter correct password and try again.')}
                    </span>
                );

                this.scheduleFormRevalidate();
                return;
            }

            if (error instanceof interoperableErrors.DuplicitEmailError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('The email is already assigned to another user. Enter another email and try again.')}
                    </span>
                );

                this.scheduleFormRevalidate();
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;

        if (mailtrainConfig.isAuthMethodLocal) {
            return (
                <div>
                    <Title>{t('Account')}</Title>

                    <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                        <Fieldset label={t('General Settings')}>
                            <InputField id="name" label={t('Full Name')}/>
                            <InputField id="email" label={t('Email')} help={t('This address is used for account recovery in case you loose your password')}/>
                        </Fieldset>

                        <Fieldset label={t('Password Change')}>
                            <p>{t('You only need to fill out this form if you want to change your current password')}</p>
                            <InputField id="currentPassword" label={t('Current Password')} type="password" />
                            <InputField id="password" label={t('New Password')} type="password" />
                            <InputField id="password2" label={t('Confirm Password')} type="password" />
                        </Fieldset>

                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="ok" label={t('Update')}/>
                        </ButtonRow>
                    </Form>
                </div>
            );
        } else {
            <div>
                <Title>{t('Account')}</Title>

                <p>Account management is not possible because Mailtrain is configured to use externally managed users.</p>
            </div>
        }
    }
}
