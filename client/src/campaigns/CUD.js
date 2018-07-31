'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Trans,
    translate
} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page'
import {
    ACEEditor,
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
    getEditForm,
    getTemplateTypes,
    getTypeForm
} from '../templates/helpers';
import {ActionLink} from "../lib/bootstrap-components";
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {CampaignType, CampaignSource} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_');
        this.mailerTypes = getMailerTypes(props.t);

        this.state = {
            showMergeTagReference: false,
            elementInFullscreen: false,
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
        wizard: PropTypes.string,
        entity: PropTypes.object,
        type: PropTypes.number.isRequired
    }

    onCustomTemplateTypeChanged(mutState, key, oldType, type) {
        if (type) {
            this.templateTypes[type].afterTypeChange(mutState);
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                    data.data_sourceTemplate = data.data.sourceTemplate;
                } else {
                    data.data_sourceTemplate = null;
                }

                if (data.source === CampaignSource.CUSTOM || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                    data.data_sourceCustom_type = data.data.source.type;
                    data.data_sourceCustom_data = data.data.source.data;
                    data.data_sourceCustom_html = data.data.source.html;
                    data.data_sourceCustom_text = data.data.source.text;

                    this.templateTypes[data.type].afterLoad(data);
                    
                } else {
                    data.data_sourceCustom_type = null;
                    data.data_sourceCustom_data = {};
                    data.data_sourceCustom_html = '';
                    data.data_sourceCustom_text = '';
                }

                if (data.source === CampaignSource.URL) {
                    data.data_sourceUrl = data.data.sourceUrl;
                } else {
                    data.data_sourceUrl = null;
                }

                if (data.type === CampaignType.RSS) {
                    data.data_feedUrl = data.data.feedUrl;
                } else {
                    data.data_feedUrl = '';
                }

                data.useSegmentation = !!data.segment;
                
                this.fetchSendConfiguration(data.send_configuration);
            });

        } else {
            this.populateFormValues({
                type: this.props.type,

                name: '',
                description: '',
                list: null,
                segment: null,
                useSegmentation: false,
                send_configuration: null,
                namespace: mailtrainConfig.user.namespace,
                from_name_override: '',
                from_name_overriden: false,
                from_email_override: '',
                from_email_overriden: false,
                reply_to_override: '',
                reply_to_overriden: false,
                subject_override: '',
                subject_overriden: false,
                click_tracking_disabled: false,
                open_trackings_disabled: false,

                source: CampaignSource.TEMPLATE,

                // This is for CampaignSource.TEMPLATE
                data_sourceTemplate: null,

                // This is for CampaignSource.CUSTOM
                data_sourceCustom_type: null,
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

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['list', 'value'])) {
            state.setIn(['list', 'error'], t('List must be selected'));
        } else {
            state.setIn(['list', 'error'], null);
        }

        if (state.getIn(['useSegmentation', 'value']) && !state.getIn(['segment', 'value'])) {
            state.setIn(['segment', 'error'], t('Segment must be selected'));
        } else {
            state.setIn(['segment', 'error'], null);
        }

        if (state.getIn(['from_email_overriden', 'value']) && !state.getIn(['from_email_override', 'value'])) {
            state.setIn(['from_email_override', 'error'], t('"From" email must not be empty'));
        } else {
            state.setIn(['from_email_override', 'error'], null);
        }


        const campaignTypeKey = state.getIn(['type', 'value']);

        const sourceTypeKey = state.getIn(['source', 'value']);

        if (sourceTypeKey === CampaignSource.TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            if (!state.getIn(['data_sourceTemplate', 'value'])) {
                state.setIn(['data_sourceTemplate', 'error'], t('Template must be selected'));
            } else {
                state.setIn(['data_sourceTemplate', 'error'], null);
            }

        } else if (sourceTypeKey === CampaignSource.CUSTOM) {
            // The type is used only in create form. In case of CUSTOM_FROM_TEMPLATE, it is determined by the source template, so no need to check it here
            const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);
            if (!customTemplateTypeKey) {
                state.setIn(['data_sourceCustom_type', 'error'], t('Type must be selected'));
            } else {
                state.setIn(['data_sourceCustom_type', 'error'], null);
            }

            if (customTemplateTypeKey) {
                this.templateTypes[customTemplateTypeKey].validate(state);
            }

        } else if (sourceTypeKey === CampaignSource.URL) {
            if (!state.getIn(['data_sourceUrl', 'value'])) {
                state.setIn(['data_sourceUrl', 'error'], t('URL must not be empty'));
            } else {
                state.setIn(['data_sourceUrl', 'error'], null);
            }
        }

        if (campaignTypeKey === CampaignType.RSS) {
            if (!state.getIn(['data_feedUrl', 'value'])) {
                state.setIn(['data_feedUrl', 'error'], t('RSS feed URL must be given'));
            } else {
                state.setIn(['data_feedUrl', 'error'], null);
            }
        }

        validateNamespace(t, state);

    }

    async submitHandler() {
        const t = this.props.t;

        if (this.props.entity) {
            const sourceTypeKey = this.getFormValue('source');
            if (sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
                await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);
            }
        }

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/campaigns/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/campaigns'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            if (!data.useSegmentation) {
                data.segment = null;
            }
            delete data.useSegmentation;

            data.data = {};
            if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                data.data.sourceTemplate = data.data_sourceTemplate;
            }

            if (data.source === CampaignSource.CUSTOM || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                this.templateTypes[data.data_sourceCustom_type].beforeSave(data);

                data.data.source = {
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

            for (const key in data) {
                if (key.startsWith('data_')) {
                    delete data[key];
                }
            }
        });

        if (submitResponse) {
            if (this.props.entity) {
                this.navigateToWithFlashMessage('/campaigns', 'success', t('Campaign saved'));
            } else {
                this.navigateToWithFlashMessage(`/campaigns/${submitResponse}/edit`, 'success', t('Campaign saved'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    async extractPlainText() {
        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        const html = this.getFormValue('data_sourceCustom_html');
        if (!html) {
            return;
        }

        if (this.isFormDisabled()) {
            return;
        }

        this.disableForm();

        const response = await axios.post(getUrl('rest/html-to-text', { html }));

        this.updateFormValue('data_sourceCustom_text', response.data.text);

        this.enableForm();
    }

    async toggleMergeTagReference() {
        this.setState({
            showMergeTagReference: !this.state.showMergeTagReference
        });
    }

    async setElementInFullscreen(elementInFullscreen) {
        this.setState({
            elementInFullscreen
        });
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');
        const useSaveAndEditLabel = !isEdit;

        let templateEdit = null;
        let extraSettings = null;

        const sourceTypeKey = this.getFormValue('source');
        const campaignTypeKey = this.getFormValue('type');

        if (sourceTypeKey === CampaignSource.TEMPLATE || (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            const templatesColumns = [
                { data: 1, title: t('Name') },
                { data: 2, title: t('Description') },
                { data: 3, title: t('Type'), render: data => this.templateTypes[data].typeName },
                { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
                { data: 5, title: t('Namespace') },
            ];

            templateEdit = <TableSelect id="data_sourceTemplate" label={t('Template')} withHeader dropdown dataUrl='rest/templates-table' columns={templatesColumns} selectionLabelIndex={1} />;

        } else if (sourceTypeKey === CampaignSource.CUSTOM || (isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            const customTemplateTypeOptions = [];
            for (const key of mailtrainConfig.editors) {
                customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
            }

            // TODO: Toggle HTML preview

            const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

            let customTemplateEditForm = null;
            let customTemplateTypeForm = null;

            if (customTemplateTypeKey) {
                customTemplateTypeForm = getTypeForm(this, customTemplateTypeKey, isEdit);

                if (isEdit) {
                    customTemplateEditForm = getEditForm(this, customTemplateTypeKey);
                }
            }

            templateEdit = <div>
                {isEdit
                    ?
                    <StaticField id="data_sourceCustom_type" className={styles.formDisabled} label={t('Type')}>
                        {customTemplateTypeKey && this.templateTypes[customTemplateTypeKey].typeName}
                    </StaticField>
                    :
                    <Dropdown id="data_sourceCustom_type" label={t('Type')} options={customTemplateTypeOptions}/>
                }

                {customTemplateTypeForm}

                {customTemplateEditForm}
            </div>;

        } else if (sourceTypeKey === CampaignSource.URL) {
            templateEdit = <InputField id="data_sourceUrl" label={t('Render URL')}/>
        }

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

        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
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

                <Title>{isEdit ? t('Edit Campaign') : t('Create Campaign')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    <TableSelect id="list" label={t('List')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} />

                    <CheckBox id="useSegmentation" text={t('Use segmentation')}/>
                    {this.getFormValue('useSegmentation') &&
                        <TableSelect id="segment" label={t('Segment')} withHeader dropdown dataUrl='rest/segments-table' columns={segmentsColumns} selectionLabelIndex={1} />
                    }

                    {extraSettings}

                    <NamespaceSelect/>

                    <TableSelect id="send_configuration" label={t('Send configuration')} withHeader dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />

                    <CheckBox id="from_name_overriden" text={t('Override email "From" name')}/>
                    { this.getFormValue('from_name_overriden') && <InputField id="from_name_override" label={t('Email "From" name')}/> }

                    <CheckBox id="from_email_overriden" text={t('Override email "From" address')}/>
                    { this.getFormValue('from_email_overriden') && <InputField id="from_email_override" label={t('Email "From" address')}/> }

                    <CheckBox id="reply_to_overriden" text={t('Override email "Reply-to" address')}/>
                    { this.getFormValue('reply_to_overriden') && <InputField id="reply_to_override" label={t('Email "Reply-to" address')}/> }

                    <CheckBox id="subject_overriden" text={t('Override email "Subject" line')}/>
                    { this.getFormValue('subject_overriden') && <InputField id="subject_override" label={t('Email "Subject" line')}/> }


                    <CheckBox id="open_trackings_disabled" text={t('Disable opened tracking')}/>
                    <CheckBox id="click_tracking_disabled" text={t('Disable clicked tracking')}/>

                    {templateEdit}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={isEdit ? t('Save') : t('Save and edit campaign')}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/campaigns/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
