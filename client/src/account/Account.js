'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Trans} from 'react-i18next';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {
    Button,
    ButtonRow,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import passwordValidator from '../../../shared/password-validator';
import interoperableErrors from '../../../shared/interoperable-errors';
import mailtrainConfig from 'mailtrainConfig';
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Account extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {};

        this.initForm({
            serverValidation: {
                url: 'rest/account-validate',
                changed: ['email', 'currentPassword']
            }
        });
    }

    getFormValuesMutator(data) {
        data.password = '';
        data.password2 = '';
        data.currentPassword = '';
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['name', 'email', 'password', 'currentPassword']);
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL('rest/account');
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.loadFormValues();
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const email = state.getIn(['email', 'value']);
        const emailServerValidation = state.getIn(['email', 'serverValidation']);

        if (!email) {
            state.setIn(['email', 'error'], t('emailMustNotBeEmpty'));
        } else if (emailServerValidation && emailServerValidation.invalid) {
            state.setIn(['email', 'error'], t('invalidEmailAddress'));
        } else if (emailServerValidation && emailServerValidation.exists) {
            state.setIn(['email', 'error'], t('theEmailIsAlreadyAssociatedWithAnother'));
        } else if (!emailServerValidation) {
            state.setIn(['email', 'error'], t('validationIsInProgress'));
        } else {
            state.setIn(['email', 'error'], null);
        }


        const name = state.getIn(['name', 'value']);

        if (!name) {
            state.setIn(['name', 'error'], t('fullNameMustNotBeEmpty'));
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
                state.setIn(['currentPassword', 'error'], t('currentPasswordMustNotBeEmpty'));
            } else if (currentPasswordServerValidation && currentPasswordServerValidation.incorrect) {
                state.setIn(['currentPassword', 'error'], t('incorrectPassword'));
            } else if (!currentPasswordServerValidation) {
                state.setIn(['email', 'error'], t('validationIsInProgress'));
            } else {
                state.setIn(['currentPassword', 'error'], null);
            }

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
            this.setFormStatusMessage('info', t('updatingUserProfile'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/account');

            if (submitSuccessful) {
                this.setFlashMessage('success', t('userProfileUpdated'));
                this.hideFormValidation();
                this.updateFormValue('password', '');
                this.updateFormValue('password2', '');
                this.updateFormValue('currentPassword', '');

                this.clearFormStatusMessage();
                this.enableForm();

            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.IncorrectPasswordError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('thePasswordIsIncorrectPossiblyJust')}
                    </span>
                );

                this.scheduleFormRevalidate();
                return;
            }

            if (error instanceof interoperableErrors.DuplicitEmailError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('theEmailIsAlreadyAssignedToAnotherUser')}
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
                    <Title>{t('account')}</Title>

                    <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                        <Fieldset label={t('generalSettings')}>
                            <InputField id="name" label={t('fullName')}/>
                            <InputField id="email" label={t('email')} help={t('thisAddressIsUsedForAccountRecoveryIn')}/>
                        </Fieldset>

                        <Fieldset label={t('passwordChange')}>
                            <p>{t('youOnlyNeedToFillOutThisFormIfYouWantTo')}</p>
                            <InputField id="currentPassword" label={t('currentPassword')} type="password" />
                            <InputField id="password" label={t('newPassword')} type="password" />
                            <InputField id="password2" label={t('confirmPassword')} type="password" />
                        </Fieldset>

                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="check" label={t('update')}/>
                        </ButtonRow>
                    </Form>
                </div>
            );
        } else {
            return (
                <div>
                    <Title>{t('account')}</Title>

                    <p>{t('accountManagementIsNotPossibleBecause')}</p>

                    {mailtrainConfig.externalPasswordResetLink && <p><Trans i18nKey="ifYouWantToChangeThePasswordUseThisLink">If you want to change the password, use <a href={mailtrainConfig.externalPasswordResetLink}>this link</a>.</Trans></p>}
                </div>
            );
        }
    }
}
