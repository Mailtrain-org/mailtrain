'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
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
import {withErrorHandling} from '../lib/error-handling';
import {NamespaceSelect, validateNamespace} from '../lib/namespace';
import {ContentModalDialog, DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import {getEditForm, getTemplateTypes, getTypeForm} from './helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import {getUrl} from "../lib/urls";
import {TestSendModalDialog} from "./TestSendModalDialog";
import {withComponentMixins} from "../lib/decorator-helpers";
import moment from 'moment';


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

        this.templateTypes = getTemplateTypes(props.t);

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
                type: ::this.onTypeChanged
            }
        });

        this.sendModalGetDataHandler = ::this.sendModalGetData;
        this.exportModalGetContentHandler = ::this.exportModalGetContent;

        // This is needed here because if this is passed as an anonymous function, it will reset the editorNode to null with each render.
        // This becomes a problem when Show HTML button is pressed because that one tries to access the editorNode while it is null.
        this.editorNodeRefHandler = node => this.editorNode = node;
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object,
        setPanelInFullScreen: PropTypes.func
    }

    onTypeChanged(mutStateData, key, oldType, type) {
        if (type) {
            this.templateTypes[type].afterTypeChange(mutStateData);
        }
    }

    getFormValuesMutator(data) {
        this.templateTypes[data.type].afterLoad(data);
    }

    submitFormValuesMutator(data) {
        this.templateTypes[data.type].beforeSave(data);
        return filterData(data, ['name', 'description', 'type', 'data', 'html', 'text', 'namespace']);
    }

    async getPreSubmitFormValuesUpdater() {
        let exportedData = {};
        if (this.props.entity) {
            const typeKey = this.getFormValue('type');
            exportedData = await this.templateTypes[typeKey].exportHTMLEditorData(this);
        }

        return mutStateData => {
            for (const key in exportedData) {
                mutStateData.setIn([key, 'value'], exportedData[key]);
            }
        };
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: mailtrainConfig.user.namespace,
                type: mailtrainConfig.editors[0],

                fromSourceTemplate: false,
                sourceTemplate: null,

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
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        }

        const typeKey = state.getIn(['type', 'value']);
        if (!typeKey) {
            state.setIn(['type', 'error'], t('typeMustBeSelected'));
        }

        if (state.getIn(['fromSourceTemplate', 'value']) && !state.getIn(['sourceTemplate', 'value'])) {
            state.setIn(['sourceTemplate', 'error'], t('sourceTemplateMustNotBeEmpty'));
        } else {
            state.setIn(['sourceTemplate', 'error'], null);
        }

        validateNamespace(t, state);

        if (typeKey) {
            this.templateTypes[typeKey].validate(state);
        }
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
            url = `rest/templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/templates', 'success', t('templateUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/templates/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('templateUpdated'));
                }
            } else {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/templates', 'success', t('templateCreated'));
                } else {
                    this.navigateToWithFlashMessage(`/templates/${submitResult}/edit`, 'success', t('templateCreated'));
                }
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    async extractPlainText() {
        const typeKey = this.getFormValue('type');
        const exportedData = await this.templateTypes[typeKey].exportHTMLEditorData(this);

        const html = exportedData.html;
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
        const typeKey = this.getFormValue('type');
        const exportedData = await this.templateTypes[typeKey].exportHTMLEditorData(this);

        return {
            html: exportedData.html,
            text: this.getFormValue('text')
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
        const typeKey = this.getFormValue('type');
        return await this.templateTypes[typeKey].exportContent(this, this.state.exportModalContentType);
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const typeOptions = [];
        for (const key of mailtrainConfig.editors) {
            typeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        const typeKey = this.getFormValue('type');

        let editForm = null;
        if (isEdit && typeKey) {
            editForm = getEditForm(this, typeKey);
        }

        let typeForm = null;
        if (typeKey) {
            typeForm = getTypeForm(this, typeKey, isEdit);
        }

        const templatesColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('type'), render: data => this.templateTypes[data].typeName },
            { data: 4, title: t('created'), render: data => moment(data).fromNow() },
            { data: 5, title: t('namespace') },
        ];

        return (
            <div className={this.state.elementInFullscreen ? styles.withElementInFullscreen : ''}>
                {isEdit &&
                    <TestSendModalDialog
                        visible={this.state.showTestSendModal}
                        onHide={() => this.setState({showTestSendModal: false})}
                        getDataAsync={this.sendModalGetDataHandler}/>
                }
                {isEdit &&
                    <ContentModalDialog
                        title={this.state.exportModalTitle}
                        visible={this.state.showExportModal}
                        onHide={() => this.setState({showExportModal: false})}
                        getContentAsync={this.exportModalGetContentHandler}/>
                }
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/templates/${this.props.entity.id}`}
                        backUrl={`/templates/${this.props.entity.id}/edit`}
                        successUrl="/templates"
                        deletingMsg={t('deletingTemplate')}
                        deletedMsg={t('templateDeleted')}/>
                }

                <Title>{isEdit ? t('editTemplate') : t('createTemplate')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>

                    {!isEdit &&
                        <CheckBox id="fromSourceTemplate" label={t('template')} text={t('cloneFromAnExistingTemplate')}/>
                    }

                    {this.getFormValue('fromSourceTemplate') ?
                        <TableSelect key="templateSelect" id="sourceTemplate" withHeader dropdown dataUrl='rest/templates-table' columns={templatesColumns} selectionLabelIndex={1} />
                    :
                        <>
                            {isEdit ?
                                <StaticField id="type" className={styles.formDisabled} label={t('type')}>
                                    {typeKey && this.templateTypes[typeKey].typeName}
                                </StaticField>
                            :
                                <Dropdown id="type" label={t('type')} options={typeOptions}/>
                            }

                            {typeForm}
                        </>
                    }

                    <NamespaceSelect/>

                    {editForm}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        {isEdit && <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>}
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/templates/${this.props.entity.id}/delete`}/> }
                        {isEdit && <Button className="btn-success" icon="at" label={t('testSend')} onClickAsync={async () => this.setState({showTestSendModal: true})}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
