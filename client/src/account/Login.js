'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withPageHelpers, Title } from '../lib/page'
import { Link } from 'react-router-dom'
import {
    withForm, Form, FormSendMethod, InputField, CheckBox, ButtonRow, Button, AlignedRow
} from '../lib/form';
import { withErrorHandling } from '../lib/error-handling';
import qs from 'querystringify';
import interoperableErrors from '../../../shared/interoperable-errors';
import mailtrainConfig from 'mailtrainConfig';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    componentDidMount() {
        this.populateFormValues({
            username: '',
            password: '',
            remember: false
        });
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const username = state.getIn(['username', 'value']);
        if (!username) {
            state.setIn(['username', 'error'], t('User name must not be empty'));
        } else {
            state.setIn(['username', 'error'], null);
        }

        const password = state.getIn(['password', 'value']);
        if (!username) {
            state.setIn(['password', 'error'], t('Password must not be empty'));
        } else {
            state.setIn(['password', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Verifying credentials ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, '/rest/login');
            /* FIXME, once we turn Mailtrain to single-page application, we should receive authenticated config (from client-helpers.js:getAuthenticatedConfig)
               as part of login response. Then we should integrate it in the mailtrainConfig global variable. */

            if (submitSuccessful) {
                const nextUrl = qs.parse(this.props.location.search).next || '/';

                /* FIXME, once we turn Mailtrain to single-page application, this should become navigateTo */
                window.location = nextUrl;
            } else {
                this.setFormStatusMessage('warning', t('Please enter your credentials and try again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.IncorrectPasswordError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Invalid username or password.')}</strong>
                    </span>
                );

                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;

        let passwordResetLink;
        if (mailtrainConfig.isAuthMethodLocal) {
            passwordResetLink = <Link to={`/account/forgot/${this.getFormValue('username')}`}>{t('Forgot your password?')}</Link>;
        } else if (mailtrainConfig.externalPasswordResetLink) {
            passwordResetLink = <a href={mailtrainConfig.externalPasswordResetLink}>{t('Forgot your password?')}</a>;
        }

        return (
            <div>
                <Title>{t('Sign in')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="username" label={t('Username')}/>
                    <InputField id="password" label={t('Password')} type="password" />
                    <CheckBox id="remember" text={t('Remember me')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Sign in')}/>
                        {passwordResetLink}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
