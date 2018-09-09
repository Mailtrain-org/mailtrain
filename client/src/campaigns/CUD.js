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
    Fieldset,
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
import campaignsStyles from "./styles.scss";
import {getUrl} from "../lib/urls";
import {
    campaignOverridables,
    CampaignSource,
    CampaignStatus,
    CampaignType
} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {ResourceType} from "../lib/mosaico";
import {getCampaignLabels} from "./helpers";

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

        const { campaignTypeLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;

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

        this.nextListEntryId = 0;

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

    getNextListEntryId() {
        const id = this.nextListEntryId;
        this.nextListEntryId += 1;
        return id;
    }

    onCustomTemplateTypeChanged(mutState, key, oldType, type) {
        if (type) {
            this.templateTypes[type].afterTypeChange(mutState);
        }
    }

    onSendConfigurationChanged(newState, key, oldValue, sendConfigurationId) {
        newState.sendConfiguration = null;
        // noinspection JSIgnoredPromiseFromCall
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

                for (const overridable of campaignOverridables) {
                    data[overridable + '_overriden'] = data[overridable + '_override'] === null;
                }

                const lsts = [];
                for (const lst of data.lists) {
                    const lstUid = this.getNextListEntryId();

                    const prefix = 'lists_' + lstUid + '_';

                    data[prefix + 'list'] = lst.list;
                    data[prefix + 'segment'] = lst.segment;
                    data[prefix + 'useSegmentation'] = !!lst.segment;

                    lsts.push(lstUid);
                }
                data.lists = lsts;

                // noinspection JSIgnoredPromiseFromCall
                this.fetchSendConfiguration(data.send_configuration);
            });

            if (this.props.entity.status === CampaignStatus.SENDING) {
                this.disableForm();
            }

        } else {
            const data = {};
            for (const overridable of campaignOverridables) {
                data[overridable + '_override'] = '';
                data[overridable + '_overriden'] = false;
            }

            const lstUid = this.getNextListEntryId();
            const lstPrefix = 'lists_' + lstUid + '_';

            this.populateFormValues({
                ...data,

                type: this.props.type,

                name: '',
                description: '',

                [lstPrefix + 'list']: null,
                [lstPrefix + 'segment']: null,
                [lstPrefix + 'useSegmentation']: false,
                lists: [lstUid],

                send_configuration: null,
                namespace: mailtrainConfig.user.namespace,

                click_tracking_disabled: false,
                open_trackings_disabled: false,

                unsubscribe_url: '',

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

        for (const lstUid of state.getIn(['lists', 'value'])) {
            const prefix = 'lists_' + lstUid + '_';

            if (!state.getIn([prefix + 'list', 'value'])) {
                state.setIn([prefix + 'list', 'error'], t('List must be selected'));
            }

            if (campaignTypeKey === CampaignType.REGULAR || campaignTypeKey === CampaignType.RSS) {
                if (state.getIn([prefix + 'useSegmentation', 'value']) && !state.getIn([prefix + 'segment', 'value'])) {
                    state.setIn([prefix + 'segment', 'error'], t('Segment must be selected'));
                }
            }
        }

        validateNamespace(t, state);
    }

    async submitHandler() {
        const isEdit = !!this.props.entity;
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

            data.data = {};
            if (data.source === CampaignSource.TEMPLATE || data.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
                data.data.sourceTemplate = data.data_sourceTemplate;
            }

            if (data.source === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
                data.data.sourceCampaign = data.data_sourceCampaign;
            }

            if (!isEdit && data.source === CampaignSource.CUSTOM) {
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

            const lsts = [];
            for (const lstUid of data.lists) {
                const prefix = 'lists_' + lstUid + '_';

                const useSegmentation = data[prefix + 'useSegmentation'] && (data.type === CampaignType.REGULAR || data.type === CampaignType.RSS);

                lsts.push({
                    list: data[prefix + 'list'],
                    segment: useSegmentation ? data[prefix + 'segment'] : null
                });
            }
            data.lists = lsts;

            for (const key in data) {
                if (key.startsWith('data_') || key.startsWith('lists_')) {
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

    onAddListEntry(orderBeforeIdx) {
        this.updateForm(mutState => {
            const lsts = mutState.getIn(['lists', 'value']);
            let paramId = 0;

            const lstUid = this.getNextListEntryId();

            const prefix = 'lists_' + lstUid + '_';

            mutState.setIn([prefix + 'list', 'value'], null);
            mutState.setIn([prefix + 'segment', 'value'], null);
            mutState.setIn([prefix + 'useSegmentation', 'value'], false);

            mutState.setIn(['lists', 'value'], [...lsts.slice(0, orderBeforeIdx), lstUid, ...lsts.slice(orderBeforeIdx)]);
        });
    }

    onRemoveListEntry(lstUid) {
        this.updateForm(mutState => {
            const lsts = this.getFormValue('lists');

            const prefix = 'lists_' + lstUid + '_';

            mutState.delete(prefix + 'list');
            mutState.delete(prefix + 'segment');
            mutState.delete(prefix + 'useSegmentation');

            mutState.setIn(['lists', 'value'], lsts.filter(val => val !== lstUid));
        });
    }

    onListEntryMoveUp(orderIdx) {
        const lsts = this.getFormValue('lists');
        this.updateFormValue('lists', [...lsts.slice(0, orderIdx - 1), lsts[orderIdx], lsts[orderIdx - 1], ...lsts.slice(orderIdx + 1)]);
    }

    onListEntryMoveDown(orderIdx) {
        const lsts = this.getFormValue('lists');
        this.updateFormValue('lists', [...lsts.slice(0, orderIdx), lsts[orderIdx + 1], lsts[orderIdx], ...lsts.slice(orderIdx + 2)]);
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

        const lstsEditEntries = [];
        const lsts = this.getFormValue('lists') || [];
        let lstOrderIdx = 0;
        for (const lstUid of lsts) {
            const prefix = 'lists_' + lstUid + '_';
            const lstOrderIdxClosure = lstOrderIdx;

            const selectedList = this.getFormValue(prefix + 'list');

            lstsEditEntries.push(
                <div key={lstUid} className={campaignsStyles.entry + ' ' + campaignsStyles.entryWithButtons}>
                    <div className={campaignsStyles.entryButtons}>
                        {lsts.length > 1 &&
                        <Button
                            className="btn-default"
                            icon="remove"
                            title={t('Remove')}
                            onClickAsync={() => this.onRemoveListEntry(lstUid)}
                        />
                        }
                        <Button
                            className="btn-default"
                            icon="plus"
                            title={t('Insert new entry before this one')}
                            onClickAsync={() => this.onAddListEntry(lstOrderIdxClosure)}
                        />
                        {lstOrderIdx > 0 &&
                        <Button
                            className="btn-default"
                            icon="chevron-up"
                            title={t('Move up')}
                            onClickAsync={() => this.onListEntryMoveUp(lstOrderIdxClosure)}
                        />
                        }
                        {lstOrderIdx < lsts.length - 1 &&
                        <Button
                            className="btn-default"
                            icon="chevron-down"
                            title={t('Move down')}
                            onClickAsync={() => this.onListEntryMoveDown(lstOrderIdxClosure)}
                        />
                        }
                    </div>
                    <div className={campaignsStyles.entryContent}>
                        <TableSelect id={prefix + 'list'} label={t('List')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} />

                        {(campaignTypeKey === CampaignType.REGULAR || campaignTypeKey === CampaignType.RSS) &&
                            <div>
                                <CheckBox id={prefix + 'useSegmentation'} label={t('Segment')} text={t('Use a particular segment')}/>
                                {selectedList && this.getFormValue(prefix + 'useSegmentation') &&
                                    <TableSelect id={prefix + 'segment'} withHeader dropdown dataUrl={`rest/segments-table/${selectedList}`} columns={segmentsColumns} selectionLabelIndex={1} />
                                }
                            </div>
                        }
                    </div>
                </div>
            );

            lstOrderIdx += 1;
        }

        const lstsEdit =
            <Fieldset label={t('Lists')}>
                {lstsEditEntries}
                <div key="newEntry" className={campaignsStyles.newEntry}>
                    <Button
                        className="btn-default"
                        icon="plus"
                        label={t('Add list')}
                        onClickAsync={() => this.onAddListEntry(lsts.length)}
                    />
                </div>
            </Fieldset>;


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
                { data: 3, title: t('Type'), render: data => this.campaignTypeLabels[data] },
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
                        backUrl={`/campaigns/${this.props.entity.id}/edit`}
                        successUrl="/campaigns"
                        deletingMsg={t('Deleting campaign ...')}
                        deletedMsg={t('Campaign deleted')}/>
                }

                <Title>{isEdit ? this.editTitles[this.getFormValue('type')] : this.createTitles[this.getFormValue('type')]}</Title>

                {isEdit && this.props.entity.status === CampaignStatus.SENDING &&
                    <div className={`alert alert-info`} role="alert">
                        {t('Form cannot be edited because the campaign is currently being sent out. Wait till the sending is finished and refresh.')}
                    </div>
                }

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    {extraSettings}

                    <NamespaceSelect/>

                    <hr/>

                    {lstsEdit}

                    <hr/>

                    <TableSelect id="send_configuration" label={t('Send configuration')} withHeader dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />

                    {sendSettings}

                    <InputField id="unsubscribe_url" label={t('Custom unsubscribe URL')}/>

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
