'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {HTTPMethod} from '../../lib/axios';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, TextArea, TableSelect, ButtonRow, Button,
    Fieldset, Dropdown, AlignedRow, ACEEditor, StaticField, CheckBox
} from '../../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import {DeleteModalDialog, RestActionModalDialog} from "../../lib/modals";
import interoperableErrors from '../../../../shared/interoperable-errors';
import validators from '../../../../shared/validators';
import { parseDate, parseBirthday, DateFormat } from '../../../../shared/date';
import { SubscriptionStatus } from '../../../../shared/lists';
import {getFieldTypes, getSubscriptionStatusLabels} from './helpers';
import moment from 'moment-timezone';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {};

        this.subscriptionStatusLabels = getSubscriptionStatusLabels(t);
        this.fieldTypes = getFieldTypes(t);

        this.initForm({
            serverValidation: {
                url: `rest/subscriptions-validate/${this.props.list.id}`,
                changed: ['email'],
                extra: ['id']
            },
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fieldsGrouped: PropTypes.array,
        entity: PropTypes.object
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.status = data.status.toString();
                data.tz = data.tz || '';

                for (const fld of this.props.fieldsGrouped) {
                    this.fieldTypes[fld.type].assignFormData(fld, data);
                }
            });

        } else {
            const data = {
                email: '',
                tz: '',
                is_test: false,
                status: SubscriptionStatus.SUBSCRIBED
            };

            for (const fld of this.props.fieldsGrouped) {
                this.fieldTypes[fld.type].initFormData(fld, data);
            }

            this.populateFormValues(data);
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const emailServerValidation = state.getIn(['email', 'serverValidation']);
        if (!state.getIn(['email', 'value'])) {
            state.setIn(['email', 'error'], t('Email must not be empty'));
        } else if (!emailServerValidation) {
            state.setIn(['email', 'error'], t('Validation is in progress...'));
        } else if (emailServerValidation.exists) {
            state.setIn(['email', 'error'], t('Another subscription with the same email already exists.'));
        } else {
            state.setIn(['email', 'error'], null);
        }

        for (const fld of this.props.fieldsGrouped) {
            this.fieldTypes[fld.type].validate(fld, state);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/subscriptions/${this.props.list.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `rest/subscriptions/${this.props.list.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                data.status = parseInt(data.status);
                data.tz = data.tz || null;

                for (const fld of this.props.fieldsGrouped) {
                    this.fieldTypes[fld.type].assignEntity(fld, data);
                }
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/subscriptions`, 'success', t('Susbscription saved'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.DuplicitEmailError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('It seems that another subscription with the same email has been created in the meantime. Refresh your page to start anew. Please note that your changes will be lost.')}
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

        const fieldsGrouped = this.props.fieldsGrouped;

        const statusOptions = Object.keys(this.subscriptionStatusLabels)
            .map(key => ({key, label: this.subscriptionStatusLabels[key]}));

        const tzOptions = [
            { key: '', label: t('Not selected') },
            ...moment.tz.names().map(tz => ({ key: tz.toLowerCase(), label: tz }))
        ];

        const customFields = [];
        for (const fld of this.props.fieldsGrouped) {
            customFields.push(this.fieldTypes[fld.type].form(fld));
        }

        return (
            <div>
                {isEdit &&
                    <div>
                        <RestActionModalDialog
                            title={t('Confirm deletion')}
                            message={t('Are you sure you want to delete subscription for "{{email}}"?', {name: this.getFormValue('email')})}
                            stateOwner={this}
                            visible={this.props.action === 'delete'}
                            actionMethod={HTTPMethod.DELETE}
                            actionUrl={`rest/subscriptions/${this.props.list.id}/${this.props.entity.id}`}
                            backUrl={`/lists/${this.props.list.id}/subscriptions/${this.props.entity.id}/edit`}
                            successUrl={`/lists/${this.props.list.id}/subscriptions`}
                            actionInProgressMsg={t('Deleting subscription ...')}
                            actionDoneMsg={t('Subscription deleted')}/>
                    </div>
                }

                <Title>{isEdit ? t('Edit Subscription') : t('Create Subscription')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="email" label={t('Email')}/>

                    {customFields}

                    <hr />

                    <Dropdown id="tz" label={t('Timezone')} options={tzOptions}/>

                    <Dropdown id="status" label={t('Subscription status')} options={statusOptions}/>

                    <CheckBox id="is_test" text={t('Test user?')} help={t('If checked then this subscription can be used for previewing campaign messages')}/>

                    {!isEdit &&
                        <AlignedRow>
                            <p className="text-warning">
                                This person will not receive a confirmation email so make sure that you have permission to
                                email them.
                            </p>
                        </AlignedRow>
                    }
                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/${this.props.list.id}/subscriptions/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
