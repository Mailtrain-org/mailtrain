'use strict';

import React from "react";
import {getFieldColumn, SubscriptionStatus} from "../../../../shared/lists";
import {
    ACEEditor,
    CheckBox,
    CheckBoxGroup,
    DatePicker,
    Dropdown,
    InputField,
    RadioGroup,
    TextArea
} from "../../lib/form";
import {formatBirthday, formatDate, parseBirthday, parseDate} from "../../../../shared/date";
import 'ace-builds/src-noconflict/mode-json';

export function getSubscriptionStatusLabels(t) {

    const subscriptionStatusLabels = {
        [SubscriptionStatus.SUBSCRIBED]: t('subscribed'),
        [SubscriptionStatus.UNSUBSCRIBED]: t('unubscribed'),
        [SubscriptionStatus.BOUNCED]: t('bounced'),
        [SubscriptionStatus.COMPLAINED]: t('complained'),
    };

    return subscriptionStatusLabels;
}

export function getFieldTypes(t) {

    const groupedFieldTypes = {};

    const stringFieldType = long => ({
        form: groupedField => long ? <TextArea key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name}/> : <InputField key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name}/>,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = value || '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: true
    });

    const numberFieldType = {
        form: groupedField => <InputField key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name}/>,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = value ? value.toString() : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = parseInt(data[getFieldColumn(groupedField)]);
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldColumn(groupedField), 'value']).trim();
            if (value !== '' && isNaN(value)) {
                state.setIn([getFieldColumn(groupedField), 'error'], t('valueMustBeANumber'));
            } else {
                state.setIn([getFieldColumn(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const dateFieldType = {
        form: groupedField => <DatePicker key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name} dateFormat={groupedField.settings.dateFormat} />,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = value ? formatDate(groupedField.settings.dateFormat, value) : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            const date = parseDate(groupedField.settings.dateFormat, data[getFieldColumn(groupedField)]);
            data[getFieldColumn(groupedField)] = date;
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldColumn(groupedField), 'value']);
            const date = parseDate(groupedField.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldColumn(groupedField), 'error'], t('dateIsInvalid'));
            } else {
                state.setIn([getFieldColumn(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const birthdayFieldType = {
        form: groupedField => <DatePicker key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name} dateFormat={groupedField.settings.dateFormat} birthday />,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = value ? formatBirthday(groupedField.settings.dateFormat, value) : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            const date = parseBirthday(groupedField.settings.dateFormat, data[getFieldColumn(groupedField)]);
            data[getFieldColumn(groupedField)] = date;
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldColumn(groupedField), 'value']);
            const date = parseBirthday(groupedField.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldColumn(groupedField), 'error'], t('dateIsInvalid'));
            } else {
                state.setIn([getFieldColumn(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const jsonFieldType = {
        form: groupedField => <ACEEditor key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} label={groupedField.name} mode="json" height="300px"/>,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = value || '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: false
    };

    const optionFieldType = {
        form: groupedField => <CheckBox key={getFieldColumn(groupedField)} id={getFieldColumn(groupedField)} text={groupedField.settings.checkedLabel} label={groupedField.name}/>,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldColumn(groupedField)];
            data[getFieldColumn(groupedField)] = !!value;
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = false;
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: true
    };

    const enumSingleFieldType = componentType => ({
        form: groupedField => React.createElement(componentType, { key: getFieldColumn(groupedField), id: getFieldColumn(groupedField), label: groupedField.name, options: groupedField.settings.options }, null),
        assignFormData: (groupedField, data) => {
            if (data[getFieldColumn(groupedField)] === null) {
                if (groupedField.default_value) {
                    data[getFieldColumn(groupedField)] = groupedField.default_value;
                } else if (groupedField.settings.options.length > 0) {
                    data[getFieldColumn(groupedField)] = groupedField.settings.options[0].key;
                } else {
                    data[getFieldColumn(groupedField)] = '';
                }
            }
        },
        initFormData: (groupedField, data) => {
            if (groupedField.default_value) {
                data[getFieldColumn(groupedField)] = groupedField.default_value;
            } else if (groupedField.settings.options.length > 0) {
                data[getFieldColumn(groupedField)] = groupedField.settings.options[0].key;
            } else {
                data[getFieldColumn(groupedField)] = '';
            }
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: false
    });

    const enumMultipleFieldType = componentType => ({
        form: groupedField => React.createElement(componentType, { key: getFieldColumn(groupedField), id: getFieldColumn(groupedField), label: groupedField.name, options: groupedField.settings.options }, null),
        assignFormData: (groupedField, data) => {
            if (data[getFieldColumn(groupedField)] === null) {
                data[getFieldColumn(groupedField)] = [];
            }
        },
        initFormData: (groupedField, data) => {
            data[getFieldColumn(groupedField)] = [];
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: false
    });


    groupedFieldTypes.text = stringFieldType(false);
    groupedFieldTypes.website = stringFieldType(false);
    groupedFieldTypes.longtext = stringFieldType(true);
    groupedFieldTypes.gpg = stringFieldType(true);
    groupedFieldTypes.number = numberFieldType;
    groupedFieldTypes.date = dateFieldType;
    groupedFieldTypes.birthday = birthdayFieldType;
    groupedFieldTypes.json = jsonFieldType;
    groupedFieldTypes.option = optionFieldType;
    groupedFieldTypes['dropdown-enum'] = enumSingleFieldType(Dropdown);
    groupedFieldTypes['radio-enum'] = enumSingleFieldType(RadioGroup);

    // Here we rely on the fact the model/groupedFields and model/subscriptions preprocess the groupedField info and subscription
    // such that the grouped entries behave the same as the enum entries
    groupedFieldTypes['checkbox-grouped'] = enumMultipleFieldType(CheckBoxGroup);
    groupedFieldTypes['radio-grouped'] = enumSingleFieldType(RadioGroup);
    groupedFieldTypes['dropdown-grouped'] = enumSingleFieldType(Dropdown);

    return groupedFieldTypes;
}