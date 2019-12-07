'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {
    Button,
    ButtonRow,
    Dropdown,
    filterData,
    Form,
    FormSendMethod,
    StaticField,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import mailtrainConfig from 'mailtrainConfig';
import {getEditForm, getTagLanguages, getTemplateTypes, getTypeForm, ResourceType} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {TestSendModalDialog, TestSendModalDialogMode} from "./TestSendModalDialog";
import {withComponentMixins} from "../lib/decorator-helpers";
import {ContentModalDialog} from "../lib/modals";


@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class CustomContent extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN);
        this.tagLanguages = getTagLanguages(props.t);

        this.customTemplateTypeOptions = [];
        for (const key of mailtrainConfig.editors) {
            this.customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        this.customTemplateTagLanguageOptions = [];
        for (const key of mailtrainConfig.tagLanguages) {
            this.customTemplateTagLanguageOptions.push({key, label: this.tagLanguages[key].name});
        }

        this.state = {
            showMergeTagReference: false,
            elementInFullscreen: false,
            showTestSendModal: false,
            showExportModal: false,
            exportModalContentType: null,
            exportModalTitle: ''
        };

        this.initForm({
            getPreSubmitUpdater: ::this.getPreSubmitFormValuesUpdater,
            onChangeBeforeValidation: {
                data_sourceCustom_tag_language: ::this.onTagLanguageChanged
            }
        });

        this.sendModalGetDataHandler = ::this.sendModalGetData;
        this.exportModalGetContentHandler = ::this.exportModalGetContent;

        // This is needed here because if this is passed as an anonymous function, it will reset the editorNode to null with each render.
        // This becomes a problem when Show HTML button is pressed because that one tries to access the editorNode while it is null.
        this.editorNodeRefHandler = node => this.editorNode = node;
    }

    static propTypes = {
        entity: PropTypes.object,
        setPanelInFullScreen: PropTypes.func
    }

    onTagLanguageChanged(mutStateData, key, oldTagLanguage, tagLanguage) {
        if (tagLanguage) {
            const type = mutStateData.getIn(['data_sourceCustom_type', 'value']);
            this.templateTypes[type].afterTagLanguageChange(mutStateData, true);
        }
    }

    getFormValuesMutator(data) {
        data.data_sourceCustom_type = data.data.sourceCustom.type;
        data.data_sourceCustom_tag_language = data.data.sourceCustom.tag_language;
        data.data_sourceCustom_data = data.data.sourceCustom.data;
        data.data_sourceCustom_html = data.data.sourceCustom.html;
        data.data_sourceCustom_text = data.data.sourceCustom.text;

        this.templateTypes[data.data.sourceCustom.type].afterLoad(data);
    }

    submitFormValuesMutator(data) {
        this.templateTypes[data.data_sourceCustom_type].beforeSave(data);

        data.data.sourceCustom = {
            type: data.data_sourceCustom_type,
            tag_language: data.data_sourceCustom_tag_language,
            data: data.data_sourceCustom_data,
            html: data.data_sourceCustom_html,
            text: data.data_sourceCustom_text
        };

        return filterData(data, ['data']);
    }

    async getPreSubmitFormValuesUpdater() {
        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        const exportedData = await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        return mutStateData => {
            for (const key in exportedData) {
                mutStateData.setIn([key, 'value'], exportedData[key]);
            }
        };
    }

    componentDidMount() {
        this.getFormValuesFromEntity(this.props.entity);
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['data_sourceCustom_tag_language', 'value'])) {
            state.setIn(['data_sourceCustom_tag_language', 'error'], t('tagLanguageMustBeSelected'));
        } else {
            state.setIn(['data_sourceCustom_tag_language', 'error'], null);
        }

        const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);

        if (customTemplateTypeKey) {
            this.templateTypes[customTemplateTypeKey].validate(state);
        }
    }

    async save() {
        await this.submitHandler(CustomContent.AfterSubmitAction.STAY);
    }

    static AfterSubmitAction = {
        STAY: 0,
        LEAVE: 1,
        STATUS: 2
    }

    @withFormErrorHandlers
    async submitHandler(afterSubmitAction) {
        const t = this.props.t;

        const sendMethod = FormSendMethod.PUT;
        const url = `rest/campaigns-content/${this.props.entity.id}`;

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (afterSubmitAction === CustomContent.AfterSubmitAction.STATUS) {
                this.navigateToWithFlashMessage(`/campaigns/${this.props.entity.id}/status`, 'success', t('campaignUpdated'));
            } else if (afterSubmitAction === CustomContent.AfterSubmitAction.LEAVE) {
                this.navigateToWithFlashMessage('/campaigns', 'success', t('campaignUpdated'));
            } else {
                await this.getFormValuesFromURL(`rest/campaigns-content/${this.props.entity.id}`);
                this.enableForm();
                this.setFormStatusMessage('success', t('campaignUpdated'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    async extractPlainText() {
        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        const exportedData = await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        const html = exportedData.data_sourceCustom_html;

        if (!html) {
            return;
        }

        if (this.isFormDisabled()) {
            return;
        }

        this.disableForm();

        const response = await axios.post(getUrl('rest/html-to-text'), { html });

        this.updateFormValue('data_sourceCustom_text', response.data.text);

        this.enableForm();
    }

    async toggleMergeTagReference() {
        this.setState({
            showMergeTagReference: !this.state.showMergeTagReference
        });
    }

    async setElementInFullscreen(elementInFullscreen) {
        this.props.setPanelInFullScreen(elementInFullscreen);
        this.setState({
            elementInFullscreen
        });
    }

    showTestSendModal() {
        this.setState({
            showTestSendModal: true
        });
    }

    async sendModalGetData() {
        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        const exportedData = await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        return {
            html: exportedData.data_sourceCustom_html,
            text: this.getFormValue('data_sourceCustom_text'),
            tagLanguage: this.getFormValue('data_sourceCustom_tag_language')
        };
    }

    showExportModal(contentType, title) {
        this.setState({
            showExportModal: true,
            exportModalContentType: contentType,
            exportModalTitle: title
        });
    }

    async exportModalGetContent() {
        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        return await this.templateTypes[customTemplateTypeKey].exportContent(this, this.state.exportModalContentType);
    }

    render() {
        const t = this.props.t;

        // TODO: Toggle HTML preview

        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
                <TestSendModalDialog
                    mode={TestSendModalDialogMode.CAMPAIGN_CONTENT}
                    visible={this.state.showTestSendModal}
                    onHide={() => this.setState({showTestSendModal: false})}
                    getDataAsync={this.sendModalGetDataHandler}
                    campaign={this.props.entity}
                />
                <ContentModalDialog
                    title={this.state.exportModalTitle}
                    visible={this.state.showExportModal}
                    onHide={() => this.setState({showExportModal: false})}
                    getContentAsync={this.exportModalGetContentHandler}
                />

                <Title>{t('editCustomContent')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <StaticField id="data_sourceCustom_type" className={styles.formDisabled} label={t('customTemplateEditor')}>
                        {customTemplateTypeKey && this.templateTypes[customTemplateTypeKey].typeName}
                    </StaticField>

                    <Dropdown id="data_sourceCustom_tag_language" label={t('tagLanguage')} options={this.customTemplateTagLanguageOptions} disabled={true}/>

                    {customTemplateTypeKey && getTypeForm(this, customTemplateTypeKey, true)}

                    {customTemplateTypeKey && getEditForm(this, customTemplateTypeKey, 'data_sourceCustom_')}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(CustomContent.AfterSubmitAction.LEAVE)}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndGoToStatus')} onClickAsync={async () => await this.submitHandler(CustomContent.AfterSubmitAction.STATUS)}/>
                        <Button className="btn-success" icon="at" label={t('Test send')} onClickAsync={async () => this.setState({showTestSendModal: true})}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
