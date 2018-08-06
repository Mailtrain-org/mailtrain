'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../../lib/page';
import {
    AlignedRow,
    Button,
    ButtonRow,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TextArea,
    withForm
} from '../../lib/form';
import {withErrorHandling} from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/modals";
import {getImportTypes} from './helpers';
import styles from "../../lib/styles.scss";
import {ImportType} from '../../../../shared/imports';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        const {importTypeLabels} = getImportTypes(props.t);

        this.importTypeLabels = importTypeLabels;

        this.importTypeOptions = [
            {key: ImportType.CSV_FILE, label: importTypeLabels[ImportType.CSV_FILE]},
            // {key: ImportType.LIST, label: importTypeLabels[ImportType.LIST]}
        ];

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        entity: PropTypes.object
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.settings = data.settings || {};

                if (data.type === ImportType.CSV_FILE) {
                    data.csvFileName = data.settings.csv.originalname;
                    data.csvDelimiter = data.settings.csv.delimiter;
                }
            });

        } else {
            this.populateFormValues({
                name: '',
                description: '',
                type: ImportType.CSV_FILE,
                csvFileName: '',
                csvDelimiter: ','
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const type = Number.parseInt(state.getIn(['type', 'value']));

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        }

        if (!isEdit && type === ImportType.CSV_FILE) {
            if (!this.csvFile || this.csvFile.files.length === 0) {
                state.setIn(['csvFileName', 'error'], t('File must be selected'));
            }

            if (!state.getIn(['csvDelimiter', 'value']).trim()) {
                state.setIn(['csvDelimiter', 'error'], t('CSV delimiter must not be empty'));
            }
        }
    }

    async submitHandler() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/imports/${this.props.list.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `rest/imports/${this.props.list.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                data.type = Number.parseInt(data.type);
                data.settings = {};

                const formData = new FormData();
                if (!isEdit && data.type === ImportType.CSV_FILE) {
                    data.settings.csv = {};
                    formData.append('csvFile', this.csvFile.files[0]);
                    data.settings.csv.delimiter = data.csvDelimiter.trim();

                    delete data.csvFile;
                    delete data.csvDelimiter;
                }

                formData.append('entity', JSON.stringify(data));

                return formData;
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/imports`, 'success', t('Import saved'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            throw error;
        }
    }

    onFileSelected() {
        this.scheduleFormRevalidate();
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        const type = Number.parseInt(this.getFormValue('type'));

        let settings = null;
        if (type === ImportType.CSV_FILE) {
            if (isEdit) {
                settings =
                    <div>
                        <StaticField id="csvFileName" className={styles.formDisabled} label={t('File')}>{this.getFormValue('csvFileName')}</StaticField>
                        <StaticField id="csvDelimiter" className={styles.formDisabled} label={t('Delimiter')}>{this.getFormValue('csvDelimiter')}</StaticField>
                    </div>;
            } else {
                settings =
                    <div>
                        <StaticField withValidation id="csvFileName" label={t('File')}><input ref={node => this.csvFile = node} type="file" onChange={::this.onFileSelected}/></StaticField>
                        <InputField id="csvDelimiter" label={t('Delimiter')}/>
                    </div>;
            }
        }

        return (
            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/imports/${this.props.list.id}/${this.props.entity.id}`}
                        backUrl={`/lists/${this.props.list.id}/imports/${this.props.entity.id}/edit`}
                        successUrl={`/lists/${this.props.list.id}/imports`}
                        deletingMsg={t('Deleting import ...')}
                        deletedMsg={t('Field deleted')}/>
                }

                <Title>{isEdit ? t('Edit Import') : t('Create Import')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    {isEdit ?
                        <StaticField id="type" className={styles.formDisabled} label={t('Type')}>{this.importTypeLabels[this.getFormValue('type')]}</StaticField>
                    :
                        <Dropdown id="type" label={t('Type')} options={this.importTypeOptions}/>
                    }

                    {settings}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/${this.props.list.id}/imports/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}