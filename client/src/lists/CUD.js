'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, TextArea, TableSelect, ButtonRow, Button,
    Dropdown, StaticField, CheckBox
} from '../lib/form';
import { withErrorHandling } from '../lib/error-handling';
import { DeleteModalDialog } from '../lib/delete';
import { validateNamespace, NamespaceSelect } from '../lib/namespace';
import { UnsubscriptionMode } from '../../../shared/lists';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object
    }
    
    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.form = data.default_form ? 'custom' : 'default';
            });
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                form: 'default',
                default_form: null,
                public_subscribe: true,
                unsubscription_mode: UnsubscriptionMode.ONE_STEP,
                namespace: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (state.getIn(['form', 'value']) === 'custom' && !state.getIn(['default_form', 'value'])) {
            state.setIn(['default_form', 'error'], t('Custom form must be selected'));
        } else {
            state.setIn(['default_form', 'error'], null);
        }

        validateNamespace(t, state);
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/lists/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/lists'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            if (data.form === 'default') {
                data.default_form = null;
            }
            delete data.form;
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/lists', 'success', t('List saved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        const unsubcriptionModeOptions = [
            {
                key: UnsubscriptionMode.ONE_STEP,
                label: t('One-step (i.e. no email with confirmation link)')
            },
            {
                key: UnsubscriptionMode.ONE_STEP_WITH_FORM,
                label: t('One-step with unsubscription form (i.e. no email with confirmation link)')
            },
            {
                key: UnsubscriptionMode.TWO_STEP,
                label: t('Two-step (i.e. an email with confirmation link will be sent)')
            },
            {
                key: UnsubscriptionMode.TWO_STEP_WITH_FORM,
                label: t('Two-step with unsubscription form (i.e. an email with confirmation link will be sent)')
            },
            {
                key: UnsubscriptionMode.MANUAL,
                label: t('Manual (i.e. unsubscription has to be performed by the list administrator)')
            }
        ];

        const formsOptions = [
            {
                key: 'default',
                label: t('Default Mailtrain Forms')
            },
            {
                key: 'custom',
                label: t('Custom Forms (select form below)')
            }
        ];

        const customFormsColumns = [
            {data: 0, title: "#"},
            {data: 1, title: t('Name')},
            {data: 2, title: t('Description')},
            {data: 3, title: t('Namespace')}
        ];

        return (
            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/lists/${this.props.entity.id}`}
                        cudUrl={`/lists/${this.props.entity.id}/edit`}
                        listUrl="/lists"
                        deletingMsg={t('Deleting list ...')}
                        deletedMsg={t('List deleted')}/>
                }

                <Title>{isEdit ? t('Edit List') : t('Create List')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>

                    {isEdit &&
                        <StaticField id="cid" label="List ID" help={t('This is the list ID displayed to the subscribers')}>
                            {this.getFormValue('cid')}
                        </StaticField>
                    }

                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>

                    <NamespaceSelect/>

                    <Dropdown id="form" label={t('Forms')} options={formsOptions} help={t('Web and email forms and templates used in subscription management process.')}/>

                    {this.getFormValue('form') === 'custom' &&
                        <TableSelect id="default_form" label={t('Custom Forms')} withHeader dropdown dataUrl='/rest/forms-table' columns={customFormsColumns} selectionLabelIndex={1} help={<Trans>The custom form used for this list. You can create a form <a href={`/lists/forms/create/${this.props.entity.id}`}>here</a>.</Trans>}/>
                    }

                    <CheckBox id="public_subscribe" label={t('Subscription')} text={t('Allow public users to subscribe themselves')}/>

                    <Dropdown id="unsubscription_mode" label={t('Unsubscription')} options={unsubcriptionModeOptions} help={t('Select how an unsuscription request by subscriber is handled.')}/>


                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}