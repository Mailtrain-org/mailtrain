'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Title, withPageHelpers} from '../lib/page'
import {Link} from 'react-router-dom'
import {
    Button,
    ButtonRow,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import passwordValidator from '../../../shared/password-validator';
import axios from '../lib/axios';
import interoperableErrors from '../../../shared/interoperable-errors';
import {getUrl} from "../lib/urls";
import {withComponentMixins} from "../lib/decorator-helpers";

const ResetTokenValidationState = {
    PENDING: 0,
    VALID: 1,
    INVALID: 2
};

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers
])
export default class Account extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {
            resetTokenValidationState: ResetTokenValidationState.PENDING
        };

        this.initForm({
            leaveConfirmation: false
        });
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['username', 'password', 'resetToken']);
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
        state.setIn(['password2', 'error'], password !== password2 ? t('passwordsMustMatch') : null);
    }

    @withFormErrorHandlers
    async submitHandler() {
        const t = this.props.t;

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('resettingPassword'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/password-reset');

            if (submitSuccessful) {
                this.navigateToWithFlashMessage('/login', 'success', t('passwordReset-1'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.InvalidTokenError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourPasswordCannotBeReset')}</strong>{' '}
                        {t('thePasswordResetTokenHasExpired')}{' '}<Link to={`/login/forgot/${this.getFormValue('username')}`}>{t('clickHereToRequestANewPasswordResetLink')}</Link>
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
                <p>{t('validatingPasswordResetToken')}</p>
            );

        } else if (this.state.resetTokenValidationState === ResetTokenValidationState.INVALID) {
            return (
                <div>
                    <Title>{t('thePasswordCannotBeReset')}</Title>

                    <p>{t('thePasswordResetTokenHasExpired')}{' '}<Link to={`/login/forgot/${this.getFormValue('username')}`}>{t('clickHereToRequestANewPasswordResetLink')}</Link></p>
                </div>
            );

        } else {
            return (
                <div>
                    <Title>{t('setNewPasswordFor') + ' ' + this.getFormValue('username')}</Title>

                    <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                        <InputField id="password" label={t('newPassword')} type="password"/>
                        <InputField id="password2" label={t('confirmPassword')} type="password"/>

                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="check" label={t('resetPassword')}/>
                        </ButtonRow>
                    </Form>
                </div>
            );
        }
    }
}
