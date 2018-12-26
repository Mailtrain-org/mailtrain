'use strict';

import React, {Component} from 'react';
import PropTypes
    from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page'
import {
    Button,
    ButtonRow,
    Form,
    FormSendMethod,
    StaticField,
    withForm
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import mailtrainConfig
    from 'mailtrainConfig';
import {
    getEditForm,
    getTemplateTypes,
    getTypeForm,
    ResourceType
} from '../templates/helpers';
import axios
    from '../lib/axios';
import styles
    from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {TestSendModalDialog} from "./TestSendModalDialog";
import {withComponentMixins} from "../lib/decorator-helpers";


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

        this.customTemplateTypeOptions = [];
        for (const key of mailtrainConfig.editors) {
            this.customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        this.state = {
            showMergeTagReference: false,
            elementInFullscreen: false,
            showTestSendModal: false
        };

        this.initForm();

        this.sendModalGetDataHandler = ::this.sendModalGetData;
    }

    static propTypes = {
        entity: PropTypes.object
    }

    loadFromEntityMutator(data) {
        data.data_sourceCustom_type = data.data.sourceCustom.type;
        data.data_sourceCustom_data = data.data.sourceCustom.data;
        data.data_sourceCustom_html = data.data.sourceCustom.html;
        data.data_sourceCustom_text = data.data.sourceCustom.text;

        this.templateTypes[data.data.sourceCustom.type].afterLoad(data);
    }

    componentDidMount() {
        this.getFormValuesFromEntity(this.props.entity, data => this.loadFromEntityMutator(data));
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);

        if (customTemplateTypeKey) {
            this.templateTypes[customTemplateTypeKey].validate(state);
        }
    }

    async save() {
        await this.doSave(true);
    }

    async submitHandler() {
        await this.doSave(false);
    }

    async doSave(stayOnPage) {
        const t = this.props.t;

        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        const exportedData = await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        const sendMethod = FormSendMethod.PUT;
        const url = `rest/campaigns-content/${this.props.entity.id}`;

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            Object.assign(data, exportedData);
            this.templateTypes[data.data_sourceCustom_type].beforeSave(data);

            data.data.sourceCustom = {
                type: data.data_sourceCustom_type,
                data: data.data_sourceCustom_data,
                html: data.data_sourceCustom_html,
                text: data.data_sourceCustom_text
            };

            for (const key in data) {
                if (key.startsWith('data_')) {
                    delete data[key];
                }
            }
        });

        if (submitResponse) {
            if (stayOnPage) {
                await this.getFormValuesFromURL(`rest/campaigns-content/${this.props.entity.id}`, data => this.loadFromEntityMutator(data));
                this.enableForm();
                this.clearFormStatusMessage();
                this.setFlashMessage('success', t('campaignSaved'));

            } else {
                this.navigateToWithFlashMessage('/campaigns', 'success', t('campaignSaved'));
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
            text: this.getFormValue('data_sourceCustom_text')
        };
    }

    render() {
        const t = this.props.t;

        // TODO: Toggle HTML preview

        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

        // FIXME - data_sourceCustom_type is initialized only after first render

        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
                <TestSendModalDialog
                    visible={this.state.showTestSendModal}
                    onHide={() => this.setState({showTestSendModal: false})}
                    getDataAsync={this.sendModalGetDataHandler}
                    entity={this.props.entity}
                />

                <Title>{t('editCustomContent')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <StaticField id="data_sourceCustom_type" className={styles.formDisabled} label={t('customTemplateEditor')}>
                        {customTemplateTypeKey && this.templateTypes[customTemplateTypeKey].typeName}
                    </StaticField>

                    {customTemplateTypeKey && getTypeForm(this, customTemplateTypeKey, true)}

                    {customTemplateTypeKey && getEditForm(this, customTemplateTypeKey, 'data_sourceCustom_')}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('save')}/>
                        <Button className="btn-danger" icon="send" label={t('testSend')} onClickAsync={async () => this.setState({showTestSendModal: true})}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
