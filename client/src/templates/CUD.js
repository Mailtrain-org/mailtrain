'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../lib/page'
import {
    withForm,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    Dropdown,
    ACEEditor,
    ButtonRow,
    Button,
    AlignedRow,
    StaticField
} from '../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { validateNamespace, NamespaceSelect } from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import { getTemplateTypes } from './helpers';
import {ActionLink} from "../lib/bootstrap-components";
import axios from '../lib/axios';
import styles from "../lib/styles.scss";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t);

        this.state = {
            showMergeTagReference: false
        };

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL(`/rest/templates/${this.props.entity.id}`);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: mailtrainConfig.user.namespace,
                type: mailtrainConfig.editors[0],
                text: '',
                html: ''
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

        if (!state.getIn(['type', 'value'])) {
            state.setIn(['type', 'error'], t('Type must be selected'));
        } else {
            state.setIn(['type', 'error'], null);
        }

        validateNamespace(t, state);
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
        });

        if (submitResponse) {
            if (this.props.entity) {
                this.navigateToWithFlashMessage('/templates', 'success', t('Template saved'));
            } else {
                this.navigateToWithFlashMessage(`/templates/${submitResponse}/edit`, 'success', t('Template saved'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    async extractPlainText() {
        const html = this.getFormValue('html');
        if (!html) {
            alert('Missing HTML content');
            return;
        }

        if (this.isFormDisabled()) {
            return;
        }

        this.disableForm();

        const response = await axios.post('/rest/html-to-text', { html });

        this.updateFormValue('text', response.data.text);

        this.enableForm();
    }

    async toggleMergeTagReference() {
        this.setState({
            showMergeTagReference: !this.state.showMergeTagReference
        });
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        const typeOptions = [];
        for (const key of mailtrainConfig.editors) {
            typeOptions.push({key, label: this.templateTypes[key].typeName});
        }

        // TODO: Toggle HTML preview

        const typeKey = this.getFormValue('type');

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/templates/${this.props.entity.id}`}
                        cudUrl={`/templates/${this.props.entity.id}/edit`}
                        listUrl="/templates"
                        deletingMsg={t('Deleting template ...')}
                        deletedMsg={t('Template deleted')}/>
                }

                <Title>{isEdit ? t('Edit Template') : t('Create Template')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>

                    {isEdit
                    ?
                        <StaticField id="type" className={styles.formDisabled} label={t('Type')}>
                            {typeKey && this.templateTypes[typeKey].typeName}
                        </StaticField>
                    :
                        <Dropdown id="type" label={t('Type')} options={typeOptions}/>
                    }


                    <NamespaceSelect/>

                    <AlignedRow>
                        <Button className="btn-default" onClickAsync={::this.toggleMergeTagReference} label={t('Merge tag reference')}/>
                        {this.state.showMergeTagReference &&
                        <div style={{marginTop: '15px'}}>
                            <Trans><p>Merge tags are tags that are replaced before sending out the message. The format of the merge tag is the following: <code>[TAG_NAME]</code> or <code>[TAG_NAME/fallback]</code> where <code>fallback</code> is an optional text value used when <code>TAG_NAME</code> is empty.</p></Trans>
                            <table className="table table-bordered table-condensed table-striped">
                                <thead>
                                <tr>
                                    <th>
                                        <Trans>Merge tag</Trans>
                                    </th>
                                    <th>
                                        <Trans>Description</Trans>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <th scope="row">
                                        [LINK_UNSUBSCRIBE]
                                    </th>
                                    <td>
                                        <Trans>URL that points to the unsubscribe page</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [LINK_PREFERENCES]
                                    </th>
                                    <td>
                                        <Trans>URL that points to the preferences page of the subscriber</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [LINK_BROWSER]
                                    </th>
                                    <td>
                                        <Trans>URL to preview the message in a browser</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [EMAIL]
                                    </th>
                                    <td>
                                        <Trans>Email address</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [FIRST_NAME]
                                    </th>
                                    <td>
                                        <Trans>First name</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [LAST_NAME]
                                    </th>
                                    <td>
                                        <Trans>Last name</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [FULL_NAME]
                                    </th>
                                    <td>
                                        <Trans>Full name (first and last name combined)</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [SUBSCRIPTION_ID]
                                    </th>
                                    <td>
                                        <Trans>Unique ID that identifies the recipient</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [LIST_ID]
                                    </th>
                                    <td>
                                        <Trans>Unique ID that identifies the list used for this campaign</Trans>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        [CAMPAIGN_ID]
                                    </th>
                                    <td>
                                        <Trans>Unique ID that identifies current campaign</Trans>
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                            <Trans><p>In addition to that any custom field can have its own merge tag.</p></Trans>
                        </div>}
                    </AlignedRow>

                    <ACEEditor id="text" height="400px" mode="text" label={t('Template content (plain text)')} help={<Trans>To extract the text from HTML click <ActionLink onClickAsync={::this.extractPlainText}>here</ActionLink>. Please note that your existing plaintext in the field above will be overwritten. This feature uses the <a href="http://premailer.dialect.ca/api">Premailer API</a>, a third party service. Their Terms of Service and Privacy Policy apply.</Trans>}/>

                    {isEdit && typeKey && this.templateTypes[typeKey].form}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={isEdit ? t('Save') : t('Save and edit template')}/>
                        {canDelete && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/templates/${this.props.entity.id}/delete`}/> }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
