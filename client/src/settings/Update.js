'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Trans,
    translate
} from 'react-i18next';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page';
import {
    Button,
    ButtonRow,
    Fieldset,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    withForm
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class Update extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        entity: PropTypes.object
    }

    componentDidMount() {
        this.getFormValuesFromEntity(this.props.entity);
    }

    localValidateFormValues(state) {
        const t = this.props.t;
    }

    async submitHandler() {
        const t = this.props.t;

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.PUT, '/rest/settings');

        if (submitSuccessful) {
            await this.getFormValuesFromURL('/rest/settings');
            this.enableForm();
            this.setFormStatusMessage('success', t('Global settings saved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <Title>{t('Global Settings')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="adminEmail" label={t('Admin email')} help={t('This email is used as the main contact and as a default email address if no email address is specified in list settings.')}/>
                    <InputField id="defaultHomepage" label={t('Default homepage URL')} help={t('This URL will be used in list subscription forms if no homepage is specified in list settings.')}/>

                    <InputField id="uaCode" label={t('Tracking ID')} placeholder={t('UA-XXXXX-XX')} help={t('Enter Google Analytics tracking code')}/>

                    <TextArea id="shoutout" label={t('Frontpage shout out')} help={t('HTML code shown in the front page header section')}/>

                    <Fieldset label={t('GPG Signing')}>
                        <Trans><p>Only messages that are encrypted can be signed. Subsribers who have not set up a GPG public key in their profile receive normal email messages. Users with GPG key set receive encrypted messages and if you have signing key also set, the messages are signed with this key.</p></Trans>
                        <Trans><p className="text-warning">Do not use sensitive keys here. The private key and passphrase are not encrypted in the database.</p></Trans>
                        <InputField id="pgpPassphrase" label={t('Private key passphrase')} placeholder={t('Passphrase for the key if set')} help={t('Only fill this if your private key is encrypted with a passphrase')}/>
                        <TextArea id="pgpPrivateKey" label={t('GPG private key')} placeholder={t('Begins with \'-----BEGIN PGP PRIVATE KEY BLOCK-----\'')} help={t('This value is optional. If you do not provide a private key GPG encrypted messages are sent without signing.')}/>
                    </Fieldset>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}