'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
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
import mailtrainConfig from 'mailtrainConfig';
import {
    getEditForm,
    getTemplateTypes,
    getTypeForm
} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {ResourceType} from "../lib/mosaico";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CustomContent extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        console.log(props);
        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN);

        this.customTemplateTypeOptions = [];
        for (const key of mailtrainConfig.editors) {
            this.customTemplateTypeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        this.state = {
            showMergeTagReference: false,
            elementInFullscreen: false
        };

        this.initForm();
    }

    static propTypes = {
        entity: PropTypes.object
    }

    componentDidMount() {
        this.getFormValuesFromEntity(this.props.entity, data => {
            data.data_sourceCustom_type = data.data.sourceCustom.type;
            data.data_sourceCustom_data = data.data.sourceCustom.data;
            data.data_sourceCustom_html = data.data.sourceCustom.html;
            data.data_sourceCustom_text = data.data.sourceCustom.text;

            this.templateTypes[data.data.sourceCustom.type].afterLoad(data);
        });
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const customTemplateTypeKey = state.getIn(['data_sourceCustom_type', 'value']);

        if (customTemplateTypeKey) {
            this.templateTypes[customTemplateTypeKey].validate(state);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');
        await this.templateTypes[customTemplateTypeKey].exportHTMLEditorData(this);

        const sendMethod = FormSendMethod.PUT;
        const url = `rest/campaigns-content/${this.props.entity.id}`;

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
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

        // TODO: Toggle HTML preview

        const customTemplateTypeKey = this.getFormValue('data_sourceCustom_type');

        // FIXME - data_sourceCustom_type is initialized only after first render

        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
                <Title>{t('Edit Custom Content')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <StaticField id="data_sourceCustom_type" className={styles.formDisabled} label={t('Custom template editor')}>
                        {customTemplateTypeKey && this.templateTypes[customTemplateTypeKey].typeName}
                    </StaticField>

                    {customTemplateTypeKey && getTypeForm(this, customTemplateTypeKey, true)}

                    {customTemplateTypeKey && getEditForm(this, customTemplateTypeKey)}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
