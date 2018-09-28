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
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Fieldset,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TextArea,
    withForm
} from '../../lib/form';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/modals";
import {getImportLabels} from './helpers';
import {
    ImportSource,
    inProgress,
    MappingType,
    prepInProgress,
    runInProgress
} from '../../../../shared/imports';
import axios from "../../lib/axios";
import {getUrl} from "../../lib/urls";
import styles from "../styles.scss";


function truncate(str, len, ending = '...') {
    str = str.trim();

    if (str.length > len) {
        return str.substring(0, len - ending.length) + ending;
    } else {
        return str;
    }
}


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        const {importSourceLabels, mappingTypeLabels} = getImportLabels(props.t);

        this.importSourceLabels = importSourceLabels;

        this.importSourceOptions = [
            {key: ImportSource.CSV_FILE, label: importSourceLabels[ImportSource.CSV_FILE]},
            // {key: ImportSource.LIST, label: importSourceLabels[ImportSource.LIST]}
        ];

        this.mappingOptions = [
            {key: MappingType.BASIC_SUBSCRIBE, label: mappingTypeLabels[MappingType.BASIC_SUBSCRIBE]},
            {key: MappingType.BASIC_UNSUBSCRIBE, label: mappingTypeLabels[MappingType.BASIC_UNSUBSCRIBE]},
        ];

        this.refreshTimeoutHandler = ::this.refreshEntity;
        this.refreshTimeoutId = 0;

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fieldsGrouped: PropTypes.array,
        entity: PropTypes.object
    }

    initFromEntity(entity) {
        this.getFormValuesFromEntity(entity, data => {
            data.settings = data.settings || {};
            const mapping = data.mapping || {};

            if (data.source === ImportSource.CSV_FILE) {
                data.csvFileName = data.settings.csv.originalname;
                data.csvDelimiter = data.settings.csv.delimiter;
            }

            const mappingSettings = mapping.settings || {};
            data.mapping_settings_checkEmails = 'checkEmails' in mappingSettings ? !!mappingSettings.checkEmails : true;

            const mappingFlds = mapping.fields || {};
            for (const field of this.props.fieldsGrouped) {
                if (field.column) {
                    const colMapping = mappingFlds[field.column] || {};
                    data['mapping_fields_' + field.column + '_column'] = colMapping.column || '';
                } else {
                    for (const option of field.settings.options) {
                        const col = field.groupedOptions[option.key].column;
                        const colMapping = mappingFlds[col] || {};
                        data['mapping_fields_' + col + '_column'] = colMapping.column || '';
                    }
                }
            }

            const emailMapping = mappingFlds.email || {};
            data.mapping_fields_email_column = emailMapping.column || '';
        });

        if (inProgress(entity.status)) {
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 1000);
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.initFromEntity(this.props.entity);
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                source: ImportSource.CSV_FILE,
                csvFileName: '',
                csvDelimiter: ',',
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        const resp = await axios.get(getUrl(`rest/imports/${this.props.list.id}/${this.props.entity.id}`));
        this.initFromEntity(resp.data);
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const source = Number.parseInt(state.getIn(['source', 'value']));

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        }

        if (!isEdit) {
            if (source === ImportSource.CSV_FILE) {
                if (!this.csvFile || this.csvFile.files.length === 0) {
                    state.setIn(['csvFileName', 'error'], t('File must be selected'));
                }

                if (!state.getIn(['csvDelimiter', 'value']).trim()) {
                    state.setIn(['csvDelimiter', 'error'], t('CSV delimiter must not be empty'));
                }
            }
        } else  {
            const mappingType = Number.parseInt(state.getIn(['mapping_type', 'value']));

            if (mappingType === MappingType.BASIC_SUBSCRIBE || mappingType === MappingType.BASIC_UNSUBSCRIBE) {
                if (!state.getIn(['mapping_fields_email_column', 'value'])) {
                    state.setIn(['mapping_fields_email_column', 'error'], t('Email mapping has to be provided'));
                }
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

            const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                data.source = Number.parseInt(data.source);
                data.settings = {};

                const formData = new FormData();
                if (!isEdit) {
                    if (data.source === ImportSource.CSV_FILE) {
                        data.settings.csv = {};
                        formData.append('csvFile', this.csvFile.files[0]);
                        data.settings.csv.delimiter = data.csvDelimiter.trim();
                    }

                } else {
                    data.mapping_type = Number.parseInt(data.mapping_type);
                    const mapping = {
                        fields: {},
                        settings: {}
                    };

                    if (data.mapping_type === MappingType.BASIC_SUBSCRIBE) {
                        mapping.settings.checkEmails = data.mapping_settings_checkEmails;

                        for (const field of this.props.fieldsGrouped) {
                            if (field.column) {
                                const colMapping = data['mapping_fields_' + field.column + '_column'];
                                if (colMapping) {
                                    mapping.fields[field.column] = {
                                        column: colMapping
                                    };
                                }
                            } else {
                                for (const option of field.settings.options) {
                                    const col = field.groupedOptions[option.key].column;
                                    const colMapping = data['mapping_fields_' + col + '_column'];
                                    if (colMapping) {
                                        mapping.fields[col] = {
                                            column: colMapping
                                        };
                                    }
                                }
                            }
                        }
                    }

                    if (data.mapping_type === MappingType.BASIC_SUBSCRIBE || data.mapping_type === MappingType.BASIC_UNSUBSCRIBE) {
                        mapping.fields.email = {
                            column: data.mapping_fields_email_column
                        };
                    }


                    data.mapping = mapping;
                }

                for (const key in data) {
                    if (key.startsWith('mapping_fields') || key.startsWith('mapping_settings')) {
                        delete data[key];
                    }
                }

                delete data.csvFile;
                delete data.csvDelimiter;
                delete data.sampleRow;

                formData.append('entity', JSON.stringify(data));

                return formData;
            });

            if (submitResponse) {
                if (!isEdit) {
                    this.navigateTo(`/lists/${this.props.list.id}/imports/${submitResponse}/edit`);
                } else {
                    this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/imports/${this.props.entity.id}/status`, 'success', t('Import saved'));
                }

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

        const source = Number.parseInt(this.getFormValue('source'));
        const status = this.getFormValue('status');
        const settings = this.getFormValue('settings');

        let settingsEdit = null;
        if (source === ImportSource.CSV_FILE) {
            if (isEdit) {
                settingsEdit =
                    <div>
                        <StaticField id="csvFileName" className={styles.formDisabled} label={t('File')}>{this.getFormValue('csvFileName')}</StaticField>
                        <StaticField id="csvDelimiter" className={styles.formDisabled} label={t('Delimiter')}>{this.getFormValue('csvDelimiter')}</StaticField>
                    </div>;
            } else {
                settingsEdit =
                    <div>
                        <StaticField withValidation id="csvFileName" label={t('File')}><input ref={node => this.csvFile = node} type="file" onChange={::this.onFileSelected}/></StaticField>
                        <InputField id="csvDelimiter" label={t('Delimiter')}/>
                    </div>;
            }
        }

        let mappingEdit;
        if (isEdit) {
            if (prepInProgress(status)) {
                mappingEdit = (
                    <div>{t('Preparation in progress. Please wait till it is done or visit this page later.')}</div>
                );

            } else {
                let mappingSettings = null;
                const mappingType = Number.parseInt(this.getFormValue('mapping_type'));

                if (mappingType === MappingType.BASIC_SUBSCRIBE || mappingType === MappingType.BASIC_UNSUBSCRIBE) {
                    const sampleRow = this.getFormValue('sampleRow');
                    const sourceOpts = [];
                    sourceOpts.push({key: '', label: t('–– Select ––')});
                    if (source === ImportSource.CSV_FILE) {
                        for (const csvCol of settings.csv.columns) {
                            let help = '';
                            if (sampleRow) {
                                help = ' (' + t('e.g.:', {keySeparator: '>', nsSeparator: '|'}) + ' ' + truncate(sampleRow[csvCol.column], 50) + ')';
                            }

                            sourceOpts.push({key: csvCol.column, label: csvCol.name + help});
                        }
                    }

                    const settingsRows = [];
                    const mappingRows = [
                        <Dropdown key="email" id="mapping_fields_email_column" label={t('Email')} options={sourceOpts}/>
                    ];

                    if (mappingType === MappingType.BASIC_SUBSCRIBE) {
                        settingsRows.push(<CheckBox key="checkEmails" id="mapping_settings_checkEmails" text={t('Check imported emails')}/>)

                        for (const field of this.props.fieldsGrouped) {
                            if (field.column) {
                                mappingRows.push(
                                    <Dropdown key={field.column} id={'mapping_fields_' + field.column + '_column'} label={field.name} options={sourceOpts}/>
                                );
                            } else {
                                for (const option of field.settings.options) {
                                    const col = field.groupedOptions[option.key].column;
                                    mappingRows.push(
                                        <Dropdown key={col} id={'mapping_fields_' + col + '_column'} label={field.groupedOptions[option.key].name} options={sourceOpts}/>
                                    );
                                }
                            }
                        }
                    }

                    mappingSettings = (
                        <div>
                            {settingsRows}
                            <Fieldset label={t('Mapping')} className={styles.mapping}>
                                {mappingRows}
                            </Fieldset>
                        </div>
                    );
                }

                mappingEdit = (
                    <div>
                        <Dropdown id="mapping_type" label={t('Type')} options={this.mappingOptions}/>
                        {mappingSettings}
                    </div>
                );
            }
        }

        let saveButtonLabel;
        if (!isEdit) {
            saveButtonLabel = t('Save and edit settings');
        } else {
            saveButtonLabel = t('Save');
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
                        deletedMsg={t('Import deleted')}/>
                }

                <Title>{isEdit ? t('Edit Import') : t('Create Import')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    {isEdit ?
                        <StaticField id="source" className={styles.formDisabled} label={t('Source')}>{this.importSourceLabels[this.getFormValue('source')]}</StaticField>
                    :
                        <Dropdown id="source" label={t('Source')} options={this.importSourceOptions}/>
                    }

                    {settingsEdit}

                    {mappingEdit}


                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={saveButtonLabel}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/${this.props.list.id}/imports/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}