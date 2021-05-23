'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {
    AlignedRow,
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TableSelect,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {getDefaultNamespace, NamespaceSelect, validateNamespace} from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import {getModals, getTagLanguages, getTemplateTypes, getTypeForm, ResourceType} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import campaignsStyles from "./styles.scss";
import {getUrl} from "../lib/urls";
import {campaignOverridables, CampaignSource, CampaignStatus} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {getCampaignLabels, ListsSelectorHelper} from "../campaigns/helpers";
import {withComponentMixins} from "../lib/decorator-helpers";
import interoperableErrors from "../../../shared/interoperable-errors";
import {Trans} from "react-i18next";

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

        const t = props.t;

        this.listsSelectorHelper = new ListsSelectorHelper(this, t, 'lists', true);

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN, true);
        this.tagLanguages = getTagLanguages(props.t);

        this.mailerTypes = getMailerTypes(props.t);

        const { campaignTypeLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;

        this.sourceLabels = {
            [CampaignSource.CUSTOM]: t('customContent'),
            [CampaignSource.CUSTOM_FROM_CAMPAIGN]: t('customContentClonedFromAnotherCampaign'),
            [CampaignSource.TEMPLATE]: t('template'),
            [CampaignSource.CUSTOM_FROM_TEMPLATE]: t('customContentClonedFromTemplate'),
            [CampaignSource.URL]: t('url')
        };

        const sourceLabelsOrder = [
            CampaignSource.CUSTOM, CampaignSource.CUSTOM_FROM_CAMPAIGN , CampaignSource.TEMPLATE, CampaignSource.CUSTOM_FROM_TEMPLATE, CampaignSource.URL
        ];

        this.sourceOptions = [];
        for (const key of sourceLabelsOrder) {
            this.sourceOptions.push({key, label: this.sourceLabels[key]});
        }

        this.customTemplateTypeOptions = [];
        for (const key of mailtrainConfig.editors) {
            this.customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        this.customTemplateTagLanguageOptions = [];
        for (const key of mailtrainConfig.tagLanguages) {
            this.customTemplateTagLanguageOptions.push({key, label: this.tagLanguages[key].name});
        }

        this.state = {
            sendConfiguration: null
        };

        this.initForm({
            onChange: {
                send_configuration: ::this.onSendConfigurationChanged
            },
            onChangeBeforeValidation: ::this.onFormChangeBeforeValidation
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        permissions: PropTypes.object,
        type: PropTypes.number
    }

    onFormChangeBeforeValidation(mutStateData, key, oldValue, newValue) {
        let match;

        if (key === 'data_sourceCustom_type') {
            if (newValue) {
                this.templateTypes[newValue].afterTypeChange(mutStateData);
            }
        }

        if (key === 'data_sourceCustom_tag_language') {
            if (newValue) {
                const currentType = this.getFormValue('data_sourceCustom_type');
                const isEdit = !!this.props.entity;
                this.templateTypes[currentType].afterTagLanguageChange(mutStateData, isEdit);
            }
        }

        this.listsSelectorHelper.onFormChangeBeforeValidation(mutStateData, key, oldValue, newValue);
    }

    onSendConfigurationChanged(newState, key, oldValue, sendConfigurationId) {
        newState.sendConfiguration = null;
        // noinspection JSIgnoredPromiseFromCall
        this.fetchSendConfiguration(sendConfigurationId);
    }

    @withAsyncErrorHandler
    async fetchSendConfiguration(sendConfigurationId) {
        if (sendConfigurationId) {
            this.fetchSendConfigurationId = sendConfigurationId;

            try {
                const result = await axios.get(getUrl(`rest/send-configurations-public/${sendConfigurationId}`));

                if (sendConfigurationId === this.fetchSendConfigurationId) {
                    this.setState({
                        sendConfiguration: result.data
                    });
                }
            } catch (err) {
                if (err instanceof interoperableErrors.PermissionDeniedError) {
                    this.setState({
                        sendConfiguration: null
                    });
                } else {
                    throw err;
                }
            }
        }
    }

    populateTemplateDefaults(data) {
        // This is for CampaignSource.TEMPLATE and CampaignSource.CUSTOM_FROM_TEMPLATE
        data.data_sourceTemplate = null;

        // This is for CampaignSource.CUSTOM_FROM_CAMPAIGN
        data.data_sourceCampaign = null;

        // This is for CampaignSource.CUSTOM
        data.data_sourceCustom_type = mailtrainConfig.editors[0];
        data.data_sourceCustom_tag_language = mailtrainConfig.tagLanguages[0];
        data.data_sourceCustom_data = {};

        Object.assign(data, this.templateTypes[mailtrainConfig.editors[0]].initData());

        // This is for CampaignSource.URL
        data.data_sourceUrl = '';
    }

    getFormValuesMutator(data) {
        this.populateTemplateDefaults(data);

        if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            data.data_sourceTemplate = data.data.sourceTemplate;

        } else if (data.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            data.data_sourceCampaign = data.data.sourceCampaign;

        } else if (data.source === CampaignSource.CUSTOM) {
            data.data_sourceCustom_type = data.data.sourceCustom.type;
            data.data_sourceCustom_tag_language = data.data.sourceCustom.tag_language;
            data.data_sourceCustom_data = data.data.sourceCustom.data;

            this.templateTypes[data.data.sourceCustom.type].afterLoad(data);

        } else if (data.source === CampaignSource.URL) {
            data.data_sourceUrl = data.data.sourceUrl
        }

        for (const overridable of campaignOverridables) {
            if (data[overridable + '_override'] === null) {
                data[overridable + '_override'] = '';
                data[overridable + '_overriden'] = false;
            } else {
                data[overridable + '_overriden'] = true;
            }
        }

        this.listsSelectorHelper.getFormValuesMutator(data);

        // noinspection JSIgnoredPromiseFromCall
        this.fetchSendConfiguration(data.send_configuration);
    }

    submitFormValuesMutator(data) {
        const isEdit = !!this.props.entity;

        data.source = Number.parseInt(data.source);

        data.data = {};
        if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            data.data.sourceTemplate = data.data_sourceTemplate;

        } else if (data.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            data.data.sourceCampaign = data.data_sourceCampaign;

        } else if (data.source === CampaignSource.CUSTOM) {
            this.templateTypes[data.data_sourceCustom_type].beforeSave(data);

            data.data.sourceCustom = {
                type: data.data_sourceCustom_type,
                tag_language: data.data_sourceCustom_tag_language,
                data: data.data_sourceCustom_data,
            }

        } else if (data.source === CampaignSource.URL) {
            data.data.sourceUrl = data.data_sourceUrl;
        }

        for (const overridable of campaignOverridables) {
            if (!data[overridable + '_overriden']) {
                data[overridable + '_override'] = null;
            }
            delete data[overridable + '_overriden'];
        }

        this.listsSelectorHelper.submitFormValuesMutator(data);

        return filterData(data, [
            'name', 'description', 'namespace', 'cpg_name', 'cpg_description', 'send_configuration',
            'subject', 'from_name_override', 'from_email_override', 'reply_to_override',
            'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url',
            'source', 'lists'
        ]);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {

            const data = {};

            for (const overridable of campaignOverridables) {
                data[overridable + '_override'] = '';
                data[overridable + '_overriden'] = false;
            }

            data.type = this.props.type;

            data.name = '';
            data.description = '';

            data.cpg_name = '';
            data.cpg_description = '';

            this.listsSelectorHelper.populateFrom(data, []);

            data.send_configuration = null;
            data.namespace = getDefaultNamespace(this.props.permissions);

            data.subject = '';

            data.click_tracking_disabled = false;
            data.open_tracking_disabled = false;

            data.unsubscribe_url = '';

            data.source = CampaignSource.CUSTOM;

            this.populateTemplateDefaults(data);

            this.populateFormValues(data);
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        }

        const sourceTypeKey = Number.parseInt(state.getIn(['source', 'value']));

        if (sourceTypeKey === CampaignSource.TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            if (!state.getIn(['data_sourceTemplate', 'value'])) {
                state.setIn(['data_sourceTemplate', 'error'], t('templateMustBeSelected'));
            }

        } else if (sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            if (!state.getIn(['data_sourceCampaign', 'value'])) {
                state.setIn(['data_sourceCampaign', 'error'], t('campaignMustBeSelected'));
            }

        } else if (sourceTypeKey === CampaignSource.CUSTOM) {
            const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);
            if (!customTemplateTypeKey) {
                state.setIn(['data_sourceCustom_type', 'error'], t('typeMustBeSelected'));
            }

            if (!state.getIn(['data_sourceCustom_tag_language', 'value'])) {
                state.setIn(['data_sourceCustom_tag_language', 'error'], t('tagLanguageMustBeSelected'));
            }

            if (customTemplateTypeKey) {
                this.templateTypes[customTemplateTypeKey].validate(state);
            }

        } else if (sourceTypeKey === CampaignSource.URL) {
            if (!state.getIn(['data_sourceUrl', 'value'])) {
                state.setIn(['data_sourceUrl', 'error'], t('urlMustNotBeEmpty'));
            }
        }

        this.listsSelectorHelper.localValidateFormValues(state)

        validateNamespace(t, state);
    }

    async save() {
        await this.submitHandler();
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/channels/${this.props.entity.id}`;
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/channels'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/channels', 'success', t('channelUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/channels/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('channelUpdated'));
                }
            } else {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/channels', 'success', t('channelCreated'));
                } else {
                    this.navigateToWithFlashMessage(`/channels/${submitResult}/edit`, 'success', t('channelCreated'));
                }
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canModify = !isEdit || this.props.entity.permissions.includes('edit');
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const sourceTypeKey = Number.parseInt(this.getFormValue('source'));
        const campaignTypeKey = this.getFormValue('type');

        const sendConfigurationsColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.mailerTypes[data].typeName },
            { data: 6, title: t('namespace') }
        ];

        let sendSettings;
        if (this.getFormValue('send_configuration')) {
            if (this.state.sendConfiguration) {
                sendSettings = [];

                const addOverridable = (id, label) => {
                    if(this.state.sendConfiguration[id + '_overridable']){
                        if (this.getFormValue(id + '_overriden')) {
                            sendSettings.push(<InputField label={label} key={id + '_override'} id={id + '_override'}/>);
                        } else {
                            sendSettings.push(
                                <StaticField key={id + '_original'} label={label} id={id + '_original'} className={styles.formDisabled}>
                                    {this.state.sendConfiguration[id]}
                                </StaticField>
                            );
                        }
                        sendSettings.push(<CheckBox key={id + '_overriden'} id={id + '_overriden'} text={t('override')} className={campaignsStyles.overrideCheckbox}/>);
                    }
                    else{
                        sendSettings.push(
                            <StaticField key={id + '_original'} label={label} id={id + '_original'} className={styles.formDisabled}>
                                {this.state.sendConfiguration[id]}
                            </StaticField>
                        );
                    }
                };

                addOverridable('from_name', t('fromName'));
                addOverridable('from_email', t('fromEmailAddress'));
                addOverridable('reply_to', t('replytoEmailAddress'));
            } else {
                sendSettings =  <AlignedRow>{t('loadingSendConfiguration')}</AlignedRow>
            }
        } else {
            sendSettings = null;
        }

        let templateModals = null;
        let templateEdit = null;
        if (sourceTypeKey === CampaignSource.TEMPLATE || (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            const templatesColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('description') },
                { data: 3, title: t('type'), render: data => this.templateTypes[data].typeName },
                { data: 5, title: t('created'), render: data => moment(data).fromNow() },
                { data: 6, title: t('namespace') },
            ];

            let help = null;
            if (sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                help = t('selectingATemplateCreatesACampaign');
            }

            // The "key" property here and in the TableSelect below is to tell React that these tables are different and should be rendered by different instances. Otherwise, React will use
            // only one instance, which fails because Table does not handle updates in "columns" property
            templateEdit = <TableSelect key="templateSelect" id="data_sourceTemplate" label={t('template')} withHeader dropdown dataUrl='rest/templates-table' columns={templatesColumns} selectionLabelIndex={1} help={help}/>;

        } else if (sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            const campaignsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('description') },
                { data: 4, title: t('type'), render: data => this.campaignTypeLabels[data] },
                { data: 5, title: t('created'), render: data => moment(data).fromNow() },
                { data: 6, title: t('namespace') }
            ];

            templateEdit = <TableSelect key="campaignSelect" id="data_sourceCampaign" label={t('campaign')} withHeader dropdown dataUrl='rest/campaigns-with-content-table' columns={campaignsColumns} selectionLabelIndex={1} help={t('contentOfTheSelectedCampaignWillBeCopied')}/>;

        } else if (sourceTypeKey === CampaignSource.CUSTOM) {
            const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

            let customTemplateTypeForm = null;

            if (customTemplateTypeKey) {
                templateModals = getModals(this, customTemplateTypeKey, isEdit);
                customTemplateTypeForm = getTypeForm(this, customTemplateTypeKey, false);
            }

            templateEdit = <div>
                <Dropdown id="data_sourceCustom_type" label={t('type')} options={this.customTemplateTypeOptions}/>
                <Dropdown id="data_sourceCustom_tag_language" label={t('tagLanguage')} options={this.customTemplateTagLanguageOptions}/>

                {customTemplateTypeForm}
            </div>;

        } else if (sourceTypeKey === CampaignSource.URL) {
            templateEdit = <InputField id="data_sourceUrl" label={t('renderUrl')} help={t('ifAMessageIsSentThenThisUrlWillBePosTed')}/>
        }

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/channels/${this.props.entity.id}`}
                        backUrl={`/channels/${this.props.entity.id}/edit`}
                        successUrl="/channels"
                        deletingMsg={t('deletingChannel')}
                        deletedMsg={t('channelDeleted')}/>
                }
                {templateModals}

                <Title>{isEdit ? t('editChannel') : t('createChannel')}</Title>

                {!canModify &&
                <div className="alert alert-warning" role="alert">
                    <Trans i18nKey="warning!YouDoNotHaveNecessaryPermissions-1"><b>Warning!</b> You do not have necessary permissions to edit this channel. Any changes that you perform here will be lost.</Trans>
                </div>
                }

                {isEdit && this.props.entity.status === CampaignStatus.SENDING &&
                    <div className={`alert alert-info`} role="alert">
                        {t('formCannotBeEditedBecauseTheCampaignIs')}
                    </div>
                }

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>

                    {isEdit &&
                    <StaticField id="cid" className={styles.formDisabled} label={t('id')}>
                        {this.getFormValue('cid')}
                    </StaticField>
                    }

                    <TextArea id="description" label={t('description')}/>

                    <NamespaceSelect/>

                    <hr/>
                    <Fieldset label={t('campaignDefaults')}>
                        <InputField id="cpg_name" label={t('campaignName-1')}/>
                        <TextArea id="cpg_description" label={t('campaignDescription')}/>
                    </Fieldset>

                    <hr/>

                    {this.listsSelectorHelper.render()}

                    <hr/>

                    <Fieldset label={t('sendSettings')}>

                        <TableSelect id="send_configuration" label={t('sendConfiguration-1')} withHeader withClear dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />

                        {sendSettings}

                        <InputField label={t('subjectLine')} key="subject" id="subject"/>

                        <InputField id="unsubscribe_url" label={t('customUnsubscribeUrl')}/>
                    </Fieldset>

                    <hr/>

                    <Fieldset label={t('tracking')}>
                        <CheckBox id="open_tracking_disabled" text={t('disableOpenedTracking')}/>
                        <CheckBox id="click_tracking_disabled" text={t('disableClickedTracking')}/>
                    </Fieldset>

                    <hr/>
                    <Fieldset label={t('template')}>
                        <Dropdown id="source" label={t('contentSource')} options={this.sourceOptions}/>
                    </Fieldset>

                    {templateEdit}

                    <ButtonRow>
                        {canModify &&
                            <>
                                <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                                <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                            </>
                        }
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/channels/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
