'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    Button,
    ButtonRow,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    TableSelect,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import interoperableErrors from '../../../shared/interoperable-errors';
import passwordValidator from '../../../shared/password-validator';
import mailtrainConfig from 'mailtrainConfig';
import {getDefaultNamespace, NamespaceSelect, validateNamespace} from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.passwordValidator = passwordValidator(props.t);

        this.state = {};

        this.initForm({
            serverValidation: {
                url: 'rest/users-validate',
                changed: mailtrainConfig.isAuthMethodLocal ? ['username', 'email'] : ['username'],
                extra: ['id']
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        permissions: PropTypes.object
    }

    getFormValuesMutator(data) {
        data.password = '';
        data.password2 = '';
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['username', 'name', 'email', 'password', 'namespace', 'role']);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);
        } else {
            this.populateFormValues({
                username: '',
                name: '',
                email: '',
                password: '',
                password2: '',
                namespace: getDefaultNamespace(this.props.permissions),
                role: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        const username = state.getIn(['username', 'value']);
        const usernameServerValidation = state.getIn(['username', 'serverValidation']);

        if (!username) {
            state.setIn(['username', 'error'], t('userNameMustNotBeEmpty'));
        } else if (usernameServerValidation && usernameServerValidation.exists) {
            state.setIn(['username', 'error'], t('theUserNameAlreadyExistsInTheSystem'));
        } else if (!usernameServerValidation) {
            state.setIn(['username', 'error'], t('validationIsInProgress'));
        } else {
            state.setIn(['username', 'error'], null);
        }

        if (!state.getIn(['role', 'value'])) {
            state.setIn(['role', 'error'], t('roleMustBeSelected'));
        } else {
            state.setIn(['role', 'error'], null);
        }


        if (mailtrainConfig.isAuthMethodLocal) {
            const email = state.getIn(['email', 'value']);
            const emailServerValidation = state.getIn(['email', 'serverValidation']);

            if (!email) {
                state.setIn(['email', 'error'], t('emailMustNotBeEmpty-1'));
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

            const passwordResults = this.passwordValidator.test(password);

            let passwordMsgs = [];

            if (!isEdit && !password) {
                passwordMsgs.push(t('passwordMustNotBeEmpty'));
            }

            if (password) {
                passwordMsgs.push(...passwordResults.errors);
            }

            if (passwordMsgs.length > 1) {
                passwordMsgs = passwordMsgs.map((msg, idx) => <div key={idx}>{msg}</div>)
            }

            state.setIn(['password', 'error'], passwordMsgs.length > 0 ? passwordMsgs : null);
            state.setIn(['password2', 'error'], password !== password2 ? t('passwordsMustMatch') : null);
        }

        validateNamespace(t, state);
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/users/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/users'
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('saving'));

            const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

            if (submitResult) {
                if (this.props.entity) {
                    if (submitAndLeave) {
                        this.navigateToWithFlashMessage('/users', 'success', t('userUpdated'));
                    } else {
                        await this.getFormValuesFromURL(`rest/users/${this.props.entity.id}`);
                        this.enableForm();
                        this.setFormStatusMessage('success', t('userUpdated'));
                    }
                } else {
                    if (submitAndLeave) {
                        this.navigateToWithFlashMessage('/users', 'success', t('userCreated'));
                    } else {
                        this.navigateToWithFlashMessage(`/users/${submitResult}/edit`, 'success', t('userCreated'));
                    }
                }
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.DuplicitNameError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('theUsernameIsAlreadyAssignedToAnother')}
                    </span>
                );
                return;
            }

            if (error instanceof interoperableErrors.DuplicitEmailError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('theEmailIsAlreadyAssignedToAnotherUser-1')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const userId = this.getFormValue('id');
        const canDelete = isEdit && userId !== 1 && mailtrainConfig.user.id !== userId;

        const rolesColumns = [
            { data: 1, title: t("name") },
            { data: 2, title: t("description") },
        ];


        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/users/${this.props.entity.id}`}
                        backUrl={`/users/${this.props.entity.id}/edit`}
                        successUrl="/users"
                        deletingMsg={t('deletingUser')}
                        deletedMsg={t('userDeleted')}/>
                }

                <Title>{isEdit ? t('editUser') : t('createUser')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="username" label={t('userName')}/>
                    {mailtrainConfig.isAuthMethodLocal &&
                        <div>
                            <InputField id="name" label={t('fullName')}/>
                            <InputField id="email" label={t('email')}/>
                            <InputField id="password" label={t('password')} type="password"/>
                            <InputField id="password2" label={t('repeatPassword')} type="password"/>
                        </div>
                    }
                    <TableSelect id="role" label={t('role')} withHeader dropdown dataUrl={'rest/shares-roles-table/global'} columns={rolesColumns} selectionLabelIndex={1}/>
                    <NamespaceSelect/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('deleteUser')} to={`/users/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
