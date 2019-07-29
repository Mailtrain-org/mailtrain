'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    Button,
    ButtonRow,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    TreeTableSelect,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import axios from '../lib/axios';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import interoperableErrors from '../../../shared/interoperable-errors';
import {DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import {getGlobalNamespaceId} from "../../../shared/namespaces";
import {getUrl} from "../lib/urls";
import {withComponentMixins} from "../lib/decorator-helpers";
import {getDefaultNamespace} from "../lib/namespace";

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

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        permissions: PropTypes.object
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['name', 'description', 'namespace']);
    }

    isEditGlobal() {
        return this.props.entity && this.props.entity.id === getGlobalNamespaceId();
    }

    removeNsIdSubtree(data) {
        for (let idx = 0; idx < data.length; idx++) {
            const entry = data[idx];

            if (entry.key === this.props.entity.id) {
                data.splice(idx, 1);
                return true;
            }

            if (this.removeNsIdSubtree(entry.children)) {
                return true;
            }
        }
    }

    @withAsyncErrorHandler
    async loadTreeData() {
        if (!this.isEditGlobal()) {
            const response = await axios.get(getUrl('rest/namespaces-tree'));
            const data = response.data;
            for (const root of data) {
                root.expanded = true;
            }

            if (this.props.entity && !this.isEditGlobal()) {
                this.removeNsIdSubtree(data);
            }

            if (this.isComponentMounted()) {
                this.setState({
                    treeData: data
                });
            }
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: getDefaultNamespace(this.props.permissions)
            });
        }

        // noinspection JSIgnoredPromiseFromCall
        this.loadTreeData();
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value']).trim()) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!this.isEditGlobal()) {
            if (!state.getIn(['namespace', 'value'])) {
                state.setIn(['namespace', 'error'], t('parentNamespaceMustBeSelected'));
            } else {
                state.setIn(['namespace', 'error'], null);
            }
        }
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/namespaces/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/namespaces'
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('saving'));

            const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

            if (submitResult) {
                if (this.props.entity) {
                    if (submitAndLeave) {
                        this.navigateToWithFlashMessage('/namespaces', 'success', t('namespaceUpdated'));
                    } else {
                        await this.getFormValuesFromURL(`rest/namespaces/${this.props.entity.id}`);
                        await this.loadTreeData();

                        this.enableForm();
                        this.setFormStatusMessage('success', t('namespaceUpdated'));
                    }
                } else {
                    if (submitAndLeave) {
                        this.navigateToWithFlashMessage('/namespaces', 'success', t('namespaceCreated'));
                    } else {
                        this.navigateToWithFlashMessage(`/namespaces/${submitResult}/edit`, 'success', t('namespaceCreated'));
                    }
                }
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }

        } catch (error) {
            if (error instanceof interoperableErrors.LoopDetectedError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('thereHasBeenALoopDetectedInTheAssignment')}
                    </span>
                );
                return;
            }

            if (error instanceof interoperableErrors.DependencyNotFoundError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                        {t('itSeemsThatTheParentNamespaceHasBeen')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && !this.isEditGlobal() && mailtrainConfig.user.namespace !== this.props.entity.id && this.props.entity.permissions.includes('delete');

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/namespaces/${this.props.entity.id}`}
                        backUrl={`/namespaces/${this.props.entity.id}/edit`}
                        successUrl="/namespaces"
                        deletingMsg={t('deletingNamespace')}
                        deletedMsg={t('namespaceDeleted')} />
                }

                <Title>{isEdit ? t('editNamespace') : t('createNamespace')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>

                    {!this.isEditGlobal() &&
                    <TreeTableSelect id="namespace" label={t('parentNamespace')} data={this.state.treeData}/>}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                        {canDelete && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/namespaces/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
