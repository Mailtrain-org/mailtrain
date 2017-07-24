'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page';
import { withForm, Form, FormSendMethod, InputField, ButtonRow, Button, TreeTableSelect } from '../lib/form';
import axios from '../lib/axios';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import interoperableErrors from '../../../shared/interoperable-errors';
import passwordValidator from '../../../shared/password-validator';
import validators from '../../../shared/validators';
import { ModalDialog } from '../lib/bootstrap-components';
import mailtrainConfig from 'mailtrainConfig';
import { validateNamespace, NamespaceSelect } from '../lib/namespace';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {};

        if (props.edit) {
            this.state.entityId = parseInt(props.match.params.id);
        }

        this.initForm({
            serverValidation: {
                url: '/rest/users-validate',
                changed: ['username', 'email'],
                extra: ['id']
            }
        });
    }

    static propTypes = {
        edit: PropTypes.bool
    }

    isDelete() {
        return this.props.match.params.action === 'delete';
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL(`/rest/users/${this.state.entityId}`, data => {
            data.password = '';
            data.password2 = '';
        });
    }

    componentDidMount() {
        if (this.props.edit) {
            this.loadFormValues();
        } else {
            this.populateFormValues({
                username: '',
                name: '',
                email: '',
                password: '',
                password2: '',
                namespace: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const edit = this.props.edit;

        const username = state.getIn(['username', 'value']);
        const usernameServerValidation = state.getIn(['username', 'serverValidation']);

        if (!username) {
            state.setIn(['username', 'error'], t('User name must not be empty'));
        } else if (!validators.usernameValid(username)) {
            state.setIn(['username', 'error'], t('User name may contain only the following characters: A-Z, a-z, 0-9, "_", "-", "." and may start only with A-Z, a-z, 0-9.'));
        } else if (!usernameServerValidation || usernameServerValidation.exists) {
            state.setIn(['username', 'error'], t('The user name already exists in the system.'));
        } else {
            state.setIn(['username', 'error'], null);
        }


        const email = state.getIn(['email', 'value']);
        const emailServerValidation = state.getIn(['email', 'serverValidation']);

        if (!email) {
            state.setIn(['email', 'error'], t('Email must not be empty'));
        } else if (!emailServerValidation || emailServerValidation.invalid) {
            state.setIn(['email', 'error'], t('Invalid email address.'));
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

        const passwordResults = this.passwordValidator.test(password);

        let passwordMsgs = [];

        if (!edit && !password) {
            passwordMsgs.push(t('Password must not be empty'));
        }

        if (password) {
            passwordMsgs.push(...passwordResults.errors);
        }

        if (passwordMsgs.length > 1) {
           passwordMsgs = passwordMsgs.map((msg, idx) => <div key={idx}>{msg}</div>)
        }

        state.setIn(['password', 'error'], passwordMsgs.length > 0 ? passwordMsgs : null);
        state.setIn(['password2', 'error'], password !== password2 ? t('Passwords must match') : null);

        validateNamespace(t, state);
    }

    async submitHandler() {
        const t = this.props.t;
        const edit = this.props.edit;

        let sendMethod, url;
        if (edit) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/users/${this.state.entityId}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/users'
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving user ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                delete data.password2;
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage('/users', 'success', t('User saved'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.DuplicitNameError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('The username is already assigned to another user.')}
                    </span>
                );
                return;
            }

            if (error instanceof interoperableErrors.DuplicitEmailError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('The email is already assigned to another user.')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    async showDeleteModal() {
        this.navigateTo(`/users/edit/${this.state.entityId}/delete`);
    }

    async hideDeleteModal() {
        this.navigateTo(`/users/edit/${this.state.entityId}`);
    }

    async performDelete() {
        const t = this.props.t;

        await this.hideDeleteModal();

        this.disableForm();
        this.setFormStatusMessage('info', t('Deleting user...'));

        await axios.delete(`/rest/users/${this.state.entityId}`);

        this.navigateToWithFlashMessage('/users', 'success', t('User deleted'));
    }

    render() {
        const t = this.props.t;
        const edit = this.props.edit;
        const userId = this.getFormValue('id');
        const canDelete = userId !== 1 && mailtrainConfig.userId !== userId;

        return (
            <div>
                {edit && canDelete &&
                    <ModalDialog hidden={!this.isDelete()} title={t('Confirm deletion')} onCloseAsync={::this.hideDeleteModal} buttons={[
                        { label: t('No'), className: 'btn-primary', onClickAsync: ::this.hideDeleteModal },
                        { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performDelete }
                    ]}>
                        {t('Are you sure you want to delete user "{{username}}"?', {username: this.getFormValue('username')})}
                    </ModalDialog>
                }

                <Title>{edit ? t('Edit User') : t('Create User')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="username" label={t('User Name')}/>
                    <InputField id="name" label={t('Full Name')}/>
                    <InputField id="email" label={t('Email')}/>
                    <InputField id="password" label={t('Password')} type="password" />
                    <InputField id="password2" label={t('Repeat Password')} type="password" />
                    <NamespaceSelect/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {edit && canDelete && <Button className="btn-danger" icon="remove" label={t('Delete User')}
                                         onClickAsync={::this.showDeleteModal}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
