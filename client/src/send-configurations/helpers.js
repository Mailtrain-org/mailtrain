'use strict';

import React from "react";

import {MailerType} from "../../../shared/send-configurations";
import {
    CheckBox,
    Dropdown,
    Fieldset,
    InputField,
    TextArea
} from "../lib/form";
import {Trans} from "react-i18next";

export const mailerTypesOrder = [
    MailerType.ZONE_MTA,
    MailerType.GENERIC_SMTP,
    MailerType.AWS_SES
];

export function getMailerTypes(t) {
    const mailerTypes = {};

    function initFieldsIfMissing(mutState, mailerType) {
        const initVals = mailerTypes[mailerType].initData();

        for (const key in initVals) {
            if (!mutState.hasIn([key])) {
                mutState.setIn([key, 'value'], initVals[key]);
            }
        }
    }

    function clearBeforeSave(data) {
        for (const mailerKey in mailerTypes) {
            const initVals = mailerTypes[mailerKey].initData();
            for (const fieldKey in initVals) {
                delete data[fieldKey];
            }
        }
    }

    function validateNumber(state, field, label, emptyAllowed = false) {
        const value = state.getIn([field, 'value']);
        if (typeof value === 'string' && value.trim() === '' && !emptyAllowed) { // After load, the numerical values can be still numbers
            state.setIn([field, 'error'], t('{{label}} must not be empty', {label}));
        } else if (isNaN(value)) {
            state.setIn([field, 'error'], t('{{label}} must be a number', {label}));
        } else {
            state.setIn([field, 'error'], null);
        }
    }

    function getInitCommon() {
        return {
            maxConnections: '5',
            throttling: '',
            logTransactions: false
        };
    }

    function getInitGenericSMTP() {
        return {
            ...getInitCommon(),
            smtpHostname: '',
            smtpPort: '',
            smtpEncryption: 'NONE',
            smtpUseAuth: false,
            smtpUser: '',
            smtpPassword: '',
            smtpAllowSelfSigned: false,
            smtpMaxMessages: '100'
        };
    }

    function afterLoadCommon(data) {
        data.maxConnections = data.mailer_settings.maxConnections;
        data.throttling = data.mailer_settings.throttling || '';
        data.logTransactions = data.mailer_settings.logTransactions;
    }

    function afterLoadGenericSMTP(data) {
        afterLoadCommon(data);
        data.smtpHostname = data.mailer_settings.hostname;
        data.smtpPort = data.mailer_settings.port || '';
        data.smtpEncryption = data.mailer_settings.encryption;
        data.smtpUseAuth = data.mailer_settings.useAuth;
        data.smtpUser = data.mailer_settings.user;
        data.smtpPassword = data.mailer_settings.password;
        data.smtpAllowSelfSigned = data.mailer_settings.allowSelfSigned;
        data.smtpMaxMessages = data.mailer_settings.maxMessages;
    }

    function beforeSaveCommon(data) {
        data.mailer_settings = {};
        data.mailer_settings.maxConnections = Number(data.maxConnections);
        data.mailer_settings.throttling = Number(data.throttling);
        data.mailer_settings.logTransactions = data.logTransactions;
    }

    function beforeSaveGenericSMTP(data) {
        beforeSaveCommon(data);
        data.mailer_settings.hostname = data.smtpHostname;
        data.mailer_settings.port = Number(data.smtpPort);
        data.mailer_settings.encryption = data.smtpEncryption;
        data.mailer_settings.useAuth = data.smtpUseAuth;
        data.mailer_settings.user = data.smtpUser;
        data.mailer_settings.password = data.smtpPassword;
        data.mailer_settings.allowSelfSigned = data.smtpAllowSelfSigned;
        data.mailer_settings.maxMessages = Number(data.smtpMaxMessages);
    }

    function validateCommon(state) {
        validateNumber(state, 'maxConnections', 'Max connections');
        validateNumber(state, 'throttling', 'Throttling', true);
    }

    function validateGenericSMTP(state) {
        validateCommon(state);
        validateNumber(state, 'smtpPort', 'Port', true);
        validateNumber(state, 'smtpMaxMessages', 'Max messages');
    }

    const typeOptions = [
        { key: MailerType.GENERIC_SMTP, label: t('Generic SMTP')},
        { key: MailerType.ZONE_MTA, label: t('Zone MTA')},
        { key: MailerType.AWS_SES, label: t('Amazon SES')}
    ];

    const smtpEncryptionOptions = [
        { key: 'NONE', label: t('Do not use encryption')},
        { key: 'TLS', label: t('Use TLS – usually selected for port 465')},
        { key: 'STARTTLS', label: t('Use STARTTLS – usually selected for port 587 and 25')}
    ];

    const sesRegionOptions = [
        { key: 'us-east-1', label: t('US-EAST-1')},
        { key: 'us-west-2', label: t('US-WEST-2')},
        { key: 'eu-west-1', label: t('EU-WEST-1')}
    ];

    mailerTypes[MailerType.GENERIC_SMTP] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('Mailer Settings')}>
                    <Dropdown id="mailer_type" label={t('Mailer type')} options={typeOptions}/>
                    <InputField id="smtpHostname" label={t('Hostname')} placeholder={t('Hostname, eg. smtp.example.com')}/>
                    <InputField id="smtpPort" label={t('Port')} placeholder={t('Port, eg. 465. Autodetected if left blank')}/>
                    <Dropdown id="smtpEncryption" label={t('Encryption')} options={smtpEncryptionOptions}/>
                    <CheckBox id="smtpUseAuth" text={t('Enable SMTP authentication')}/>
                    { owner.getFormValue('smtpUseAuth') &&
                    <div>
                        <InputField id="smtpUser" label={t('Username')} placeholder={t('Username, eg. myaccount@example.com')}/>
                        <InputField id="smtpPassword" label={t('Password')} placeholder={t('Username, eg. myaccount@example.com')}/>
                    </div>
                    }
                </Fieldset>
                <Fieldset label={t('Advanced Mailer Settings')}>
                    <CheckBox id="logTransactions" text={t('Log SMTP transactions')}/>
                    <CheckBox id="smtpAllowSelfSigned" text={t('Allow self-signed certificates')}/>
                    <InputField id="maxConnections" label={t('Max connections')} placeholder={t('The count of max connections, eg. 10')} help={t('The count of maximum simultaneous connections to make against the SMTP server (defaults to 5). This limit is per sending process.')}/>
                    <InputField id="smtpMaxMessages" label={t('Max messages')} placeholder={t('The count of max messages, eg. 100')} help={t('The number of messages to send through a single connection before the connection is closed and reopened (defaults to 100)')}/>
                    <InputField id="throttling" label={t('Throttling')} placeholder={t('Messages per hour eg. 1000')} help={t('Maximum number of messages to send in an hour. Leave empty or zero for no throttling. If your provider uses a different speed limit (messages/minute or messages/second) then convert this limit into messages/hour (1m/s => 3600m/h). This limit is per sending process.')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitGenericSMTP()
        }),
        afterLoad: data => {
            afterLoadGenericSMTP(data);
        },
        beforeSave: data => {
            beforeSaveGenericSMTP(data);
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.GENERIC_SMTP);
        },
        validate: state => {
            validateGenericSMTP(state);
        }
    };

    mailerTypes[MailerType.ZONE_MTA] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('Mailer Settings')}>
                    <Dropdown id="mailer_type" label={t('Mailer type')} options={typeOptions}/>
                    <InputField id="smtpHostname" label={t('Hostname')} placeholder={t('Hostname, eg. smtp.example.com')}/>
                    <InputField id="smtpPort" label={t('Port')} placeholder={t('Port, eg. 465. Autodetected if left blank')}/>
                    <Dropdown id="smtpEncryption" label={t('Encryption')} options={smtpEncryptionOptions}/>
                    <CheckBox id="smtpUseAuth" text={t('Enable SMTP authentication')}/>
                    { owner.getFormValue('smtpUseAuth') &&
                    <div>
                        <InputField id="smtpUser" label={t('Username')} placeholder={t('Username, eg. myaccount@example.com')}/>
                        <InputField id="smtpPassword" label={t('Password')} placeholder={t('Username, eg. myaccount@example.com')}/>
                    </div>
                    }
                </Fieldset>
                <Fieldset label={t('DKIM Signing')}>
                    <Trans><p>If you are using ZoneMTA then Mailtrain can provide a DKIM key for signing all outgoing messages. Other services usually provide their own means to DKIM sign your messages.</p></Trans>
                    <Trans><p className="text-warning">Do not use sensitive keys here. The private key is not encrypted in the database.</p></Trans>
                    <InputField id="dkimApiKey" label={t('ZoneMTA DKIM API key')} help={t('Secret value known to ZoneMTA for requesting DKIM key information. If this value was generated by the Mailtrain installation script then you can keep it as it is.')}/>
                    <InputField id="dkimDomain" label={t('DKIM domain')} help={t('Leave blank to use the sender email address domain.')}/>
                    <InputField id="dkimSelector" label={t('DKIM key selector')} help={t('Signing is disabled without a valid selector value.')}/>
                    <TextArea id="dkimPrivateKey" label={t('DKIM private key')} placeholder={t('Begins with "-----BEGIN RSA PRIVATE KEY-----"')} help={t('Signing is disabled without a valid private key.')}/>
                </Fieldset>
                <Fieldset label={t('Advanced Mailer Settings')}>
                    <CheckBox id="logTransactions" text={t('Log SMTP transactions')}/>
                    <CheckBox id="smtpAllowSelfSigned" text={t('Allow self-signed certificates')}/>
                    <InputField id="maxConnections" label={t('Max connections')} placeholder={t('The count of max connections, eg. 10')} help={t('The count of maximum simultaneous connections to make against the SMTP server (defaults to 5). This limit is per sending process.')}/>
                    <InputField id="smtpMaxMessages" label={t('Max messages')} placeholder={t('The count of max messages, eg. 100')} help={t('The number of messages to send through a single connection before the connection is closed and reopened (defaults to 100)')}/>
                    <InputField id="throttling" label={t('Throttling')} placeholder={t('Messages per hour eg. 1000')} help={t('Maximum number of messages to send in an hour. Leave empty or zero for no throttling. If your provider uses a different speed limit (messages/minute or messages/second) then convert this limit into messages/hour (1m/s => 3600m/h). This limit is per sending process.')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitGenericSMTP(),
            dkimApiKey: '',
            dkimDomain: '',
            dkimSelector: '',
            dkimPrivateKey: ''
        }),
        afterLoad: data => {
            afterLoadGenericSMTP(data);
            data.dkimApiKey = data.mailer_settings.dkimApiKey;
            data.dkimDomain = data.mailer_settings.dkimDomain;
            data.dkimSelector = data.mailer_settings.dkimSelector;
            data.dkimPrivateKey = data.mailer_settings.dkimPrivateKey;
        },
        beforeSave: data => {
            beforeSaveGenericSMTP(data);
            data.mailer_settings.dkimApiKey = data.dkimApiKey;
            data.mailer_settings.dkimDomain = data.dkimDomain;
            data.mailer_settings.dkimSelector = data.dkimSelector;
            data.mailer_settings.dkimPrivateKey = data.dkimPrivateKey;
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.ZONE_MTA);
        },
        validate: state => {
            validateGenericSMTP(state);
        }
    };

    mailerTypes[MailerType.AWS_SES] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('Mailer Settings')}>
                    <Dropdown id="mailer_type" label={t('Mailer type')} options={typeOptions}/>
                    <InputField id="sesKey" label={t('Access key')} placeholder={t('AWS access key ID')}/>
                    <InputField id="sesSecret" label={t('Port')} placeholder={t('AWS secret access key')}/>
                    <Dropdown id="sesRegion" label={t('Region')} options={sesRegionOptions}/>
                </Fieldset>
                <Fieldset label={t('Advanced Mailer Settings')}>
                    <CheckBox id="logTransactions" text={t('Log SMTP transactions')}/>
                    <InputField id="maxConnections" label={t('Max connections')} placeholder={t('The count of max connections, eg. 10')} help={t('The count of maximum simultaneous connections to make against the SMTP server (defaults to 5). This limit is per sending process.')}/>
                    <InputField id="throttling" label={t('Throttling')} placeholder={t('Messages per hour eg. 1000')} help={t('Maximum number of messages to send in an hour. Leave empty or zero for no throttling. If your provider uses a different speed limit (messages/minute or messages/second) then convert this limit into messages/hour (1m/s => 3600m/h). This limit is per sending process.')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitCommon(),
            sesKey: '',
            sesSecret: '',
            sesRegion: ''
        }),
        afterLoad: data => {
            afterLoadCommon(data);
            data.sesKey = data.mailer_settings.key;
            data.sesSecret = data.mailer_settings.secret;
            data.sesRegion = data.mailer_settings.region;
        },
        beforeSave: data => {
            beforeSaveCommon(data);
            data.mailer_settings.key = data.sesKey;
            data.mailer_settings.secret = data.sesSecret;
            data.mailer_settings.region = data.sesRegion;
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.AWS_SES);
        },
        validate: state => {
            validateCommon(state);
        }
    };

    return mailerTypes;
}