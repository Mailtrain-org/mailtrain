'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../lib/page'
import {
    withForm,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    Dropdown,
    ButtonRow,
    Button,
    CheckBox,
    Fieldset
} from '../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { validateNamespace, NamespaceSelect } from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";

import { getMailerTypes, mailerTypesOrder } from "./helpers";

import {MailerType} from "../../../shared/send-configurations";

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.mailerTypes = getMailerTypes(props.t);

        this.typeOptions = [];
        for (const type of mailerTypesOrder) {
            this.typeOptions.push({
                key: type,
                label: this.mailerTypes[type].typeName
            });
        }

        this.state = {};

        this.initForm({
            onChangeBeforeValidation: {
                mailer_type: ::this.onMailerTypeChanged
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object
    }

    onMailerTypeChanged(mutState, key, oldType, type) {
        if (type) {
            this.mailerTypes[type].afterTypeChange(mutState);
        }
    }


    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                this.mailerTypes[data.type].afterLoad(data);
            });

        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: mailtrainConfig.user.namespace,
                from_email_overridable: false,
                from_name_overridable: false,
                subject_overridable: false,
                mailer_type: MailerType.ZONE_MTA,
                ...this.mailerTypes[MailerType.ZONE_MTA].initData()
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['mailer_type', 'value'])) {
            state.setIn(['mailer_type', 'error'], t('Mailer type must be selected'));
        } else {
            state.setIn(['mailer_type', 'error'], null);
        }

        validateNamespace(t, state);
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/send-configurations/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/send-configurations'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            this.mailerTypes[data.type].beforeSave(data);
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/send-configurations', 'success', t('Send configuration saved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const typeKey = this.getFormValue('mailer_type');
        let mailerForm = null;
        if (typeKey) {
            mailerForm = this.mailerTypes[typeKey].getForm(this);
        }

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/send-configurations/${this.props.entity.id}`}
                        cudUrl={`/send-configurations/${this.props.entity.id}/edit`}
                        listUrl="/send-configurations"
                        deletingMsg={t('Deleting send configuration ...')}
                        deletedMsg={t('Send configuration deleted')}/>
                }

                <Title>{isEdit ? t('Edit Send Configuration') : t('Create Send Configuration')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>

                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>
                    <NamespaceSelect/>

                    <Fieldset label={t('Email Header')}>
                        <InputField id="from_email" label={t('Default "from" email')}/>
                        <CheckBox id="from_email_overridable" text={t('Overridable')}/>
                        <InputField id="from_name" label={t('Default "from" name')}/>
                        <CheckBox id="from_name_overridable" text={t('Overridable')}/>
                        <InputField id="subject" label={t('Subject')}/>
                        <CheckBox id="subject_overridable" text={t('Overridable')}/>
                    </Fieldset>

                    <Fieldset label={t('Mailer Settings')}>
                        <Dropdown id="type" label={t('Type')} options={this.typeOptions}/>
                        {mailerForm}
                    </Fieldset>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {canDelete &&
                            <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/send-configurations/${this.props.entity.id}/delete`}/>
                        }
                    </ButtonRow>
                </Form>
            </div>
        );
    }

/*
                    <Fieldset label={t('GPG Signing')}>
                        <Trans><p>Only messages that are encrypted can be signed. Subsribers who have not set up a GPG public key in their profile receive normal email messages. Users with GPG key set receive encrypted messages and if you have signing key also set, the messages are signed with this key.</p></Trans>
                        <Trans><p className="text-warning">Do not use sensitive keys here. The private key and passphrase are not encrypted in the database.</p></Trans>
                        <InputField id="gpg_signing_key_passphrase" label={t('Private key passphrase')} placeholder={t('Passphrase for the key if set')} help={t('Only fill this if your private key is encrypted with a passphrase')}/>
                        <TextArea id="gpg_signing_key" label={t('GPG private key')} placeholder={t('Begins with \'-----BEGIN PGP PRIVATE KEY BLOCK-----\'')} help={t('This value is optional. If you do not provide a private key GPG encrypted messages are sent without signing.')}/>

                    </Fieldset>


 */
}
