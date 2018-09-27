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
    Button,
    ButtonRow,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TextArea,
    withForm
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
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
} from './helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t);

        this.state = {
            showMergeTagReference: false,
            elementInFullscreen: false
        };

        this.initForm({
            onChangeBeforeValidation: {
                type: ::this.onTypeChanged
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object
    }

    onTypeChanged(mutState, key, oldType, type) {
        if (type) {
            this.templateTypes[type].afterTypeChange(mutState);
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                this.templateTypes[data.type].afterLoad(data);
            });
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: mailtrainConfig.user.namespace,
                type: mailtrainConfig.editors[0],
                text: '',
                html: '',
                data: {},
                ...this.templateTypes[mailtrainConfig.editors[0]].initData()
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        }

        const typeKey = state.getIn(['type', 'value']);
        if (!typeKey) {
            state.setIn(['type', 'error'], t('Type must be selected'));
        }

        validateNamespace(t, state);

        if (typeKey) {
            this.templateTypes[typeKey].validate(state);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        if (this.props.entity) {
            const typeKey = this.getFormValue('type');
            await this.templateTypes[typeKey].exportHTMLEditorData(this);
        }

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            this.templateTypes[data.type].beforeSave(data);
        });

        if (submitResponse) {
            if (this.props.entity) {
                this.navigateToWithFlashMessage('/templates', 'success', t('Template saved'));
            } else {
                this.navigateToWithFlashMessage(`/templates/${submitResponse}/edit`, 'success', t('Template saved'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    async extractPlainText() {
        const typeKey = this.getFormValue('type');
        await this.templateTypes[typeKey].exportHTMLEditorData(this);

        const html = this.getFormValue('html');
        if (!html) {
            return;
        }

        if (this.isFormDisabled()) {
            return;
        }

        this.disableForm();

        const response = await axios.post(getUrl('rest/html-to-text'), { html });

        this.updateFormValue('text', response.data.text);

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

        const typeOptions = [];
        for (const key of mailtrainConfig.editors) {
            typeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        // TODO: Toggle HTML preview

        const typeKey = this.getFormValue('type');

        let editForm = null;
        if (isEdit && typeKey) {
            editForm = getEditForm(this, typeKey);
        }

        let typeForm = null;
        if (typeKey) {
            typeForm = getTypeForm(this, typeKey, isEdit);
        }


        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/templates/${this.props.entity.id}`}
                        backUrl={`/templates/${this.props.entity.id}/edit`}
                        successUrl="/templates"
                        deletingMsg={t('Deleting template ...')}
                        deletedMsg={t('Template deleted')}/>
                }

                <Title>{isEdit ? t('Edit Template') : t('Create Template')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    {isEdit
                    ?
                        <StaticField id="type" className={styles.formDisabled} label={t('Type')}>
                            {typeKey && this.templateTypes[typeKey].typeName}
                        </StaticField>
                    :
                        <Dropdown id="type" label={t('Type')} options={typeOptions}/>
                    }

                    {typeForm}

                    <NamespaceSelect/>

                    {editForm}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={isEdit ? t('Save') : t('Save and edit template')}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/templates/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
