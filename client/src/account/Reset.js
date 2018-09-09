'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withPageHelpers, Title } from '../lib/page'
import { Link } from 'react-router-dom'
import {
    withForm, Form, Fieldset, FormSendMethod, InputField, ButtonRow, Button
} from '../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import passwordValidator from '../../../shared/password-validator';
import axios from '../lib/axios';
import interoperableErrors from '../../../shared/interoperable-errors';
import {getUrl} from "../lib/urls";

const ResetTokenValidationState = {
    PENDING: 0,
    VALID: 1,
    INVALID: 2
};

@translate()
@withForm
@withPageHelpers
@withErrorHandling
export default class Account extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {
            resetTokenValidationState: ResetTokenValidationState.PENDING
        };

        this.initForm();
    }

    @withAsyncErrorHandler
    async validateResetToken() {
        const params = this.props.match.params;

        const response = await axios.post(getUrl('rest/password-reset-validate'), {
            username: params.username,
            resetToken: params.resetToken
        });

        this.setState({
            resetTokenValidationState: response.data ? ResetTokenValidationState.VALID : ResetTokenValidationState.INVALID
        });
    }

    componentDidMount() {
        const params = this.props.match.params;

        this.populateFormValues({
            username: params.username,
            resetToken: params.resetToken,
            password: '',
            password2: ''
        });

        // noinspection JSIgnoredPromiseFromCall
        this.validateResetToken();
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const password = state.getIn(['password', 'value']) || '';
        const password2 = state.getIn(['password2', 'value']) || '';

        let passwordMsgs = [];

        if (password) {
            const passwordResults = this.passwordValidator.test(password);
            passwordMsgs.push(...passwordResults.errors);
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
            this.setFormStatusMessage('info', t('Resetting password ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/password-reset', data => {
                delete data.password2;
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage('/account/login', 'success', t('Password reset'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.InvalidTokenError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your password cannot be reset.')}</strong>{' '}
                        {t('The password reset token has expired.')}{' '}<Link to={`/account/forgot/${this.getFormValue('username')}`}>{t('Click here to request a new password reset link.')}</Link>
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;

        if (this.state.resetTokenValidationState === ResetTokenValidationState.PENDING) {
            return (
                <p>{t('Validating password reset token ...')}</p>
            );

        } else if (this.state.resetTokenValidationState === ResetTokenValidationState.INVALID) {
            return (
                <div>
                    <Title>{t('The password cannot be reset')}</Title>

                    <p>{t('The password reset token has expired.')}{' '}<Link to={`/account/forgot/${this.getFormValue('username')}`}>{t('Click here to request a new password reset link.')}</Link></p>
                </div>
            );

        } else {
            return (
                <div>
                    <Title>{t('Set new password for') + ' ' + this.getFormValue('username')}</Title>

                    <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                        <InputField id="password" label={t('New Password')} type="password"/>
                        <InputField id="password2" label={t('Confirm Password')} type="password"/>

                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="ok" label={t('Reset password')}/>
                        </ButtonRow>
                    </Form>
                </div>
            );
        }
    }
}
