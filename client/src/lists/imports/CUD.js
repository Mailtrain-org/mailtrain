'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../../lib/page';
import {
    AlignedRow,
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/modals";
import {getImportLabels} from './helpers';
import {ImportSource, inProgress, MappingType, prepInProgress, prepFinished} from '../../../../shared/imports';
import axios from "../../lib/axios";
import {getUrl} from "../../lib/urls";
import listStyles from "../styles.scss";
import styles from "../../lib/styles.scss";
import interoperableErrors from "../../../../shared/interoperable-errors";
import {withComponentMixins} from "../../lib/decorator-helpers";


function truncate(str, len, ending = '...') {
    str = str.trim();

    if (str.length > len) {
        return str.substring(0, len - ending.length) + ending;
    } else {
        return str;
    }
}


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

    getFormValuesMutator(data) {
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
    }

    submitFormValuesMutator(data, isSubmit) {
        const isEdit = !!this.props.entity;

        data.source = Number.parseInt(data.source);
        data.settings = {};

        let formData, csvFileSelected = false;
        if (isSubmit) {
            formData = new FormData();

        }

        if (!isEdit) {
            if (data.source === ImportSource.CSV_FILE) {
                data.settings.csv = {};

                // This test needs to be here because this function is also called by the form change detection mechanism
                if (this.csvFile && this.csvFile.files && this.csvFile.files.length > 0) {
                    if (isSubmit) {
                        formData.append('csvFile', this.csvFile.files[0]);
                    } else {
                        csvFileSelected = true;
                    }
                }

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

        if (isSubmit) {
            formData.append('entity', JSON.stringify(
                filterData(data, ['name', 'description', 'source', 'settings', 'mapping_type', 'mapping'])
            ));

            return formData;

        } else {
            const filteredData = filterData(data, ['name', 'description', 'source', 'settings', 'mapping_type', 'mapping']);
            if (csvFileSelected) {
                filteredData.csvFileSelected = true;
            }

            return filteredData;
        }
    }

    initFromEntity(entity) {
        this.getFormValuesFromEntity(entity);

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
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        }

        if (!isEdit) {
            if (source === ImportSource.CSV_FILE) {
                if (!this.csvFile || this.csvFile.files.length === 0) {
                    state.setIn(['csvFileName', 'error'], t('fileMustBeSelected'));
                }

                if (!state.getIn(['csvDelimiter', 'value']).trim()) {
                    state.setIn(['csvDelimiter', 'error'], t('csvDelimiterMustNotBeEmpty'));
                }
            }
        } else  {
            const mappingType = Number.parseInt(state.getIn(['mapping_type', 'value']));

            if (mappingType === MappingType.BASIC_SUBSCRIBE || mappingType === MappingType.BASIC_UNSUBSCRIBE) {
                if (!state.getIn(['mapping_fields_email_column', 'value'])) {
                    state.setIn(['mapping_fields_email_column', 'error'], t('emailMappingHasToBeProvided'));
                }
            }
        }
    }

    async submitHandler() {
        await this.save();
    }

    @withFormErrorHandlers
    async save(runAfterSave) {
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
            this.setFormStatusMessage('info', t('saving'));

            const submitResponse = await this.validateAndSendFormValuesToURL(sendMethod, url);

            if (submitResponse) {
                if (!isEdit) {
                    this.navigateTo(`/lists/${this.props.list.id}/imports/${submitResponse}/edit`);
                } else {
                    if (runAfterSave) {
                        try {
                            await axios.post(getUrl(`rest/import-start/${this.props.list.id}/${this.props.entity.id}`));
                        } catch (err) {
                            if (err instanceof interoperableErrors.InvalidStateError) {
                                // Just mask the fact that it's not possible to start anything and refresh instead.
                            } else {
                                throw err;
                            }
                        }
                    }

                    this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/imports/${this.props.entity.id}/status`, 'success', t('importSaved'));
                }

            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }
        } catch (error) {
            throw error;
        }
    }

    onFileSelected(evt, x) {
        if (!this.getFormValue('name') && this.csvFile.files.length > 0) {
            this.updateFormValue('name', this.csvFile.files[0].name);
        }

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
                        <StaticField id="csvFileName" className={styles.formDisabled} label={t('file')}>{this.getFormValue('csvFileName')}</StaticField>
                        <StaticField id="csvDelimiter" className={styles.formDisabled} label={t('delimiter')}>{this.getFormValue('csvDelimiter')}</StaticField>
                    </div>;
            } else {
                settingsEdit =
                    <div>
                        <AlignedRow label={t('file')}><input ref={node => this.csvFile = node} type="file" className="form-control-file" onChange={::this.onFileSelected}/></AlignedRow>
                        <InputField id="csvDelimiter" label={t('delimiter')}/>
                    </div>;
            }
        }

        let mappingEdit;
        if (isEdit) {
            if (prepInProgress(status)) {
                mappingEdit = (
                    <div>{t('preparationInProgressPleaseWaitTillItIs')}</div>
                );

            } else {
                let mappingSettings = null;
                const mappingType = Number.parseInt(this.getFormValue('mapping_type'));

                if (mappingType === MappingType.BASIC_SUBSCRIBE || mappingType === MappingType.BASIC_UNSUBSCRIBE) {
                    const sampleRow = this.getFormValue('sampleRow');
                    const sourceOpts = [];
                    sourceOpts.push({key: '', label: t('––Select ––')});
                    if (source === ImportSource.CSV_FILE) {
                        for (const csvCol of settings.csv.columns) {
                            let help = '';
                            if (sampleRow) {
                                help = ' (' + t('eg', {keySeparator: '>', nsSeparator: '|'}) + ' ' + truncate(sampleRow[csvCol.column], 50) + ')';
                            }

                            sourceOpts.push({key: csvCol.column, label: csvCol.name + help});
                        }
                    }

                    const settingsRows = [];
                    const mappingRows = [
                        <Dropdown key="email" id="mapping_fields_email_column" label={t('email')} options={sourceOpts}/>
                    ];

                    if (mappingType === MappingType.BASIC_SUBSCRIBE) {
                        settingsRows.push(<CheckBox key="checkEmails" id="mapping_settings_checkEmails" text={t('checkImportedEmails')}/>)

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
                            <Fieldset label={t('mapping')} className={listStyles.mapping}>
                                {mappingRows}
                            </Fieldset>
                        </div>
                    );
                }

                mappingEdit = (
                    <div>
                        <Dropdown id="mapping_type" label={t('type')} options={this.mappingOptions}/>
                        {mappingSettings}
                    </div>
                );
            }
        }

        const saveButtons = []
        if (!isEdit) {
            saveButtons.push(<Button key="default" type="submit" className="btn-primary" icon="check" label={t('saveAndEditSettings')}/>);
        } else {
            if (prepFinished(status)) {
                saveButtons.push(<Button key="default" type="submit" className="btn-primary" icon="check" label={t('save')}/>);
                saveButtons.push(<Button key="saveAndRun" className="btn-primary" icon="check" label={t('saveAndRun')} onClickAsync={async () => await this.save(true)}/>);
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
                        deletingMsg={t('deletingImport')}
                        deletedMsg={t('importDeleted')}/>
                }

                <Title>{isEdit ? t('editImport') : t('createImport')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>

                    {isEdit ?
                        <StaticField id="source" className={styles.formDisabled} label={t('source')}>{this.importSourceLabels[this.getFormValue('source')]}</StaticField>
                    :
                        <Dropdown id="source" label={t('source')} options={this.importSourceOptions}/>
                    }

                    {settingsEdit}

                    {mappingEdit}


                    <ButtonRow>
                        {saveButtons}
                        {isEdit && <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/lists/${this.props.list.id}/imports/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}