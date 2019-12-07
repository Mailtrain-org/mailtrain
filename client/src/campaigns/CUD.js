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
import {getTagLanguages, getTemplateTypes, getTypeForm, ResourceType} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import campaignsStyles from "./styles.scss";
import {getUrl} from "../lib/urls";
import {campaignOverridables, CampaignSource, CampaignStatus, CampaignType} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {getCampaignLabels} from "./helpers";
import {withComponentMixins} from "../lib/decorator-helpers";
import interoperableErrors from "../../../shared/interoperable-errors";

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

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN);
        this.tagLanguages = getTagLanguages(props.t);

        this.mailerTypes = getMailerTypes(props.t);

        const { campaignTypeLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;

        this.createTitles = {
            [CampaignType.REGULAR]: t('createRegularCampaign'),
            [CampaignType.RSS]: t('createRssCampaign'),
            [CampaignType.TRIGGERED]: t('createTriggeredCampaign'),
        };

        this.editTitles = {
            [CampaignType.REGULAR]: t('editRegularCampaign'),
            [CampaignType.RSS]: t('editRssCampaign'),
            [CampaignType.TRIGGERED]: t('editTriggeredCampaign'),
        };

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

        this.nextListEntryId = 0;

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

    getNextListEntryId() {
        const id = this.nextListEntryId;
        this.nextListEntryId += 1;
        return id;
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

        if (key && (match = key.match(/^(lists_[0-9]+_)list$/))) {
            const prefix = match[1];
            mutStateData.setIn([prefix + 'segment', 'value'], null);
        }
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

    getFormValuesMutator(data) {
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
            if (data[overridable + '_override'] === null) {
                data[overridable + '_override'] = '';
                data[overridable + '_overriden'] = false;
            } else {
                data[overridable + '_overriden'] = true;
            }
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
    }

    submitFormValuesMutator(data) {
        const isEdit = !!this.props.entity;

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
                tag_language: data.data_sourceCustom_tag_language,
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

            const useSegmentation = data[prefix + 'useSegmentation'];

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

        return filterData(data, [
            'name', 'description', 'segment', 'namespace', 'send_configuration',
            'subject', 'from_name_override', 'from_email_override', 'reply_to_override',
            'data', 'click_tracking_disabled', 'open_tracking_disabled', 'unsubscribe_url',
            'type', 'source', 'parent', 'lists'
        ]);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

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
                namespace: getDefaultNamespace(this.props.permissions),

                subject: '',

                click_tracking_disabled: false,
                open_tracking_disabled: false,

                unsubscribe_url: '',

                source: CampaignSource.CUSTOM,

                // This is for CampaignSource.TEMPLATE and CampaignSource.CUSTOM_FROM_TEMPLATE
                data_sourceTemplate: null,

                // This is for CampaignSource.CUSTOM_FROM_CAMPAIGN
                data_sourceCampaign: null,

                // This is for CampaignSource.CUSTOM
                data_sourceCustom_type: mailtrainConfig.editors[0],
                data_sourceCustom_tag_language: mailtrainConfig.tagLanguages[0],
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
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        }

        if (!state.getIn(['subject', 'value'])) {
            state.setIn(['subject', 'error'], t('"Subject" line must not be empty"'));
        }

        if (!state.getIn(['send_configuration', 'value'])) {
            state.setIn(['send_configuration', 'error'], t('sendConfigurationMustBeSelected'));
        }

        if (state.getIn(['from_email_overriden', 'value']) && !state.getIn(['from_email_override', 'value'])) {
            state.setIn(['from_email_override', 'error'], t('fromEmailMustNotBeEmpty'));
        }


        const campaignTypeKey = state.getIn(['type', 'value']);

        const sourceTypeKey = Number.parseInt(state.getIn(['source', 'value']));

        if (sourceTypeKey === CampaignSource.TEMPLATE || (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE)) {
            if (!state.getIn(['data_sourceTemplate', 'value'])) {
                state.setIn(['data_sourceTemplate', 'error'], t('templateMustBeSelected'));
            }

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            if (!state.getIn(['data_sourceCampaign', 'value'])) {
                state.setIn(['data_sourceCampaign', 'error'], t('campaignMustBeSelected'));
            }

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM) {
            // The type is used only in create form. In case of CUSTOM_FROM_TEMPLATE or CUSTOM_FROM_CAMPAIGN, it is determined by the source template, so no need to check it here
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

        if (campaignTypeKey === CampaignType.RSS) {
            if (!state.getIn(['data_feedUrl', 'value'])) {
                state.setIn(['data_feedUrl', 'error'], t('rssFeedUrlMustBeGiven'));
            }
        }

        for (const lstUid of state.getIn(['lists', 'value'])) {
            const prefix = 'lists_' + lstUid + '_';

            if (!state.getIn([prefix + 'list', 'value'])) {
                state.setIn([prefix + 'list', 'error'], t('listMustBeSelected'));
            }
            
            if (state.getIn([prefix + 'useSegmentation', 'value']) && !state.getIn([prefix + 'segment', 'value'])) {
                state.setIn([prefix + 'segment', 'error'], t('segmentMustBeSelected'));
            }
        }

        validateNamespace(t, state);
    }

    static AfterSubmitAction = {
        STAY: 0,
        LEAVE: 1,
        STATUS: 2
    }

    @withFormErrorHandlers
    async submitHandler(afterSubmitAction) {
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
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (afterSubmitAction === CUD.AfterSubmitAction.STATUS) {
                    this.navigateToWithFlashMessage(`/campaigns/${this.props.entity.id}/status`, 'success', t('campaignUpdated'));
                } else if (afterSubmitAction === CUD.AfterSubmitAction.LEAVE) {
                    this.navigateToWithFlashMessage('/campaigns', 'success', t('campaignUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/campaigns-settings/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('campaignUpdated'));
                }
            } else {
                const sourceTypeKey = Number.parseInt(this.getFormValue('source'));

                if (sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
                    this.navigateToWithFlashMessage(`/campaigns/${submitResult}/content`, 'success', t('campaignCreated'));
                } else {
                    if (afterSubmitAction === CUD.AfterSubmitAction.STATUS) {
                        this.navigateToWithFlashMessage(`/campaigns/${submitResult}/status`, 'success', t('campaignCreated'));
                    } else if (afterSubmitAction === CUD.AfterSubmitAction.LEAVE) {
                        this.navigateToWithFlashMessage(`/campaigns`, 'success', t('campaignCreated'));
                    } else {
                        this.navigateToWithFlashMessage(`/campaigns/${submitResult}/edit`, 'success', t('campaignCreated'));
                    }
                }
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
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
            extraSettings = <InputField id="data_feedUrl" label={t('rssFeedUrl')}/>
        }

        const listsColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('subscribers') },
            { data: 4, title: t('description') },
            { data: 5, title: t('namespace') }
        ];

        const segmentsColumns = [
            { data: 1, title: t('name') }
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
                            className="btn-secondary"
                            icon="trash-alt"
                            title={t('remove')}
                            onClickAsync={() => this.onRemoveListEntry(lstUid)}
                        />
                        }
                        <Button
                            className="btn-secondary"
                            icon="plus"
                            title={t('insertNewEntryBeforeThisOne')}
                            onClickAsync={() => this.onAddListEntry(lstOrderIdxClosure)}
                        />
                        {lstOrderIdx > 0 &&
                        <Button
                            className="btn-secondary"
                            icon="chevron-up"
                            title={t('moveUp')}
                            onClickAsync={() => this.onListEntryMoveUp(lstOrderIdxClosure)}
                        />
                        }
                        {lstOrderIdx < lsts.length - 1 &&
                        <Button
                            className="btn-secondary"
                            icon="chevron-down"
                            title={t('moveDown')}
                            onClickAsync={() => this.onListEntryMoveDown(lstOrderIdxClosure)}
                        />
                        }
                    </div>
                    <div className={campaignsStyles.entryContent}>
                        <TableSelect id={prefix + 'list'} label={t('list')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} />
                        <div>
                            <CheckBox id={prefix + 'useSegmentation'} label={t('segment')} text={t('useAParticularSegment')}/>
                            {selectedList && this.getFormValue(prefix + 'useSegmentation') &&
                                <TableSelect id={prefix + 'segment'} withHeader dropdown dataUrl={`rest/segments-table/${selectedList}`} columns={segmentsColumns} selectionLabelIndex={1} />
                            }
                        </div>
                    </div>
                </div>
            );

            lstOrderIdx += 1;
        }

        const lstsEdit =
            <Fieldset label={t('lists')}>
                {lstsEditEntries}
                <div key="newEntry" className={campaignsStyles.newEntry}>
                    <Button
                        className="btn-secondary"
                        icon="plus"
                        label={t('addList')}
                        onClickAsync={() => this.onAddListEntry(lsts.length)}
                    />
                </div>
            </Fieldset>;


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


        let sourceEdit = null;
        if (isEdit) {
            if (!(sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN)) {
                sourceEdit = <StaticField id="source" className={styles.formDisabled} label={t('contentSource')}>{this.sourceLabels[sourceTypeKey]}</StaticField>;
            }
        } else {
            sourceEdit = <Dropdown id="source" label={t('contentSource')} options={this.sourceOptions}/>
        }

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

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) {
            const campaignsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('description') },
                { data: 4, title: t('type'), render: data => this.campaignTypeLabels[data] },
                { data: 5, title: t('created'), render: data => moment(data).fromNow() },
                { data: 6, title: t('namespace') }
            ];

            templateEdit = <TableSelect key="campaignSelect" id="data_sourceCampaign" label={t('campaign')} withHeader dropdown dataUrl='rest/campaigns-with-content-table' columns={campaignsColumns} selectionLabelIndex={1} help={t('contentOfTheSelectedCampaignWillBeCopied')}/>;

        } else if (!isEdit && sourceTypeKey === CampaignSource.CUSTOM) {
            const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

            let customTemplateTypeForm = null;

            if (customTemplateTypeKey) {
                customTemplateTypeForm = getTypeForm(this, customTemplateTypeKey, isEdit);
            }

            templateEdit = <div>
                <Dropdown id="data_sourceCustom_type" label={t('type')} options={this.customTemplateTypeOptions}/>
                <Dropdown id="data_sourceCustom_tag_language" label={t('tagLanguage')} options={this.customTemplateTagLanguageOptions} disabled={isEdit}/>

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
                        deleteUrl={`rest/campaigns/${this.props.entity.id}`}
                        backUrl={`/campaigns/${this.props.entity.id}/edit`}
                        successUrl="/campaigns"
                        deletingMsg={t('deletingCampaign')}
                        deletedMsg={t('campaignDeleted')}/>
                }

                <Title>{isEdit ? this.editTitles[this.getFormValue('type')] : this.createTitles[this.getFormValue('type')]}</Title>

                {isEdit && this.props.entity.status === CampaignStatus.SENDING &&
                    <div className={`alert alert-info`} role="alert">
                        {t('formCannotBeEditedBecauseTheCampaignIs')}
                    </div>
                }

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>

                    {isEdit &&
                    <StaticField id="cid" className={styles.formDisabled} label={t('id')} help={t('thisIsTheCampaignIdDisplayedToThe')}>
                        {this.getFormValue('cid')}
                    </StaticField>
                    }

                    <TextArea id="description" label={t('description')}/>

                    {extraSettings}

                    <NamespaceSelect/>

                    <hr/>

                    {lstsEdit}

                    <hr/>

                    <Fieldset label={t('sendSettings')}>

                        <TableSelect id="send_configuration" label={t('sendConfiguration')} withHeader dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} />

                        {sendSettings}

                        <InputField label={t('subjectLine')} key="subject" id="subject"/>

                        <InputField id="unsubscribe_url" label={t('customUnsubscribeUrl')}/>
                    </Fieldset>

                    <hr/>

                    <Fieldset label={t('tracking')}>
                        <CheckBox id="open_tracking_disabled" text={t('disableOpenedTracking')}/>
                        <CheckBox id="click_tracking_disabled" text={t('disableClickedTracking')}/>
                    </Fieldset>

                    {sourceEdit &&
                    <>
                        <hr/>
                        <Fieldset label={t('template')}>
                            {sourceEdit}
                        </Fieldset>
                    </>
                    }

                    {templateEdit}

                    <ButtonRow>
                        {!isEdit && (sourceTypeKey === CampaignSource.CUSTOM || sourceTypeKey === CampaignSource.CUSTOM_FROM_TEMPLATE || sourceTypeKey === CampaignSource.CUSTOM_FROM_CAMPAIGN) ?
                            <Button type="submit" className="btn-primary" icon="check" label={t('saveAndEditContent')}/>
                        :
                            <>
                                <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                                <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(CUD.AfterSubmitAction.LEAVE)}/>
                                <Button type="submit" className="btn-primary" icon="check" label={t('saveAndGoToStatus')} onClickAsync={async () => await this.submitHandler(CUD.AfterSubmitAction.STATUS)}/>
                            </>
                        }
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/campaigns/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
