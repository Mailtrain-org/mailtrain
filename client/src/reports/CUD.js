'use strict';

import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { withPageHelpers, Title } from '../lib/page'
import { withForm, Form, FormSendMethod, InputField, TextArea, TableSelect, TableSelectMode, ButtonRow, Button } from '../lib/form';
import axios from '../lib/axios';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { ModalDialog } from '../lib/bootstrap-components';
import moment from 'moment';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        if (props.edit) {
            this.state.entityId = parseInt(props.match.params.id);
        }

        this.initForm();
    }

    isDelete() {
        return this.props.match.params.action === 'delete';
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL(`/rest/reports/${this.state.entityId}`);
    }

    componentDidMount() {
        if (this.props.edit) {
            this.loadFormValues();
        } else {
            this.populateFormValues({
                report_template: null,
                name: '',
                description: ''
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const edit = this.props.edit;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['report_template', 'value'])) {
            state.setIn(['report_template', 'error'], t('Report template must be selected'));
        } else {
            state.setIn(['report_template', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;
        const edit = this.props.edit;

        let sendMethod, url;
        if (edit) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/reports/${this.state.entityId}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/reports'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving report template ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            delete data.password2;
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/reports', 'success', t('Report saved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    async showDeleteModal() {
        this.navigateTo(`/reports/edit/${this.state.entityId}/delete`);
    }

    async hideDeleteModal() {
        this.navigateTo(`/reports/edit/${this.state.entityId}`);
    }

    async performDelete() {
        const t = this.props.t;

        await this.hideDeleteModal();

        this.disableForm();
        this.setFormStatusMessage('info', t('Deleting report...'));

        await axios.delete(`/rest/reports/${this.state.entityId}`);

        this.navigateToWithFlashMessage('/reports', 'success', t('Report deleted'));
    }

    render() {
        const t = this.props.t;
        const edit = this.props.edit;

        const columns = [
            { data: 0, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Created'), render: data => moment(data).fromNow() }
        ];

        return (
            <div>
                {edit &&
                    <ModalDialog hidden={!this.isDelete()} title={t('Confirm deletion')} onCloseAsync={::this.hideDeleteModal} buttons={[
                        { label: t('No'), className: 'btn-primary', onClickAsync: ::this.hideDeleteModal },
                        { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performDelete }
                    ]}>
                        {t('Are you sure you want to delete "{{name}}"?', {name: this.getFormValue('name')})}
                    </ModalDialog>
                }

                <Title>{edit ? t('Edit Report') : t('Create Report')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>

                    <TableSelect id="report_template" label={t('Report Template')} withHeader dropdown dataUrl="/rest/report-templates-table" columns={columns} selectionLabelIndex={1} />

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {edit && <Button className="btn-danger" icon="remove" label={t('Delete Report')} onClickAsync={::this.showDeleteModal}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
