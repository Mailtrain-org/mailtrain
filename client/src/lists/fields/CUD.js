'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, TextArea, TableSelect, ButtonRow, Button,
    Fieldset, Dropdown, AlignedRow, ACEEditor
} from '../../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/delete";
import { getFieldTypes } from './field-types';
import axios from '../../lib/axios';
import interoperableErrors from '../../../../shared/interoperable-errors';
import validators from '../../../../shared/validators';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.state.listId = parseInt(props.match.params.listId);

        if (props.edit) {
            this.state.entityId = parseInt(props.match.params.fieldId);
        }

        this.fieldTypes = getFieldTypes(props.t);

        this.initForm({
            serverValidation: {
                url: `/rest/fields-validate/${this.state.listId}`,
                changed: ['key'],
                extra: ['id']
            }
        });
    }

    static propTypes = {
        edit: PropTypes.bool
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL(`/rest/fields/${this.state.listId}/${this.state.entityId}`, data => {
            if (data.default_value === null) {
                data.default_value = '';
            }
        });
    }

    @withAsyncErrorHandler
    async loadOrderOptions() {
        const t = this.props.t;

        const flds = await axios.get(`/rest/fields/${this.state.listId}`);

        const getOrderOptions = fld => {
            return [
                {key: 'none', label: t('Not visible')},
                ...flds.data.filter(x => x.id !== this.state.entityId && x[fld] !== null).sort((x, y) => x[fld] - y[fld]).map(x => ({ key: x.id, label: `${x.name} (${this.fieldTypes[x.type].label})`})),
                {key: 'end', label: t('End of list')}
            ];
        };

        this.setState({
            orderListOptions: getOrderOptions('order_list'),
            orderSubscribeOptions: getOrderOptions('order_subscribe'),
            orderManageOptions: getOrderOptions('order_manage')
        });
    }

    componentDidMount() {
        if (this.props.edit) {
            this.loadFormValues();
        } else {
            this.populateFormValues({
                name: '',
                type: 'text',
                key: '',
                default_value: '',
                group: null,
                orderListBefore: 'end', // possible values are <numeric id> / 'end' / 'none'
                orderSubscribeBefore: 'end',
                orderManageBefore: 'end',
                orderListOptions: [],
                orderSubscribeOptions: [],
                orderManageOptions: []
            });
        }

        this.loadOrderOptions();
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const edit = this.props.edit;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        const keyServerValidation = state.getIn(['key', 'serverValidation']);
        if (!validators.mergeTagValid(state.getIn(['key', 'value']))) {
            state.setIn(['key', 'error'], t('Merge tag is invalid. May must be uppercase and contain only characters A-Z, 0-9, _. It must start with a letter.'));
        } else if (!keyServerValidation) {
            state.setIn(['key', 'error'], t('Validation is in progress...'));
        } else if (keyServerValidation.exists) {
            state.setIn(['key', 'error'], t('Another field with the same merge tag exists. Please choose another merge tag.'));
        } else {
            state.setIn(['key', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;
        const edit = this.props.edit;

        let sendMethod, url;
        if (edit) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/fields/${this.state.listId}/${this.state.entityId}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `/rest/fields/${this.state.listId}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving field ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                if (data.default_value.trim() === '') {
                    data.default_value = null;
                }
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage(`/rest/fields/${this.state.listId}`, 'success', t('Field saved'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.DependencyNotFoundError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('It seems that another field upon which sort field order was established has been deleted in the meantime. Refresh your page to start anew. Please note that your changes will be lost.')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;
        const edit = this.props.edit;

/*
        const orderColumns = [
            { data: 1, title: t('Field name'), sortable: false, searchable: false }
        ];
*/

        const typeOptions = Object.keys(this.fieldTypes).map(key => ({key, label:this.fieldTypes[key].label}));

        const type = this.getFormValue('type');

        //                             <ACEEditor id={selectedTemplate} height="500px" mode={this.templateSettings[selectedTemplate].mode}/>

        return (
            <div>
                {edit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.match.params.action === 'delete'}
                        deleteUrl={`/rest/fields/${this.state.listId}/${this.state.entityId}`}
                        cudUrl={`/lists/fields/edit/${this.state.listId}/${this.state.entityId}`}
                        listUrl={`/lists/fields/${this.state.listId}`}
                        deletingMsg={t('Deleting field ...')}
                        deletedMsg={t('Field deleted')}/>
                }

                <Title>{edit ? t('Edit Field') : t('Create Field')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>

                    <Dropdown id="type" label={t('Type')} options={typeOptions}/>

                    <InputField id="key" label={t('Merge tag')}/>

                    {/* type && this.fieldTypes[type].renderSettings */}
                    <Fieldset label={t('Field settings')}>
                        <InputField id="default_value" label={t('Default value')} help={t('Default value used when the field is empty.')}/>
                    </Fieldset>
                    <Fieldset label={t('Field order')}>
                        <Dropdown id="orderListBefore" label={t('Listings (before)')} options={this.state.orderListOptions} help={t('Select the field before which this field should appeara in listings. To exclude the field from listings, select "Not visible".')}/>
                        <Dropdown id="orderSubscribeBefore" label={t('Subscription form (before)')} options={this.state.orderSubscribeOptions} help={t('Select the field before which this field should appear in new subscription form. To exclude the field from the new subscription form, select "Not visible".')}/>
                        <Dropdown id="orderManageBefore" label={t('Management form (before)')} options={this.state.orderManageOptions} help={t('Select the field before which this field should appear in subscription management. To exclude the field from the subscription management form, select "Not visible".')}/>
                    </Fieldset>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {edit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/fields/edit/${this.state.listId}/${this.state.entityId}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}