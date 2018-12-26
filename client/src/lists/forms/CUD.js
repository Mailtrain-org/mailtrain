'use strict';

import React, {Component} from 'react';
import PropTypes
    from 'prop-types';
import {Trans} from 'react-i18next';
import {withTranslation} from '../../lib/i18n';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../../lib/page';
import {
    ACEEditor,
    AlignedRow,
    Button,
    ButtonRow,
    Dropdown,
    Fieldset,
    Form,
    FormSendMethod,
    InputField,
    TableSelect,
    TextArea,
    withForm
} from '../../lib/form';
import {withErrorHandling} from '../../lib/error-handling';
import {
    NamespaceSelect,
    validateNamespace
} from '../../lib/namespace';
import {DeleteModalDialog} from "../../lib/modals";
import mailtrainConfig
    from 'mailtrainConfig';
import {
    getTrustedUrl,
    getUrl
} from "../../lib/urls";
import {
    ActionLink,
    Icon
} from "../../lib/bootstrap-components";
import styles
    from "../../lib/styles.scss";
import formsStyles
    from "./styles.scss";
import axios
    from "../../lib/axios";
import {withComponentMixins} from "../../lib/decorator-helpers";

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

        this.state = {
            previewContents: null,
            previewFullscreen: false
        };

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
            'web_manual_unsubscribe_notice',
            'web_privacy_policy_notice'
        ];

        this.initForm({
            serverValidation: {
                url: 'rest/forms-validate',
                changed: this.serverValidatedFields
            },
            onChange: {
                previewList: () => {
                    this.setState({
                        previewContents: null
                    });
                }
            }
        });


        const t = props.t;

        const helpEmailText = t('thePlaintextVersionForThisEmail');
        const helpMjmlGeneral = <Trans i18nKey="customFormsUseMjmlForFormattingSeeThe">Custom forms use MJML for formatting. See the MJML documentation <a className="mjml-documentation" href="https://mjml.io/documentation/">here</a></Trans>;

        this.templateSettings = {
            layout: {
                label: t('layout'),
                mode: 'html',
                help: helpMjmlGeneral,
                isLayout: true
            },
            form_input_style: {
                label: t('formInputStyle'),
                mode: 'css',
                help: t('thisCssStylesheetDefinesTheAppearanceOf')
            },
            web_subscribe: {
                label: t('webSubscribe'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_confirm_subscription_notice: {
                label: t('webConfirmSubscriptionNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_subscription_html: {
                label: t('mailConfirmSubscriptionMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_subscription_text: {
                label: t('mailConfirmSubscriptionText'),
                mode: 'text',
                help: helpEmailText
            },
            mail_already_subscribed_html: {
                label: t('mailAlreadySubscribedMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_already_subscribed_text: {
                label: t('mailAlreadySubscribedText'),
                mode: 'text',
                help: helpEmailText
            },
            web_subscribed_notice: {
                label: t('webSubscribedNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_subscription_confirmed_html: {
                label: t('mailSubscriptionConfirmedMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_subscription_confirmed_text: {
                label: t('mailSubscriptionConfirmedText'),
                mode: 'text',
                help: helpEmailText
            },
            web_manage: {
                label: t('webManagePreferences'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_manage_address: {
                label: t('webManageAddress'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_address_change_html: {
                label: t('mailConfirmAddressChangeMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_address_change_text: {
                label: t('mailConfirmAddressChangeText'),
                mode: 'text',
                help: helpEmailText
            },
            web_updated_notice: {
                label: t('webUpdatedNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_unsubscribe: {
                label: t('webUnsubscribe'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_confirm_unsubscription_notice: {
                label: t('webConfirmUnsubscriptionNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_unsubscription_html: {
                label: t('mailConfirmUnsubscriptionMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_confirm_unsubscription_text: {
                label: t('mailConfirmUnsubscriptionText'),
                mode: 'text',
                help: helpEmailText
            },
            web_unsubscribed_notice: {
                label: t('webUnsubscribedNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_unsubscription_confirmed_html: {
                label: t('mailUnsubscriptionConfirmedMjml'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            mail_unsubscription_confirmed_text: {
                label: t('mailUnsubscriptionConfirmedText'),
                mode: 'text',
                help: helpEmailText
            },
            web_manual_unsubscribe_notice: {
                label: t('webManualUnsubscribeNotice'),
                mode: 'html',
                help: helpMjmlGeneral
            },
            web_privacy_policy_notice: {
                label: t('privacyPolicy'),
                mode: 'html',
                help: helpMjmlGeneral
            }
        };

        this.templateGroups = {
            general: {
                label: t('general'),
                options: [
                    'layout',
                    'form_input_style'
                ]
            },
            subscribe: {
                label: t('subscribe'),
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
                label: t('manage'),
                options: [
                    'web_manage', 
                    'web_manage_address',
                    'mail_confirm_address_change_html',
                    'mail_confirm_address_change_text',
                    'web_updated_notice'
                ]
            },
            unsubscribe: {
                label: t('unsubscribe'),
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
            gdpr: {
                label: t('dataProtection'),
                options: [
                    'web_privacy_policy_notice'
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
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
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
            formsErrors.push(t('validationIsInProgress'));
        }

        if (formsErrors.length) {
            state.setIn(['selectedTemplate', 'error'],
                <div><strong>{t('listOfErrorsInTemplates') + ':'}</strong>
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
            url = `rest/forms/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/forms'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            delete data.selectedTemplate;
            delete data.previewList;
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/lists/forms', 'success', t('formsSaved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    async preview(formKey) {
        const data = {
            formKey,
            template: this.getFormValue(formKey),
            layout: this.getFormValue('layout'),
            formInputStyle: this.getFormValue('form_input_style'),
            listId: this.getFormValue('previewList')
        }

        const response = await axios.post(getUrl('rest/forms-preview'), data);

        this.setState({
            previewContents: response.data.content,
            previewLabel: this.templateSettings[formKey].label
        });
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
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 5, title: t('namespace') }
        ];

        const previewListId = this.getFormValue('previewList');
        const selectedTemplate = this.getFormValue('selectedTemplate');

        return (
            <div className={this.state.previewFullscreen ? styles.withElementInFullscreen : ''}>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/forms/${this.props.entity.id}`}
                        backUrl={`/lists/forms/${this.props.entity.id}/edit`}
                        successUrl="/lists/forms"
                        deletingMsg={t('deletingForm')}
                        deletedMsg={t('formDeleted')}/>
                }

                <Title>{isEdit ? t('editCustomForms') : t('createCustomForms')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>

                    <TextArea id="description" label={t('description')}/>

                    <NamespaceSelect/>

                    <Fieldset label={t('formsPreview')}>
                        <TableSelect id="previewList" label={t('listToPreviewOn')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} help={t('selectListWhoseFieldsWillBeUsedToPreview')}/>

                        { previewListId &&
                            <div>
                                <AlignedRow>
                                    <div className="help-block">
                                        <small>
                                            {t('noteTheseLinksAreSolelyForAQuickPreview')}
                                        </small>
                                    </div>
                                    <p>
                                        <ActionLink onClickAsync={async () => await this.preview('web_subscribe')}>Subscribe</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_confirm_subscription_notice')}>Confirm Subscription Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_confirm_unsubscription_notice')}>Confirm Unsubscription Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_subscribed_notice')}>Subscribed Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_updated_notice')}>Updated Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_unsubscribed_notice')}>Unsubscribed Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_manual_unsubscribe_notice')}>Manual Unsubscribe Notice</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_unsubscribe')}>Unsubscribe</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_manage')}>Manage</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_manage_address')}>Manage Address</ActionLink>
                                        {' | '}
                                        <ActionLink onClickAsync={async () => await this.preview('web_privacy_policy_notice')}>Privacy Policy</ActionLink>
                                    </p>
                                </AlignedRow>
                                {this.state.previewContents &&
                                <div className={this.state.previewFullscreen ? formsStyles.editorFullscreen : formsStyles.editor}>
                                    <div className={formsStyles.navbar}>
                                        {this.state.fullscreen && <img className={formsStyles.logo} src={getTrustedUrl('static/mailtrain-notext.png')}/>}
                                        <div className={formsStyles.title}>{t('formPreview') + ' ' + this.state.previewLabel}</div>
                                        <a className={formsStyles.btn} onClick={() => this.setState({previewContents: null, previewFullscreen: false})}><Icon icon="remove"/></a>
                                        <a className={formsStyles.btn} onClick={() => this.setState({previewFullscreen: !this.state.previewFullscreen})}><Icon icon="fullscreen"/></a>
                                    </div>
                                    <iframe className={formsStyles.host} src={"data:text/html;charset=utf-8," + encodeURIComponent(this.state.previewContents)}></iframe>
                                </div>
                                }
                            </div>
                        }
                    </Fieldset>

                    { selectedTemplate &&
                        <Fieldset label={t('templates')}>
                            <Dropdown id="selectedTemplate" label={t('edit')} options={templateOptGroups} help={this.templateSettings[selectedTemplate].help}/>
                            <ACEEditor id={selectedTemplate} height="500px" mode={this.templateSettings[selectedTemplate].mode}/>
                        </Fieldset>
                    }

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('save')}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('delete')} linkTo={`/lists/forms/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}