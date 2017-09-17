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
import { validateNamespace, NamespaceSelect } from '../../lib/namespace';
import {DeleteModalDialog} from "../../lib/modals";
import mailtrainConfig from 'mailtrainConfig';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.serverValidatedFields = [
            'layout',
            'web_subscribe',
            'web_confirm_subscription_notice',
            'mail_confirm_subscription_html',
            'mail_confirm_subscription_text',
            'mail_already_subscribed_html',
            'mail_already_subscribed_text',
            'web_subscribed_notice',
            'mail_subscription_confirmed_html',
            'mail_subscription_confirmed_text',
            'web_manage',
            'web_manage_address',
            'web_updated_notice',
            'web_unsubscribe',
            'web_confirm_unsubscription_notice',
            'mail_confirm_unsubscription_html',
            'mail_confirm_unsubscription_text',
            'mail_confirm_address_change_html',
            'mail_confirm_address_change_text',
            'web_unsubscribed_notice',
            'mail_unsubscription_confirmed_html',
            'mail_unsubscription_confirmed_text',
            'web_manual_unsubscribe_notice'
        ];

        this.initForm({
            serverValidation: {
                url: '/rest/forms-validate',
                changed: this.serverValidatedFields
            }
        });


        const t = props.t;

        const helpEmailText = t('The plaintext version for this email');
        const helpMjmlGeneral = <Trans>Custom forms use MJML for formatting. See the MJML documentation <a className="mjml-documentation">here</a></Trans>;

        this.templateSettings = {
            layout: {
                label: t('Layout'),
                mode: 'html',
                help: helpMjmlGeneral,
                isLayout: true
            },
            form_input_style: {
                label: t('Form Input Style'),
                mode: 'css',
                help: t('This CSS stylesheet defines the appearance of form input elements and alerts')
            },
            web_subscribe: {
                label: t('Web - Subscribe'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_confirm_subscription_notice: {
                label: t('Web - Confirm Subscription Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_subscription_html: {
                label: t('Mail - Confirm Subscription (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_subscription_text: {
                label: t('Mail - Confirm Subscription (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            mail_already_subscribed_html: {
                label: t('Mail - Already Subscribed (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_already_subscribed_text: {
                label: t('Mail - Already Subscribed (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            web_subscribed_notice: {
                label: t('Web - Subscribed Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_subscription_confirmed_html: {
                label: t('Mail - Subscription Confirmed (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_subscription_confirmed_text: {
                label: t('Mail - Subscription Confirmed (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            web_manage: {
                label: t('Web - Manage Preferences'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_manage_address: {
                label: t('Web - Manage Address'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_address_change_html: {
                label: t('Mail - Confirm Address Change (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_address_change_text: {
                label: t('Mail - Confirm Address Change (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            web_updated_notice: {
                label: t('Web - Updated Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_unsubscribe: {
                label: t('Web - Unsubscribe'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_confirm_unsubscription_notice: {
                label: t('Web - Confirm Unsubscription Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_unsubscription_html: {
                label: t('Mail - Confirm Unsubscription (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_unsubscription_text: {
                label: t('Mail - Confirm Unsubscription (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            web_unsubscribed_notice: {
                label: t('Web - Unsubscribed Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_unsubscription_confirmed_html: {
                label: t('Mail - Unsubscription Confirmed (MJML)'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_unsubscription_confirmed_text: {
                label: t('Mail - Unsubscription Confirmed (Text)'),
                mode: 'text',
                help: helpEmailText
            },
            web_manual_unsubscribe_notice: {
                label: t('Web - Manual Unsubscribe Notice'),
                mode: 'html',
                help: helpMjmlGeneral
            }
        };

        this.templateGroups = {
            general: {
                label: t('General'),
                options: [
                    'layout',
                    'form_input_style'
                ]
            },
            subscribe: {
                label: t('Subscribe'),
                options: [
                    'web_subscribe',
                    'web_confirm_subscription_notice',
                    'mail_confirm_subscription_html',
                    'mail_confirm_subscription_text',
                    'mail_already_subscribed_html',
                    'mail_already_subscribed_text',
                    'web_subscribed_notice',
                    'mail_subscription_confirmed_html',
                    'mail_subscription_confirmed_text'
                ]
            },
            manage: {
                label: t('Manage'),
                options: [
                    'web_manage', 
                    'web_manage_address',
                    'mail_confirm_address_change_html',
                    'mail_confirm_address_change_text',
                    'web_updated_notice'
                ]
            },
            unsubscribe: {
                label: t('Unsubscribe'),
                options: [
                    'web_unsubscribe',
                    'web_confirm_unsubscription_notice',
                    'mail_confirm_unsubscription_html',
                    'mail_confirm_unsubscription_text',
                    'web_unsubscribed_notice',
                    'mail_unsubscription_confirmed_html',
                    'mail_unsubscription_confirmed_text',
                    'web_manual_unsubscribe_notice'
                ]
            },
        };

    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object
    }


    componentDidMount() {
        function supplyDefaults(data) {
            for (const key in mailtrainConfig.defaultCustomFormValues) {
                if (!data[key]) {
                    data[key] = mailtrainConfig.defaultCustomFormValues[key];
                }
            }
        }

        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.selectedTemplate = 'layout';
                supplyDefaults(data);
            });

        } else {
            const data = {
                name: '',
                description: '',
                selectedTemplate: 'layout',
                namespace: mailtrainConfig.user.namespace
            };
            supplyDefaults(data);

            this.populateFormValues(data);
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        validateNamespace(t, state);

        let formsServerValidationRunning = false;
        const formsErrors = [];

        for (const fld of this.serverValidatedFields) {
            const serverValidation = state.getIn([fld, 'serverValidation']);

            if (serverValidation && serverValidation.errors) {
                formsErrors.push(...serverValidation.errors.map(x => <div><em>{this.templateSettings[fld].label}</em>{' '}–{' '}{x}</div>));
            } else if (!serverValidation) {
                formsServerValidationRunning = true;
            }
        }

        if (!formsErrors.length && formsServerValidationRunning) {
            formsErrors.push(t('Validation is in progress...'));
        }

        if (formsErrors.length) {
            state.setIn(['selectedTemplate', 'error'],
                <div><strong>{t('List of errors in templates') + ':'}</strong>
                    <ul>
                        {formsErrors.map((msg, idx) => <li key={idx}>{msg}</li>)}
                    </ul>
                </div>);
        } else {
            state.setIn(['selectedTemplate', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/forms/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/forms'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            delete data.selectedTemplate;
            delete data.previewList;
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/lists/forms', 'success', t('Forms saved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const templateOptGroups = [];

        for (const grpKey in this.templateGroups) {
            const grp = this.templateGroups[grpKey];
            templateOptGroups.push({
                key: grpKey,
                label: grp.label,
                options: grp.options.map(opt => ({
                    key: opt,
                    label: this.templateSettings[opt].label
                }))
            });
        }


        const listsColumns = [
            { data: 0, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => `<code>${data}</code>` },
            { data: 5, title: t('Namespace') }
        ];

        const previewListId = this.getFormValue('previewList');
        const selectedTemplate = this.getFormValue('selectedTemplate');

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/forms/${this.props.entity.id}`}
                        cudUrl={`/lists/forms/${this.props.entity.id}/edit`}
                        listUrl="/lists/forms"
                        deletingMsg={t('Deleting form ...')}
                        deletedMsg={t('Form deleted')}/>
                }

                <Title>{isEdit ? t('Edit Custom Forms') : t('Create Custom Forms')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>

                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>

                    <NamespaceSelect/>

                    <Fieldset label={t('Forms Preview')}>
                        <TableSelect id="previewList" label={t('List To Preview On')} withHeader dropdown dataUrl='/rest/lists-table' columns={listsColumns} selectionLabelIndex={1} help={t('Select list whose fields will be used to preview the forms.')}/>

                        { previewListId &&
                            <AlignedRow>
                                <div className="help-block">
                                    <small>
                                        Note: These links are solely for a quick preview. If you submit a preview form you'll get redirected to the list's default form.
                                    </small>
                                </div>
                                <p>
                                    <a href={`/lists/forms/preview/${previewListId}`} target="_blank">Subscribe</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/confirm-subscription-notice`} target="_blank">Confirm Subscription Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/confirm-unsubscription-notice`} target="_blank">Confirm Unsubscription Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/subscribed-notice`} target="_blank">Subscribed Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/updated-notice`} target="_blank">Updated Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/unsubscribed-notice`} target="_blank">Unsubscribed Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/manual-unsubscribe-notice`} target="_blank">Manual Unsubscribe Notice</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/unsubscribe`} target="_blank">Unsubscribe</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/manage`} target="_blank">Manage</a>
                                    |
                                    <a href={`/lists/forms/preview/${previewListId}/manage-address`} target="_blank">Manage Address</a>
                                </p>
                            </AlignedRow>
                        }
                    </Fieldset>

                    { selectedTemplate &&
                        <Fieldset label={t('Templates')}>
                            <Dropdown id="selectedTemplate" label={t('Edit')} optGroups={templateOptGroups} help={this.templateSettings[selectedTemplate].help}/>
                            <ACEEditor id={selectedTemplate} height="500px" mode={this.templateSettings[selectedTemplate].mode}/>
                        </Fieldset>
                    }

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/forms/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}