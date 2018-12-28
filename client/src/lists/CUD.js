'use strict';

import React, {Component} from 'react';
import PropTypes
    from 'prop-types';
import {Trans} from 'react-i18next';
import {withTranslation} from '../lib/i18n';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page';
import {
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TableSelect,
    TextArea,
    withForm
} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import {DeleteModalDialog} from '../lib/modals';
import {
    NamespaceSelect,
    validateNamespace
} from '../lib/namespace';
import {UnsubscriptionMode} from '../../../shared/lists';
import styles
    from "../lib/styles.scss";
import mailtrainConfig
    from 'mailtrainConfig';
import {getMailerTypes} from "../send-configurations/helpers";
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

        this.initForm();

        this.mailerTypes = getMailerTypes(props.t);
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object
    }
    
    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.form = data.default_form ? 'custom' : 'default';
                data.listunsubscribe_disabled = !!data.listunsubscribe_disabled;
            });
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                form: 'default',
                default_form: null,
                public_subscribe: true,
                contact_email: '',
                homepage: '',
                unsubscription_mode: UnsubscriptionMode.ONE_STEP,
                namespace: mailtrainConfig.user.namespace,
                to_name: '[MERGE_FIRST_NAME] [MERGE_LAST_NAME]',
                send_configuration: null,
                listunsubscribe_disabled: false
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['send_configuration', 'value'])) {
            state.setIn(['send_configuration', 'error'], t('sendConfigurationMustBeSelected'));
        } else {
            state.setIn(['send_configuration', 'error'], null);
        }

        if (state.getIn(['form', 'value']) === 'custom' && !state.getIn(['default_form', 'value'])) {
            state.setIn(['default_form', 'error'], t('customFormMustBeSelected'));
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
            url = `rest/lists/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/lists'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
            if (data.form === 'default') {
                data.default_form = null;
            }
            delete data.form;
        });

        if (submitSuccessful) {
            this.navigateToWithFlashMessage('/lists', 'success', t('listSaved'));
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const unsubcriptionModeOptions = [
            {
                key: UnsubscriptionMode.ONE_STEP,
                label: t('onestepIeNoEmailWithConfirmationLink')
            },
            {
                key: UnsubscriptionMode.ONE_STEP_WITH_FORM,
                label: t('onestepWithUnsubscriptionFormIeNoEmail')
            },
            {
                key: UnsubscriptionMode.TWO_STEP,
                label: t('twostepIeAnEmailWithConfirmationLinkWill')
            },
            {
                key: UnsubscriptionMode.TWO_STEP_WITH_FORM,
                label: t('twostepWithUnsubscriptionFormIeAnEmail')
            },
            {
                key: UnsubscriptionMode.MANUAL,
                label: t('manualIeUnsubscriptionHasToBePerformedBy')
            }
        ];

        const formsOptions = [
            {
                key: 'default',
                label: t('defaultMailtrainForms')
            },
            {
                key: 'custom',
                label: t('customFormsSelectFormBelow')
            }
        ];

        const customFormsColumns = [
            {data: 0, title: "#"},
            {data: 1, title: t('name')},
            {data: 2, title: t('description')},
            {data: 3, title: t('namespace')}
        ];

        const sendConfigurationsColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.mailerTypes[data].typeName },
            { data: 6, title: t('namespace') }
        ];

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/lists/${this.props.entity.id}`}
                        backUrl={`/lists/${this.props.entity.id}/edit`}
                        successUrl="/lists"
                        deletingMsg={t('deletingList')}
                        deletedMsg={t('listDeleted')}/>
                }

                <Title>{isEdit ? t('editList') : t('createList')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>

                    {isEdit &&
                        <StaticField id="cid" className={styles.formDisabled} label={t('id')} help={t('thisIsTheListIdDisplayedToTheSubscribers')}>
                            {this.getFormValue('cid')}
                        </StaticField>
                    }

                    <TextArea id="description" label={t('description')}/>

                    <InputField id="contact_email" label={t('contactEmail')} help={t('contactEmailUsedInSubscriptionFormsAnd')}/>
                    <InputField id="homepage" label={t('homepage')} help={t('homepageUrlUsedInSubscriptionFormsAnd')}/>
                    <InputField id="to_name" label={t('recipientsNameTemplate')} help={t('specifyUsingMergeTagsOfThisListHowTo')}/>
                    <TableSelect id="send_configuration" label={t('sendConfiguration')} withHeader dropdown dataUrl='rest/send-configurations-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} help={t('sendConfigurationThatWillBeUsedFor')}/>

                    <NamespaceSelect/>

                    <Dropdown id="form" label={t('forms')} options={formsOptions} help={t('webAndEmailFormsAndTemplatesUsedIn')}/>

                    {this.getFormValue('form') === 'custom' &&
                        <TableSelect id="default_form" label={t('customForms')} withHeader dropdown dataUrl='rest/forms-table' columns={customFormsColumns} selectionLabelIndex={1} help={<Trans i18nKey="theCustomFormUsedForThisListYouCanCreate">The custom form used for this list. You can create a form <a href={`/lists/forms/create/${this.props.entity.id}`}>here</a>.</Trans>}/>
                    }

                    <CheckBox id="public_subscribe" label={t('subscription')} text={t('allowPublicUsersToSubscribeThemselves')}/>

                    <Dropdown id="unsubscription_mode" label={t('unsubscription')} options={unsubcriptionModeOptions} help={t('selectHowAnUnsuscriptionRequestBy')}/>

                    <CheckBox id="listunsubscribe_disabled" label={t('unsubscribeHeader')} text={t('doNotSendListUnsubscribeHeaders')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        {canDelete && <NavButton className="btn-danger" icon="trash-alt" label={t('delete')} linkTo={`/lists/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
