'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, TextArea, TableSelect, ButtonRow, Button,
    Fieldset, Dropdown, AlignedRow, ACEEditor, StaticField
} from '../../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/modals";
import { getFieldTypes } from './helpers';
import interoperableErrors from '../../../../shared/interoperable-errors';
import validators from '../../../../shared/validators';
import slugify from 'slugify';
import { parseDate, parseBirthday, DateFormat } from '../../../../shared/date';
import styles from "../../lib/styles.scss";

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.fieldTypes = getFieldTypes(props.t);

        this.initForm({
            serverValidation: {
                url: `/rest/fields-validate/${this.props.list.id}`,
                changed: ['key'],
                extra: ['id']
            },
            onChange: {
                name: ::this.onChangeName
            }
        });
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fields: PropTypes.array,
        entity: PropTypes.object
    }

    onChangeName(state, attr, oldValue, newValue) {
        const oldComputedKey = ('MERGE_' + slugify(oldValue, '_')).toUpperCase().replace(/[^A-Z0-9_]/g, '');
        const oldKey = state.formState.getIn(['data', 'key', 'value']);

        if (oldKey === '' || oldKey === oldComputedKey) {
            const newKey = ('MERGE_' + slugify(newValue, '_')).toUpperCase().replace(/[^A-Z0-9_]/g, '');
            state.formState = state.formState.setIn(['data', 'key', 'value'], newKey);
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.settings = data.settings || {};

                if (data.default_value === null) {
                    data.default_value = '';
                }

                if (data.type !== 'option') {
                    data.group = null;
                }

                data.enumOptions = '';
                data.dateFormat = DateFormat.EUR;
                data.renderTemplate = '';

                switch (data.type) {
                    case 'checkbox-grouped':
                    case 'radio-grouped':
                    case 'dropdown-grouped':
                    case 'json':
                        data.renderTemplate = data.settings.renderTemplate;
                        break;

                    case 'radio-enum':
                    case 'dropdown-enum':
                        data.enumOptions = this.renderEnumOptions(data.settings.options);
                        data.renderTemplate = data.settings.renderTemplate;
                        break;

                    case 'date':
                    case 'birthday':
                        data.dateFormat = data.settings.dateFormat;
                        break;
                }

                data.orderListBefore = data.orderListBefore.toString();
                data.orderSubscribeBefore = data.orderSubscribeBefore.toString();
                data.orderManageBefore = data.orderManageBefore.toString();
            });

        } else {
            this.populateFormValues({
                name: '',
                type: 'text',
                key: '',
                default_value: '',
                group: null,
                renderTemplate: '',
                enumOptions: '',
                dateFormat: 'eur',
                orderListBefore: 'end', // possible values are <numeric id> / 'end' / 'none'
                orderSubscribeBefore: 'end',
                orderManageBefore: 'end',
                orderListOptions: [],
                orderSubscribeOptions: [],
                orderManageOptions: []
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

        const type = state.getIn(['type', 'value']);

        const group = state.getIn(['group', 'value']);
        if (type === 'option' && !group) {
            state.setIn(['group', 'error'], t('Group has to be selected'));
        } else {
            state.setIn(['group', 'error'], null);
        }

        const defaultValue = state.getIn(['default_value', 'value']);
        if (defaultValue === '') {
            state.setIn(['default_value', 'error'], null);
        } else if (type === 'number' && !/^[0-9]*$/.test(defaultValue.trim())) {
            state.setIn(['default_value', 'error'], t('Default value is not integer number'));
        } else if (type === 'date' && !parseDate(state.getIn(['dateFormat', 'value']), defaultValue)) {
            state.setIn(['default_value', 'error'], t('Default value is not a properly formatted date'));
        } else if (type === 'birthday' && !parseBirthday(state.getIn(['dateFormat', 'value']), defaultValue)) {
            state.setIn(['default_value', 'error'], t('Default value is not a properly formatted birthday date'));
        } else {
            state.setIn(['default_value', 'error'], null);
        }

        if (type === 'radio-enum' || type === 'dropdown-enum') {
            const enumOptions = this.parseEnumOptions(state.getIn(['enumOptions', 'value']));
            if (enumOptions.errors) {
                state.setIn(['enumOptions', 'error'], <div>{enumOptions.errors.map((err, idx) => <div key={idx}>{err}</div>)}</div>);
            } else {
                state.setIn(['enumOptions', 'error'], null);

                if (defaultValue !== '' && !(enumOptions.options.find(x => x.key === defaultValue))) {
                    state.setIn(['default_value', 'error'], t('Default value is not one of the allowed options'));
                }
            }
        } else {
            state.setIn(['enumOptions', 'error'], null);
        }
    }

    parseEnumOptions(text) {
        const t = this.props.t;
        const errors = [];
        const options = [];

        const lines = text.split('\n');
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const line = lines[lineIdx].trim();

            if (line != '') {
                const matches = line.match(/^([^|]*)[|](.*)$/);
                if (matches) {
                    const key = matches[1].trim();
                    const label = matches[2].trim();
                    options.push({ key, label });
                } else {
                    errors.push(t('Errror on line {{ line }}', { line: lineIdx + 1}));
                }
            }
        }

        if (errors.length) {
            return {
                errors
            };
        } else {
            return {
                options
            };
        }
    }

    renderEnumOptions(options) {
        return options.map(opt => `${opt.key}|${opt.label}`).join('\n');
    }


    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/fields/${this.props.list.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `/rest/fields/${this.props.list.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                if (data.default_value.trim() === '') {
                    data.default_value = null;
                }

                if (data.type !== 'option') {
                    data.group = null;
                }

                data.settings = {};
                switch (data.type) {
                    case 'checkbox-grouped':
                    case 'radio-grouped':
                    case 'dropdown-grouped':
                    case 'json':
                        data.settings.renderTemplate = data.renderTemplate;
                        break;

                    case 'radio-enum':
                    case 'dropdown-enum':
                        data.settings.options = this.parseEnumOptions(data.enumOptions).options;
                        data.settings.renderTemplate = data.renderTemplate;
                        break;

                    case 'date':
                    case 'birthday':
                        data.settings.dateFormat = data.dateFormat;
                        break;
                }

                delete data.renderTemplate;
                delete data.enumOptions;
                delete data.dateFormat;

                if (data.type === 'option') {
                    data.orderListBefore = data.orderSubscribeBefore = data.orderManageBefore = 'none';
                } else {
                    data.orderListBefore = Number.parseInt(data.orderListBefore) || data.orderListBefore;
                    data.orderSubscribeBefore = Number.parseInt(data.orderSubscribeBefore) || data.orderSubscribeBefore;
                    data.orderManageBefore = Number.parseInt(data.orderManageBefore) || data.orderManageBefore;
                }
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/fields`, 'success', t('Field saved'));
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
        const isEdit = !!this.props.entity;


        const getOrderOptions = fld => {
            return [
                {key: 'none', label: t('Not visible')},
                ...this.props.fields.filter(x => (!this.props.entity || x.id !== this.props.entity.id) && x[fld] !== null && x.type !== 'option').sort((x, y) => x[fld] - y[fld]).map(x => ({ key: x.id.toString(), label: `${x.name} (${this.fieldTypes[x.type].label})`})),
                {key: 'end', label: t('End of list')}
            ];
        };


        const typeOptions = Object.keys(this.fieldTypes).map(key => ({key, label: this.fieldTypes[key].label}));

        const type = this.getFormValue('type');

        let fieldSettings = null;
        switch (type) {
            case 'text':
            case 'website':
            case 'longtext':
            case 'gpg':
            case 'number':
                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <InputField id="default_value" label={t('Default value')} help={t('Default value used when the field is empty.')}/>
                    </Fieldset>;
                break;

            case 'checkbox-grouped':
            case 'radio-grouped':
            case 'dropdown-grouped':
                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <ACEEditor
                            id="renderTemplate"
                            label={t('Template')}
                            height="250px"
                            mode="handlebars"
                            help={<Trans>You can control the appearance of the merge tag with this template. The template
                                uses handlebars syntax and you can find all values from <code>{'{{values}}'}</code> array, for
                                example <code>{'{{#each values}} {{this}} {{/each}}'}</code>. If template is not defined then
                                multiple values are joined with commas.</Trans>}
                        />
                    </Fieldset>;
                break;

            case 'radio-enum':
            case 'dropdown-enum':
                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <ACEEditor
                            id="enumOptions"
                            label={t('Options')}
                            height="250px"
                            mode="text"
                            help={<Trans><div>Specify the options to select from in the following format:<code>key|label</code>. For example:</div>
                                <div><code>au|Australia</code></div><div><code>at|Austria</code></div></Trans>}
                        />
                        <InputField id="default_value" label={t('Default value')} help={<Trans>Default key (e.g. <code>au</code> used when the field is empty.')</Trans>}/>
                        <ACEEditor
                            id="renderTemplate"
                            label={t('Template')}
                            height="250px"
                            mode="handlebars"
                            help={<Trans>You can control the appearance of the merge tag with this template. The template
                                uses handlebars syntax and you can find all values from <code>{'{{values}}'}</code> array.
                                Each entry in the array is an object with attributes <code>key</code> and <code>label</code>.
                                For example <code>{'{{#each values}} {{this.value}} {{/each}}'}</code>. If template is not defined then
                                multiple values are joined with commas.</Trans>}
                        />
                    </Fieldset>;
                break;

            case 'date':
                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <Dropdown id="dateFormat" label={t('Date format')}
                            options={[
                                {key: DateFormat.US, label: t('MM/DD/YYYY')},
                                {key: DateFormat.EU, label: t('DD/MM/YYYY')}
                            ]}
                        />
                        <InputField id="default_value" label={t('Default value')} help={<Trans>Default value used when the field is empty.</Trans>}/>
                    </Fieldset>;
                break;

            case 'birthday':
                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <Dropdown id="dateFormat" label={t('Date format')}
                            options={[
                                {key: DateFormat.US, label: t('MM/DD')},
                                {key: DateFormat.EU, label: t('DD/MM')}
                            ]}
                        />
                        <InputField id="default_value" label={t('Default value')} help={<Trans>Default value used when the field is empty.</Trans>}/>
                    </Fieldset>;
                break;

            case 'json':
                fieldSettings = <Fieldset label={t('Field settings')}>
                        <InputField id="default_value" label={t('Default value')} help={<Trans>Default key (e.g. <code>au</code> used when the field is empty.')</Trans>}/>
                        <ACEEditor
                            id="renderTemplate"
                            label={t('Template')}
                            height="250px"
                            mode="json"
                            help={<Trans>You can use this template to render JSON values (if the JSON is an array then the array is
                                exposed as <code>values</code>, otherwise you can access the JSON keys directly).</Trans>}
                        />
                    </Fieldset>;
                break;

            case 'option':
                const fieldsGroupedColumns = [
                    { data: 4, title: "#" },
                    { data: 1, title: t('Name') },
                    { data: 2, title: t('Type'), render: data => this.fieldTypes[data].label, sortable: false, searchable: false },
                    { data: 3, title: t('Merge Tag') }
                ];

                fieldSettings =
                    <Fieldset label={t('Field settings')}>
                        <TableSelect id="group" label={t('Group')} withHeader dropdown dataUrl={`/rest/fields-grouped-table/${this.props.list.id}`} columns={fieldsGroupedColumns} selectionLabelIndex={1} help={t('Select group to which the options should belong.')}/>
                        <InputField id="default_value" label={t('Default value')} help={t('Default value used when the field is empty.')}/>
                    </Fieldset>;
                break;
        }


        return (
            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/fields/${this.props.list.id}/${this.props.entity.id}`}
                        cudUrl={`/lists/${this.props.list.id}/fields/${this.props.entity.id}/edit`}
                        listUrl={`/lists/${this.props.list.id}/fields`}
                        deletingMsg={t('Deleting field ...')}
                        deletedMsg={t('Field deleted')}/>
                }

                <Title>{isEdit ? t('Edit Field') : t('Create Field')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>

                    {isEdit ?
                        <StaticField id="type" className={styles.formDisabled} label={t('Type')}>{(this.fieldTypes[this.getFormValue('type')] || {}).label}</StaticField>
                    :
                        <Dropdown id="type" label={t('Type')} options={typeOptions}/>
                    }

                    <InputField id="key" label={t('Merge tag')}/>

                    {fieldSettings}

                    {type !== 'option' &&
                        <Fieldset label={t('Field order')}>
                            <Dropdown id="orderListBefore" label={t('Listings (before)')} options={getOrderOptions('order_list')} help={t('Select the field before which this field should appeara in listings. To exclude the field from listings, select "Not visible".')}/>
                            <Dropdown id="orderSubscribeBefore" label={t('Subscription form (before)')} options={getOrderOptions('order_subscribe')} help={t('Select the field before which this field should appear in new subscription form. To exclude the field from the new subscription form, select "Not visible".')}/>
                            <Dropdown id="orderManageBefore" label={t('Management form (before)')} options={getOrderOptions('order_manage')} help={t('Select the field before which this field should appear in subscription management. To exclude the field from the subscription management form, select "Not visible".')}/>
                        </Fieldset>
                    }

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/${this.props.list.id}/fields/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}