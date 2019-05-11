'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from 'react-i18next';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    Button,
    ButtonRow,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Update extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        entity: PropTypes.object
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['adminEmail', 'uaCode', 'mapsApiKey', 'shoutout', 'pgpPassphrase', 'pgpPrivateKey', 'defaultHomepage']);
    }

    componentDidMount() {
        this.getFormValuesFromEntity(this.props.entity);
    }

    localValidateFormValues(state) {
        const t = this.props.t;
    }

    @withFormErrorHandlers
    async submitHandler() {
        const t = this.props.t;

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.PUT, 'rest/settings');

        if (submitSuccessful) {
            await this.getFormValuesFromURL('rest/settings');
            this.enableForm();
            this.setFormStatusMessage('success', t('globalSettingsSaved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <Title>{t('globalSettings')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="adminEmail" label={t('adminEmail')} help={t('thisEmailIsUsedAsTheMainContactAndAsA')}/>
                    <InputField id="defaultHomepage" label={t('defaultHomepageUrl')} help={t('thisUrlWillBeUsedInListSubscriptionForms')}/>

                    <InputField id="uaCode" label={t('trackingId')} placeholder={t('uaxxxxxxx')} help={t('enterGoogleAnalyticsTrackingCode')}/>
                    <InputField id="mapsApiKey" label={t('googleMapsApiKey')} placeholder={t('xxxxxx')} help={t('theMapOverviewInCampaignStatistics')}/>

                    <TextArea id="shoutout" label={t('frontpageShoutOut')} help={t('htmlCodeShownInTheFrontPageHeaderSection')}/>

                    <Fieldset label={t('gpgSigning')}>
                        <Trans i18nKey="onlyMessagesThatAreEncryptedCanBeSigned"><p>Only messages that are encrypted can be signed. Subsribers who have not set up a GPG public key in their profile receive normal email messages. Users with GPG key set receive encrypted messages and if you have signing key also set, the messages are signed with this key.</p></Trans>
                        <Trans i18nKey="doNotUseSensitiveKeysHereThePrivateKey"><p className="text-warning">Do not use sensitive keys here. The private key and passphrase are not encrypted in the database.</p></Trans>
                        <InputField id="pgpPassphrase" label={t('privateKeyPassphrase')} placeholder={t('passphraseForTheKeyIfSet')} help={t('onlyFillThisIfYourPrivateKeyIsEncrypted')}/>
                        <TextArea id="pgpPrivateKey" label={t('gpgPrivateKey')} placeholder={t('beginsWithBeginPgpPrivateKeyBlock')} help={t('thisValueIsOptionalIfYouDoNotProvideA')}/>
                    </Fieldset>

                    <hr/>
                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}