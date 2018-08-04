'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page'
import {
    AlignedRow,
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TableSelect,
    TextArea,
    withForm
} from '../lib/form';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {
    NamespaceSelect,
    validateNamespace
} from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import {
    getTemplateTypes,
    getTypeForm
} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {
    campaignOverridables,
    CampaignSource,
    CampaignType
} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {ResourceType} from "../lib/mosaico";
import {getCampaignTypeLabels} from "./helpers";

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN);
        this.mailerTypes = getMailerTypes(props.t);

        this.campaignTypes = getCampaignTypeLabels(t);

        this.createTitles = {
            [CampaignType.REGULAR]: t('Create Regular Campaign'),
            [CampaignType.RSS]: t('Create RSS Campaign'),
            [CampaignType.TRIGGERED]: t('Create Triggered Campaign'),
        };

        this.editTitles = {
            [CampaignType.REGULAR]: t('Edit Regular Campaign'),
            [CampaignType.RSS]: t('Edit RSS Campaign'),
            [CampaignType.TRIGGERED]: t('Edit Triggered Campaign'),
        };

        this.sourceLabels = {
            [CampaignSource.TEMPLATE]: t('Template'),
            [CampaignSource.CUSTOM_FROM_TEMPLATE]: t('Custom content cloned from template'),
            [CampaignSource.CUSTOM_FROM_CAMPAIGN]: t('Custom content cloned from another campaign'),
            [CampaignSource.CUSTOM]: t('Custom content'),
            [CampaignSource.URL]: t('URL')
        };

        this.sourceOptions = [];
        for (const key in this.sourceLabels) {
            this.sourceOptions.push({key, label: this.sourceLabels[key]});
        }

        this.customTemplateTypeOptions = [];
        for (const key of mailtrainConfig.editors) {
            this.customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        this.state = {
            sendConfiguration: null
        };

        this.initForm({
            onChange: {
                send_configuration: ::this.onSendConfigurationChanged
            },
            onChangeBeforeValidation: {
                data_sourceCustom_type: ::this.onCustomTemplateTypeChanged
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        type: PropTypes.number
    }

    onCustomTemplateTypeChanged(mutState, key, oldType, type) {
        if (type) {
            this.templateTypes[type].afterTypeChange(mutState);
        }
    }

    onSendConfigurationChanged(newState, key, oldValue, sendConfigurationId) {
        newState.sendConfiguration = null;
        this.fetchSendConfiguration(sendConfigurationId);
    }

    @withAsyncErrorHandler
    async fetchSendConfiguration(sendConfigurationId) {
        this.fetchSendConfigurationId = sendConfigurationId;

        const result = await axios.get(getUrl(`rest/send-configurations-public/${sendConfigurationId}`));

        if (sendConfigurationId === this.fetchSendConfigurationId) {
            this.setState({
                sendConfiguration: result.data
            });
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                // The source cannot be changed once campaign is created. Thus we don't have to initialize fields for all other sources
                if (data.source === CampaignSource.TEMPLATE) {
                    data.data_sourceTemplate = data.data.sourceTemplate;
                }

                if (data.source === CampaignSource.URL) {
                    data.data_sourceUrl = data.data.sourceUrl;
                }

                if (data.type === CampaignType.RSS) {
                    data.data_feedUrl = data.data.feedUrl;
                }

                data.useSegmentation = !!data.segment;

                for (const overridable of campaignOverridables) {
                    data[overridable + '_overriden'] = !!data[overridable + '_override'];
                }

                this.fetchSendConfiguration(data.send_configuration);
            });

        } else {
            const data = {};
            for (const overridable of campaignOverridables) {
                data[overridable + '_override'] = '';
                data[overridable + '_overriden'] = false;
            }

            this.populateFormValues({
                ...data,

                type: this.props.type,

                name: '',
                description: '',
                list: null,
                segment: null,
                useSegmentation: false,
                send_configuration: null,
                namespace: mailtrainConfig.user.namespace,

                click_tracking_disabled: false,
                open_trackings_disabled: false,

                source: CampaignSource.TEMPLATE,

                // This is for CampaignSource.TEMPLATE and CampaignSource.CUSTOM_FROM_TEMPLATE
                data_sourceTemplate: null,

                // This is for CampaignSource.CUSTOM_FROM_CAMPAIGN
                data_sourceCampaign: null,

                // This is for CampaignSource.CUSTOM
                data_sourceCustom_type: mailtrainConfig.editors[0],
                data_sourceCustom_data: {},
                data_sourceCustom_html: '',
                data_sourceCustom_text: '',

                ...this.templateTypes[mailtrainConfig.editors[0]].initData(),

                // This is for CampaignSource.URL
                data_sourceUrl: '',

                // This is for CampaignType.RSS
                data_feedUrl: ''
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        }

        if (!state.getIn(['list', 'value'])) {
            state.setIn(['list', 'error'], t('List must be selected'));
        }

        if (state.getIn(['useSegmentation', 'value']) && !state.getIn(['segment', 'value'])) {
            state.setIn(['segment', 'error'], t('Segment must be selected'));
        }

        if (!state.getIn(['send_configuration', 'value'])) {
            state.setIn(['send_configuration', 'error'], t('Send configuration must be selected'));
        }

        if (state.getIn(['from_email_overriden', 'value']) && !state.getIn(['from_email_override', 'value'])) {
            state.setIn(['from_email_override', 'error'], t('"From" email must not be empty'));
        }


        const campaignTypeKey = state.getIn(['type', 'value']);

        const sourceTypeKey = Number.parseInt(state.getIn(['source', 'value']));

        if (sourceTypeKey === CampaignSource.TEMPLATE || (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            if (!state.getIn(['data_sourceTemplate', 'value'])) {
                state.setIn(['data_sourceTemplate', 'error'], t('Template must be selected'));
            }

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            if (!state.getIn(['data_sourceCampaign', 'value'])) {
                state.setIn(['data_sourceCampaign', 'error'], t('Campaign must be selected'));
            }

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM) {
            // The type is used only in create form. In case of CUSTOM_FROM_TEMPLATE or CUSTOM_FROM_CAMPAIGN, it is determined by the source template, so no need to check it here
            const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);
            if (!customTemplateTypeKey) {
                state.setIn(['data_sourceCustom_type', 'error'], t('Type must be selected'));
            }

            if (customTemplateTypeKey) {
                this.templateTypes[customTemplateTypeKey].validate(state);
            }

        } else if (sourceTypeKey === CampaignSource.URL) {
            if (!state.getIn(['data_sourceUrl', 'value'])) {
                state.setIn(['data_sourceUrl', 'error'], t('URL must not be empty'));
            }
        }

        if (campaignTypeKey === CampaignType.RSS) {
            if (!state.getIn(['data_feedUrl', 'value'])) {
                state.setIn(['data_feedUrl', 'error'], t('RSS feed URL must be given'));
            }
        }

        validateNamespace(t, state);
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/campaigns-settings/${this.props.entity.id}`;
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/campaigns'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            data.source = Number.parseInt(data.source);

            if (!data.useSegmentation) {
                data.segment = null;
            }
            delete data.useSegmentation;

            data.data = {};
            if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                data.data.sourceTemplate = data.data_sourceTemplate;
            }

            if (data.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
                data.data.sourceCampaign = data.data_sourceCampaign;
            }

            if (data.source === CampaignSource.CUSTOM) {
                this.templateTypes[data.data_sourceCustom_type].beforeSave(data);

                data.data.sourceCustom = {
                    type: data.data_sourceCustom_type,
                    data: data.data_sourceCustom_data,
                    html: data.data_sourceCustom_html,
                    text: data.data_sourceCustom_text
                }
            }

            if (data.source === CampaignSource.URL) {
                data.data.sourceUrl = data.data_sourceUrl;
            }

            if (data.type === CampaignType.RSS) {
                data.data.feedUrl = data.data_feedUrl;
            }

            for (const overridable of campaignOverridables) {
                if (!data[overridable + '_overriden']) {
                    data[overridable + '_override'] = null;
                }
                delete data[overridable + '_overriden'];
            }

            for (const key in data) {
                if (key.startsWith('data_')) {
                    delete data[key];
                }
            }
        });

        if (submitResponse) {
            const sourceTypeKey = Number.parseInt(this.getFormValue('source'));
            if (this.props.entity) {
                this.navigateToWithFlashMessage('/campaigns', 'success', t('Campaign saved'));
            } else if (sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
                this.navigateToWithFlashMessage(`/campaigns/${submitResponse}/content`, 'success', t('Campaign saved'));
            } else {
                this.navigateToWithFlashMessage(`/campaigns/${submitResponse}/edit`, 'success', t('Campaign saved'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        let extraSettings = null;

        const sourceTypeKey = Number.parseInt(this.getFormValue('source'));
        const campaignTypeKey = this.getFormValue('type');

        if (campaignTypeKey === CampaignType.RSS) {
            extraSettings = <InputField id="data_feedUrl" label={t('RSS Feed Url')}/>
        }

        const listsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Subscribers') },
            { data: 4, title: t('Description') },
            { data: 5, title: t('Namespace') }
        ];

        const segmentsColumns = [
            { data: 1, title: t('Name') }
        ];

        const sendConfigurationsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Type'), render: data => this.mailerTypes[data].typeName },
            { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 5, title: t('Namespace') }
        ];

        let sendSettings;
        if (this.getFormValue('send_configuration')) {
            if (this.state.sendConfiguration) {
                sendSettings = [];

                const addOverridable = (id, label) => {
                    sendSettings.push(<CheckBox key={id + '_overriden'} id={id + '_overriden'} label={label} text={t('Override')}/>);

                    if (this.getFormValue(id + '_overriden')) {
                        sendSettings.push(<InputField key={id + '_override'} id={id + '_override'}/>);
                    } else {
                        sendSettings.push(
                            <StaticField key={id + '_original'} id={id + '_original'} className={styles.formDisabled}>
                                {this.state.sendConfiguration[id]}
                            </StaticField>
                        );
                    }
                };

                addOverridable('from_name', t('"From" name'));
                addOverridable('from_email', t('"From" email address'));
                addOverridable('reply_to', t('"Reply-to" email address'));
                addOverridable('subject', t('"Subject" line'));
            } else {
                sendSettings =  <AlignedRow>{t('Loading send configuration ...')}</AlignedRow>
            }
        } else {
            sendSettings = null;
        }


        let sourceEdit = null;
        if (isEdit) {
            if (!(sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN)) {
                sourceEdit = <StaticField id="source" className={styles.formDisabled} label={t('Content source')}>{this.sourceLabels[sourceTypeKey]}</StaticField>;
            }
        } else {
            sourceEdit = <Dropdown id="source" label={t('Content source')} options={this.sourceOptions}/>
        }

        let templateEdit = null;
        if (sourceTypeKey === CampaignSource.TEMPLATE || (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            const templatesColumns = [
                { data: 1, title: t('Name') },
                { data: 2, title: t('Description') },
                { data: 3, title: t('Type'), render: data => this.templateTypes[data].typeName },
                { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
                { data: 5, title: t('Namespace') },
            ];

            let help = null;
            if (sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                help = t('Selecting a template creates a campaign specific copy from it.');
            }

            // The "key" property here and in the TableSelect below is to tell React that these tables are different and should be rendered by different instances. Otherwise, React will use
            // only one instance, which fails because Table does not handle updates in "columns" property
            templateEdit = <TableSelect key="templateSelect" id="data_sourceTemplate" label={t('Template')} withHeader dropdown dataUrl='rest/templates-table' columns={templatesColumns} selectionLabelIndex={1} help={help}/>;

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            const campaignsColumns = [
                { data: 1, title: t('Name') },
                { data: 2, title: t('Description') },
                { data: 3, title: t('Type'), render: data => this.campaignTypes[data] },
                { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
                { data: 5, title: t('Namespace') }
            ];

            templateEdit = <TableSelect key="campaignSelect" id="data_sourceCampaign" label={t('Campaign')} withHeader dropdown dataUrl='rest/campaigns-with-content-table' columns={campaignsColumns} selectionLabelIndex={1} help={t('Content of the selected campaign will be copied into this campaign.')}/>;

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM) {
            const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

            let customTemplateTypeForm = null;

            if (customTemplateTypeKey) {
                customTemplateTypeForm = getTypeForm(this, customTemplateTypeKey, isEdit);
            }

            templateEdit = <div>
                <Dropdown id="data_sourceCustom_type" label={t('Type')} options={this.customTemplateTypeOptions}/>
                {customTemplateTypeForm}
            </div>;

        } else if (sourceTypeKey === CampaignSource.URL) {
            templateEdit = <InputField id="data_sourceUrl" label={t('Render URL')} help={t('If a message is sent then this URL will be POSTed to using Merge Tags as POST body. Use this if you want to generate the HTML message yourself.')}/>
        }

        let saveButtonLabel;
        if (isEdit) {
            saveButtonLabel = t('Save');
        } else if (sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            saveButtonLabel = t('Save and edit content');
        } else {
            saveButtonLabel = t('Save and edit campaign');
        }

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/campaigns/${this.props.entity.id}`}
                        cudUrl={`/campaigns/${this.props.entity.id}/edit`}
                        listUrl="/campaigns"
                        deletingMsg={t('Deleting campaign ...')}
                        deletedMsg={t('Campaign deleted')}/>
                }

                <Title>{isEdit ? this.editTitles[this.getFormValue('type')] : this.createTitles[this.getFormValue('type')]}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    {extraSettings}

                    <NamespaceSelect/>

                    <hr/>

                    <TableSelect id="list" label={t('List')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} />

                    <CheckBox id="useSegmentation" label={t('Segment')} text={t('Use a particular segment')}/>
                    {this.getFormValue('useSegmentation') &&
                        <TableSelect id="segment" withHeader dropdown dataUrl={`rest/segments-table/${this.getFormValue('list')}`} columns={segmentsColumns} selectionLabelIndex={1} />
                    }

                    <hr/>

                    <TableSelect id="send_configuration" label={t('Send configuration')} withHeader dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />

                    {sendSettings}

                    <hr/>

                    <CheckBox id="open_trackings_disabled" text={t('Disable opened tracking')}/>
                    <CheckBox id="click_tracking_disabled" text={t('Disable clicked tracking')}/>

                    {sourceEdit && <hr/> }

                    {sourceEdit}

                    {templateEdit}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={saveButtonLabel}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/campaigns/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
