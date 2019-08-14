'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    Button,
    ButtonRow,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    TableSelect,
    TableSelectMode,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import axios from '../lib/axios';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import moment from 'moment';
import {getDefaultNamespace, NamespaceSelect, validateNamespace} from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import {getUrl} from "../lib/urls";
import {withComponentMixins} from "../lib/decorator-helpers";

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

        this.initForm({
            onChange: {
                report_template: ::this.onReportTemplateChange
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        permissions: PropTypes.object
    }

    @withAsyncErrorHandler
    async fetchUserFields(reportTemplateId) {
        const result = await axios.get(getUrl(`rest/report-template-user-fields/${reportTemplateId}`));
        this.updateFormValue('user_fields', result.data);
    }

    onReportTemplateChange(state, key, oldVal, newVal) {
        if (oldVal !== newVal) {
            state.formState = state.formState.setIn(['data', 'user_fields', 'value'], '');

            if (newVal) {
                // noinspection JSIgnoredPromiseFromCall
                this.fetchUserFields(newVal);
            }
        }
    }

    getFormValuesMutator(data) {
        for (const key in data.params) {
            data[`param_${key}`] = data.params[key];
        }
    }

    submitFormValuesMutator(data) {
        const params = {};

        if(data.user_fields){
            for (const spec of data.user_fields) {
                const fldId = `param_${spec.id}`;
                params[spec.id] = data[fldId];
            }
        }

        data.params = params;

        return filterData(data, ['name', 'description', 'report_template', 'params', 'namespace']);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {
            this.populateFormValues({
                name: '',
                description: '',
                report_template: null,
                namespace: getDefaultNamespace(this.props.permissions),
                user_fields: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const edit = this.props.entity;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['report_template', 'value'])) {
            state.setIn(['report_template', 'error'], t('reportTemplateMustBeSelected'));
        } else {
            state.setIn(['report_template', 'error'], null);
        }

        for (const paramId of state.keys()) {
            if (paramId.startsWith('param_')) {
                state.deleteIn([paramId, 'error']);
            }
        }

        const userFieldsSpec = state.getIn(['user_fields', 'value']);
        if (userFieldsSpec) {
            for (const spec of userFieldsSpec) {
                const fldId = `param_${spec.id}`;
                const selection = state.getIn([fldId, 'value']) || [];

                if (spec.maxOccurences === 1) {
                    if (spec.minOccurences === 1 && (selection === null || selection === undefined)) { // FIXME - this does not seem to correspond with selectionAsArray
                        state.setIn([fldId, 'error'], t('exactlyOneItemHasToBeSelected'));
                    }
                } else {
                    if (selection.length < spec.minOccurences) {
                        state.setIn([fldId, 'error'], t('atLeastCountItemsHaveToBeSelected', { count: spec.minOccurences }));
                    } else if (selection.length > spec.maxOccurences) {
                        state.setIn([fldId, 'error'], t('atMostCountItemsCanToBeSelected', { count: spec.maxOccurences }));
                    }
                }
            }
        }

        validateNamespace(t, state);
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        if (this.getFormValue('report_template') && !this.getFormValue('user_fields')) {
            this.setFormStatusMessage('warning', t('reportParametersAreNotSelectedWaitFor'));
            return;
        }

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/reports/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/reports'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/reports', 'success', t('reportUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/reports/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('reportUpdated'));
                }
            } else {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/reports', 'success', t('reportCreated'));
                } else {
                    this.navigateToWithFlashMessage(`/reports/${submitResult}/edit`, 'success', t('reportCreated'));
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

        const reportTemplateColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('created'), render: data => moment(data).fromNow() }
        ];

        const userFieldsSpec = this.getFormValue('user_fields');
        const userFields = [];

        function addUserFieldTableSelect(spec, dataUrl, selIndex, columns) {
            let dropdown, selectMode;

            if (spec.maxOccurences === 1) {
                dropdown = true;
                selectMode = TableSelectMode.SINGLE;
            } else {
                dropdown = true;
                selectMode = TableSelectMode.MULTI;
            }

            const fld = <TableSelect key={spec.id} id={`param_${spec.id}`} label={spec.name} selectionAsArray withHeader dropdown={dropdown} selectMode={selectMode} dataUrl={dataUrl} columns={columns} selectionLabelIndex={selIndex}/>;

            userFields.push(fld);
        }

        if (userFieldsSpec) {
            for (const spec of userFieldsSpec) {
                if (spec.type === 'campaign') {
                    addUserFieldTableSelect(spec, 'rest/campaigns-table', 1,[
                        {data: 0, title: "#"},
                        {data: 1, title: t('name')},
                        {data: 2, title: t('description')},
                        {data: 3, title: t('status')},
                        {data: 4, title: t('created'), render: data => moment(data).fromNow()}
                    ]);
                } else if (spec.type === 'list') {
                    addUserFieldTableSelect(spec, 'rest/lists-table', 1,[
                        {data: 0, title: "#"},
                        {data: 1, title: t('name')},
                        {data: 2, title: t('id')},
                        {data: 3, title: t('subscribers')},
                        {data: 4, title: t('description')}
                    ]);
                } else {
                    userFields.push(<div className="alert alert-danger" role="alert">{t('unknownFieldTypeType', { type: spec.type })}</div>)
                }
            }
        }

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/reports/${this.props.entity.id}`}
                        backUrl={`/reports/${this.props.entity.id}/edit`}
                        successUrl="/reports"
                        deletingMsg={t('deletingReport')}
                        deletedMsg={t('reportDeleted')}/>
                }

                <Title>{isEdit ? t('editReport') : t('createReport')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>

                    <TableSelect id="report_template" label={t('reportTemplate-1')} withHeader dropdown dataUrl="rest/report-templates-table" columns={reportTemplateColumns} selectionLabelIndex={1}/>

                    <NamespaceSelect/>

                    {userFieldsSpec ?
                        userFields.length > 0 &&
                            <Fieldset label={t('reportParameters')}>
                                {userFields}
                            </Fieldset>
                    :
                        this.getFormValue('report_template') &&
                            <div className="alert alert-info" role="alert">{t('loadingReportTemplate')}</div>
                    }

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                        {canDelete &&
                            <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/reports/${this.props.entity.id}/delete`}/>
                        }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
