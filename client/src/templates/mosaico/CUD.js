'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../../lib/page'
import {
    Button,
    ButtonRow,
    Dropdown,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../../lib/form';
import {withErrorHandling} from '../../lib/error-handling';
import {NamespaceSelect, validateNamespace} from '../../lib/namespace';
import {DeleteModalDialog} from "../../lib/modals";

import {getMJMLSample, getVersafix} from "../../../../shared/mosaico-templates";
import {getTemplateTypes, getTemplateTypesOrder} from "./helpers";
import {withComponentMixins} from "../../lib/decorator-helpers";
import styles from "../../lib/styles.scss";

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

        this.typeOptions = [];
        for (const type of getTemplateTypesOrder()) {
            this.typeOptions.push({
                key: type,
                label: this.templateTypes[type].typeName
            });
        }

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object
    }

    getFormValuesMutator(data) {
        this.templateTypes[data.type].afterLoad(this, data);
    }

    submitFormValuesMutator(data) {
        this.templateTypes[data.type].beforeSave(this, data);
        return filterData(data, ['name', 'description', 'type', 'data', 'namespace']);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {
            const wizard = this.props.wizard;

            if (wizard === 'versafix') {
                this.populateFormValues({
                    name: '',
                    description: '',
                    namespace: mailtrainConfig.user.namespace,
                    type: 'html',
                    html: getVersafix()
                });

            } else if (wizard === 'mjml-sample') {
                this.populateFormValues({
                    name: '',
                    description: '',
                    namespace: mailtrainConfig.user.namespace,
                    type: 'mjml',
                    mjml: getMJMLSample()
                });

            } else {
                this.populateFormValues({
                    name: '',
                    description: '',
                    namespace: mailtrainConfig.user.namespace,
                    type: 'html',
                    html: ''
                });
            }
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['type', 'value'])) {
            state.setIn(['type', 'error'], t('typeMustBeSelected'));
        } else {
            state.setIn(['type', 'error'], null);
        }

        validateNamespace(t, state);
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/mosaico-templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/mosaico-templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/templates/mosaico', 'success', t('mosaicoTemplateUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/mosaico-templates/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('mosaicoTemplateUpdated'));
                }
            } else {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/templates/mosaico', 'success', t('mosaicoTemplateCreated'));
                } else {
                    this.navigateToWithFlashMessage(`/templates/mosaico/${submitResult}/edit`, 'success', t('mosaicoTemplateCreated'));
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
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const typeKey = this.getFormValue('type');

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/mosaico-templates/${this.props.entity.id}`}
                        backUrl={`/templates/mosaico/${this.props.entity.id}/edit`}
                        successUrl="/templates/mosaico"
                        deletingMsg={t('deletingMosaicoTemplate')}
                        deletedMsg={t('mosaicoTemplateDeleted')}/>
                }

                <Title>{isEdit ? t('editMosaicoTemplate') : t('createMosaicoTemplate')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>
                    {isEdit || this.props.wizard ?
                        <StaticField id="type" className={styles.formDisabled} label={t('type')}>
                            {typeKey && this.templateTypes[typeKey].typeName}
                        </StaticField>
                        :
                        <Dropdown id="type" label={t('type')} options={this.typeOptions}/>
                    }
                    <NamespaceSelect/>

                    {isEdit && typeKey && this.templateTypes[typeKey].getForm(this)}

                    <ButtonRow>
                        {isEdit ?
                        <>
                            <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                            <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                        </>
                        :
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndEditContent')}/>
                        }
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/templates/mosaico/${this.props.entity.id}/delete`}/>}
                        {isEdit && typeKey && this.templateTypes[typeKey].getButtons(this)}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
