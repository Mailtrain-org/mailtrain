'use strict';

import React from "react";

import {MailerType, ZoneMTAType} from "../../../shared/send-configurations";
import {CheckBox, Dropdown, Fieldset, InputField, TextArea} from "../lib/form";
import {Trans} from "react-i18next";
import styles from "./styles.scss";
import mailtrainConfig from 'mailtrainConfig';

export const mailerTypesOrder = [
    MailerType.ZONE_MTA,
    MailerType.GENERIC_SMTP,
    MailerType.AWS_SES
];

export function getMailerTypes(t) {
    const mailerTypes = {};

    function initFieldsIfMissing(mutStateData, mailerType) {
        const initVals = mailerTypes[mailerType].initData();

        for (const key in initVals) {
            if (!mutStateData.hasIn([key, 'value']) || mutStateData.getIn([key, 'value']) === undefined) {
                mutStateData.setIn([key, 'value'], initVals[key]);
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
            state.setIn([field, 'error'], t('labelMustNotBeEmpty', {label}));
        } else if (isNaN(value)) {
            state.setIn([field, 'error'], t('labelMustBeANumber', {label}));
        } else {
            state.setIn([field, 'error'], null);
        }
    }

    function getInitCommon() {
        return {
            maxConnections: '5',
            throttling: '',
            logTransactions: false,
            // Add extra throttling params
            throttlingWarmUpDays: '', // Set warm up period in days
            throttlingWarmUpFrom: '', // Set warm up starting date - Unix time
            enableSenderOnDaySun: true,
            enableSenderOnDayMon: true,
            enableSenderOnDayTue: true,
            enableSenderOnDayWed: true,
            enableSenderOnDayThu: true,
            enableSenderOnDayFri: true,
            enableSenderOnDaySat: true,
        
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
        // Add extra throttling params
        data.throttlingWarmUpDays = data.mailer_settings.throttlingWarmUpDays
        data.throttlingWarmUpFrom  = data.mailer_settings.throttlingWarmUpFrom
        data.enableSenderOnDaySun = data.mailer_settings.enableSenderOnDaySun ?? true;
        data.enableSenderOnDayMon = data.mailer_settings.enableSenderOnDayMon ?? true;
        data.enableSenderOnDayTue = data.mailer_settings.enableSenderOnDayTue ?? true;
        data.enableSenderOnDayWed = data.mailer_settings.enableSenderOnDayWed ?? true;
        data.enableSenderOnDayThu = data.mailer_settings.enableSenderOnDayThu ?? true;
        data.enableSenderOnDayFri = data.mailer_settings.enableSenderOnDayFri ?? true;
        data.enableSenderOnDaySat = data.mailer_settings.enableSenderOnDaySat ?? true;
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
        // Add extra throttling params
        data.mailer_settings.throttlingWarmUpDays = Number(data.throttlingWarmUpDays)
        data.mailer_settings.throttlingWarmUpFrom  = Number(data.throttlingWarmUpFrom)
        data.mailer_settings.enableSenderOnDaySun = data.enableSenderOnDaySun;
        data.mailer_settings.enableSenderOnDayMon = data.enableSenderOnDayMon;
        data.mailer_settings.enableSenderOnDayTue = data.enableSenderOnDayTue;
        data.mailer_settings.enableSenderOnDayWed = data.enableSenderOnDayWed;
        data.mailer_settings.enableSenderOnDayThu = data.enableSenderOnDayThu;
        data.mailer_settings.enableSenderOnDayFri = data.enableSenderOnDayFri;
        data.mailer_settings.enableSenderOnDaySat = data.enableSenderOnDaySat;
    }

    function beforeSaveGenericSMTP(data, builtin = false) {
        beforeSaveCommon(data);

        if (!builtin) {
            data.mailer_settings.hostname = data.smtpHostname;
            data.mailer_settings.port = Number(data.smtpPort);
            data.mailer_settings.encryption = data.smtpEncryption;
            data.mailer_settings.useAuth = data.smtpUseAuth;
            data.mailer_settings.user = data.smtpUser;
            data.mailer_settings.password = data.smtpPassword;
            data.mailer_settings.allowSelfSigned = data.smtpAllowSelfSigned;
        }

        data.mailer_settings.maxMessages = Number(data.smtpMaxMessages);
    }

    function validateCommon(state) {
        validateNumber(state, 'maxConnections', 'Max connections');
        validateNumber(state, 'throttling', 'Throttling', true);
        // Validate extra throttling params 
        validateNumber(state, 'throttlingWarmUpDays', 'Throttling Warm Up Days', true);
        validateNumber(state, 'throttlingWarmUpFrom', 'Throttling Warm Up From', true); 
    }

    function validateGenericSMTP(state) {
        validateCommon(state);
        validateNumber(state, 'smtpPort', 'Port', true);
        validateNumber(state, 'smtpMaxMessages', 'Max messages');
    }

    const typeNames = {
        [MailerType.GENERIC_SMTP]: t('genericSmtp'),
        [MailerType.ZONE_MTA]: t('zoneMta'),
        [MailerType.AWS_SES]: t('amazonSes')
    };

    const typeOptions = [
        { key: MailerType.GENERIC_SMTP, label: typeNames[MailerType.GENERIC_SMTP]},
        { key: MailerType.ZONE_MTA, label: typeNames[MailerType.ZONE_MTA]},
        { key: MailerType.AWS_SES, label: typeNames[MailerType.AWS_SES]}
    ];

    const smtpEncryptionOptions = [
        { key: 'NONE', label: t('doNotUseEncryption')},
        { key: 'TLS', label: t('useTls –UsuallySelectedForPort465')},
        { key: 'STARTTLS', label: t('useStarttls –UsuallySelectedForPort587')}
    ];

    const sesRegionOptions = [
        { key: 'us-east-2', label: t('usEastOhio')},
        { key: 'us-east-1', label: t('usEastNVirginia')},
        { key: 'us-west-1', label: t('usWestNCalifornia')},
        { key: 'us-west-2', label: t('usWestOregon')},
        { key: 'af-south-1', label: t('africaCapeTown')},
        { key: 'ap-east-1', label: t('asiaPacificHongKong')},
        { key: 'ap-south-1', label: t('asiaPacificMumbai')},
        { key: 'ap-northeast-3', label: t('asiaPacificOsaka')},
        { key: 'ap-northeast-2', label: t('asiaPacificSeoul')},
        { key: 'ap-southeast-1', label: t('asiaPacificSingapore')},
        { key: 'ap-southeast-2', label: t('asiaPacificSydney')},
        { key: 'ap-northeast-1', label: t('asiaPacificTokyo')},
        { key: 'ca-central-1', label: t('canadaCentral')},
        { key: 'eu-central-1', label: t('europeFrankfurt')},
        { key: 'eu-west-1', label: t('europeIreland')},
        { key: 'eu-west-2', label: t('europeLondon')},
        { key: 'eu-south-1', label: t('europeMilan')},
        { key: 'eu-west-3', label: t('europeParis')},
        { key: 'eu-north-1', label: t('europeStockholm')},
        { key: 'me-south-1', label: t('middleEastBahrain')},
        { key: 'sa-east-1', label: t('southAmericaSaoPaulo')}
    ];

    const zoneMtaTypeOptions = [];

    if (mailtrainConfig.builtinZoneMTAEnabled) {
        zoneMtaTypeOptions.push({ key: ZoneMTAType.BUILTIN, label: t('builtinZoneMta')});
    }
    zoneMtaTypeOptions.push({ key: ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF, label: t('dynamicConfigurationOfDkimKeysViaZoneMt')});
    zoneMtaTypeOptions.push({ key: ZoneMTAType.WITH_HTTP_CONF, label: t('dynamicConfigurationOfDkimKeysViaZoneMt-1')});
    zoneMtaTypeOptions.push({ key: ZoneMTAType.REGULAR, label: t('noDynamicConfigurationOfDkimKeys')});

    mailerTypes[MailerType.GENERIC_SMTP] = {
        typeName: typeNames[MailerType.GENERIC_SMTP],
        getForm: owner =>
            <div>
                <Fieldset label={t('mailerSettings')}>
                    <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                    <InputField id="smtpHostname" label={t('hostname')} placeholder={t('hostnameEgSmtpexamplecom')}/>
                    <InputField id="smtpPort" label={t('port')} placeholder={t('portEg465AutodetectedIfLeftBlank')}/>
                    <Dropdown id="smtpEncryption" label={t('encryption')} options={smtpEncryptionOptions}/>
                    <CheckBox id="smtpUseAuth" text={t('enableSmtpAuthentication')}/>
                    { owner.getFormValue('smtpUseAuth') &&
                    <div>
                        <InputField id="smtpUser" label={t('username')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                        <InputField id="smtpPassword" type="password" label={t('password')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                    </div>
                    }
                </Fieldset>
                <Fieldset label={t('advancedMailerSettings')}>
                    <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                    <CheckBox id="smtpAllowSelfSigned" text={t('allowSelfsignedCertificates')}/>
                    <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                    <InputField id="smtpMaxMessages" label={t('maxMessages')} placeholder={t('theCountOfMaxMessagesEg100')} help={t('theNumberOfMessagesToSendThroughASingle')}/>
                    <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
                </Fieldset>                    
                <Fieldset label={t('extraThrottlingMailerSettings')}>    
                    <InputField id="throttlingWarmUpDays" label={t('throttlingWarmUpDays')} placeholder={t('throttlingWarmUpDaysEg10')} help={t('senderWarmUpPeriodInDays')}/>
                    <InputField id="throttlingWarmUpFrom" label={t('throttlingWarmUpFrom')} placeholder={t('throttlingWarmUpFromDateInUnixTimestampEg1648735303000')} help={t('senderWarmUpPeriodStartingDayInUnixTimestamp')}/>
                    <CheckBox id="enableSenderOnDaySun" text={t('enableSenderOnDaySun')}/>
                    <CheckBox id="enableSenderOnDayMon" text={t('enableSenderOnDayMon')}/>
                    <CheckBox id="enableSenderOnDayTue" text={t('enableSenderOnDayTue')}/>
                    <CheckBox id="enableSenderOnDayWed" text={t('enableSenderOnDayWed')}/>
                    <CheckBox id="enableSenderOnDayThu" text={t('enableSenderOnDayThu')}/>
                    <CheckBox id="enableSenderOnDayFri" text={t('enableSenderOnDayFri')}/>
                    <CheckBox id="enableSenderOnDaySat" text={t('enableSenderOnDaySat')}/>
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
        typeName: typeNames[MailerType.ZONE_MTA],
        getForm: owner => {
            const zoneMtaType = Number.parseInt(owner.getFormValue('zoneMtaType'));
            return (
                <div>
                    <Fieldset label={t('mailerSettings')}>
                        <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                        <Dropdown id="zoneMtaType" label={t('dynamicConfiguration')} options={zoneMtaTypeOptions}/>
                        {(zoneMtaType === ZoneMTAType.REGULAR || zoneMtaType === ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF || zoneMtaType === ZoneMTAType.WITH_HTTP_CONF) &&
                            <div>
                                <InputField id="smtpHostname" label={t('hostname')} placeholder={t('hostnameEgSmtpexamplecom')}/>
                                <InputField id="smtpPort" label={t('port')} placeholder={t('portEg465AutodetectedIfLeftBlank')}/>
                                <Dropdown id="smtpEncryption" label={t('encryption')} options={smtpEncryptionOptions}/>
                                <CheckBox id="smtpUseAuth" text={t('enableSmtpAuthentication')}/>
                                { owner.getFormValue('smtpUseAuth') &&
                                <div>
                                    <InputField id="smtpUser" label={t('username')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                                    <InputField id="smtpPassword" type="password" label={t('password')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                                </div>
                                }
                            </div>
                        }
                    </Fieldset>
                    {(zoneMtaType === ZoneMTAType.BUILTIN || zoneMtaType === ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF || zoneMtaType === ZoneMTAType.WITH_HTTP_CONF) &&
                        <Fieldset label={t('dkimSigning')}>
                            <Trans i18nKey="ifYouAreUsingZoneMtaThenMailtrainCan"><p>If you are using ZoneMTA then Mailtrain can provide a DKIM key for signing all outgoing messages.</p></Trans>
                            <Trans i18nKey="doNotUseSensitiveKeysHereThePrivateKeyIs"><p className="text-warning">Do not use sensitive keys here. The private key is not encrypted in the database.</p></Trans>
                            {zoneMtaType === ZoneMTAType.WITH_HTTP_CONF &&
                                <InputField id="dkimApiKey" label={t('zoneMtaDkimApiKey')} help={t('secretValueKnownToZoneMtaForRequesting')}/>
                            }
                            <InputField id="dkimDomain" label={t('dkimDomain')} help={t('leaveBlankToUseTheSenderEmailAddress')}/>
                            <InputField id="dkimSelector" label={t('dkimKeySelector')} help={t('signingIsDisabledWithoutAValidSelector')}/>
                            <TextArea id="dkimPrivateKey" className={styles.dkimPrivateKey} label={t('dkimPrivateKey')} placeholder={t('beginsWithBeginRsaPrivateKey')} help={t('signingIsDisabledWithoutAValidPrivateKey')}/>
                        </Fieldset>
                    }
                    <Fieldset label={t('advancedMailerSettings')}>
                        <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                        <CheckBox id="smtpAllowSelfSigned" text={t('allowSelfsignedCertificates')}/>
                        <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                        <InputField id="smtpMaxMessages" label={t('maxMessages')} placeholder={t('theCountOfMaxMessagesEg100')} help={t('theNumberOfMessagesToSendThroughASingle')}/>
                        <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
                    </Fieldset>
                </div>
            );
        },
        initData: () => ({
            ...getInitGenericSMTP(),
            zoneMtaType: mailtrainConfig.builtinZoneMTAEnabled ? ZoneMTAType.BUILTIN : ZoneMTAType.REGULAR,
            dkimApiKey: '',
            dkimDomain: '',
            dkimSelector: '',
            dkimPrivateKey: ''
        }),
        afterLoad: data => {
            afterLoadGenericSMTP(data);
            data.zoneMtaType = data.mailer_settings.zoneMtaType;
            data.dkimApiKey = data.mailer_settings.dkimApiKey;
            data.dkimDomain = data.mailer_settings.dkimDomain;
            data.dkimSelector = data.mailer_settings.dkimSelector;
            data.dkimPrivateKey = data.mailer_settings.dkimPrivateKey;
        },
        beforeSave: data => {
            const zoneMtaType = Number.parseInt(data.zoneMtaType);

            beforeSaveGenericSMTP(data, zoneMtaType === ZoneMTAType.BUILTIN);

            data.mailer_settings.zoneMtaType = zoneMtaType;
            if (zoneMtaType === ZoneMTAType.BUILTIN || zoneMtaType === ZoneMTAType.WITH_HTTP_CONF || zoneMtaType === ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF) {
                data.mailer_settings.dkimDomain = data.dkimDomain;
                data.mailer_settings.dkimSelector = data.dkimSelector;
                data.mailer_settings.dkimPrivateKey = data.dkimPrivateKey;
            }
            if (zoneMtaType === ZoneMTAType.WITH_HTTP_CONF) {
                data.mailer_settings.dkimApiKey = data.dkimApiKey;
            }

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
        typeName: typeNames[MailerType.AWS_SES],
        getForm: owner =>
            <div>
                <Fieldset label={t('mailerSettings')}>
                    <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                    <InputField id="sesKey" label={t('accessKey')} placeholder={t('awsAccessKeyId')}/>
                    <InputField id="sesSecret" label={t('accessSecret')} placeholder={t('awsSecretAccessKey')} type="password"/>
                    <Dropdown id="sesRegion" label={t('region')} options={sesRegionOptions}/>
                </Fieldset>
                <Fieldset label={t('advancedMailerSettings')}>
                    <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                    <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                    <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
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
