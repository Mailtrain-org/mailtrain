'use strict';

import React from "react";
import {SubscriptionStatus} from "../../../../shared/lists";
import {ACEEditor, CheckBoxGroup, DatePicker, Dropdown, InputField, RadioGroup, TextArea} from "../../lib/form";
import {formatBirthday, formatDate, parseBirthday, parseDate} from "../../../../shared/date";
import {getFieldKey} from '../../../../shared/lists';
import 'brace/mode/json';

export function getSubscriptionStatusLabels(t) {

    const subscriptionStatusLabels = {
        [SubscriptionStatus.SUBSCRIBED]: t('Subscribed'),
        [SubscriptionStatus.UNSUBSCRIBED]: t('Unubscribed'),
        [SubscriptionStatus.BOUNCED]: t('Bounced'),
        [SubscriptionStatus.COMPLAINED]: t('Complained'),
    };

    return subscriptionStatusLabels;
}

export function getFieldTypes(t) {

    const groupedFieldTypes = {};

    const stringFieldType = long => ({
        form: groupedField => long ? <TextArea key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name}/> : <InputField key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name}/>,
        assignFormData: (groupedField, data) => {},
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: true
    });

    const numberFieldType = {
        form: groupedField => <InputField key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name}/>,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldKey(groupedField)];
            data[getFieldKey(groupedField)] = value ? value.toString() : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            data[getFieldKey(groupedField)] = parseInt(data[getFieldKey(groupedField)]);
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldKey(groupedField), 'value']).trim();
            if (value !== '' && isNaN(value)) {
                state.setIn([getFieldKey(groupedField), 'error'], t('Value must be a number'));
            } else {
                state.setIn([getFieldKey(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const dateFieldType = {
        form: groupedField => <DatePicker key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name} dateFormat={groupedField.settings.dateFormat} />,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldKey(groupedField)];
            data[getFieldKey(groupedField)] = value ? formatDate(groupedField.settings.dateFormat, value) : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            const date = parseDate(groupedField.settings.dateFormat, data[getFieldKey(groupedField)]);
            data[getFieldKey(groupedField)] = date;
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldKey(groupedField), 'value']);
            const date = parseDate(groupedField.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldKey(groupedField), 'error'], t('Date is invalid'));
            } else {
                state.setIn([getFieldKey(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const birthdayFieldType = {
        form: groupedField => <DatePicker key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name} dateFormat={groupedField.settings.dateFormat} birthday />,
        assignFormData: (groupedField, data) => {
            const value = data[getFieldKey(groupedField)];
            data[getFieldKey(groupedField)] = value ? formatBirthday(groupedField.settings.dateFormat, value) : '';
        },
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {
            const date = parseBirthday(groupedField.settings.dateFormat, data[getFieldKey(groupedField)]);
            data[getFieldKey(groupedField)] = date;
        },
        validate: (groupedField, state) => {
            const value = state.getIn([getFieldKey(groupedField), 'value']);
            const date = parseBirthday(groupedField.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldKey(groupedField), 'error'], t('Date is invalid'));
            } else {
                state.setIn([getFieldKey(groupedField), 'error'], null);
            }
        },
        indexable: true
    };

    const jsonFieldType = {
        form: groupedField => <ACEEditor key={getFieldKey(groupedField)} id={getFieldKey(groupedField)} label={groupedField.name} mode="json" height="300px"/>,
        assignFormData: (groupedField, data) => {},
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = '';
        },
        assignEntity: (groupedField, data) => {},
        validate: (groupedField, state) => {},
        indexable: false
    };

    const enumSingleFieldType = componentType => ({
        form: groupedField => React.createElement(componentType, { key: getFieldKey(groupedField), id: getFieldKey(groupedField), label: groupedField.name, options: groupedField.settings.options }, null),
        assignFormData: (groupedField, data) => {
            if (data[getFieldKey(groupedField)] === null) {
                if (groupedField.default_value) {
                    data[getFieldKey(groupedField)] = groupedField.default_value;
                } else if (groupedField.settings.options.length > 0) {
                    data[getFieldKey(groupedField)] = groupedField.settings.options[0].key;
                } else {
                    data[getFieldKey(groupedField)] = '';
                }
            }
        },
        initFormData: (groupedField, data) => {
            if (groupedField.default_value) {
                data[getFieldKey(groupedField)] = groupedField.default_value;
            } else if (groupedField.settings.options.length > 0) {
                data[getFieldKey(groupedField)] = groupedField.settings.options[0].key;
            } else {
                data[getFieldKey(groupedField)] = '';
            }
        },
        assignEntity: (groupedField, data) => {
        },
        validate: (groupedField, state) => {},
        indexable: false
    });

    const enumMultipleFieldType = componentType => ({
        form: groupedField => React.createElement(componentType, { key: getFieldKey(groupedField), id: getFieldKey(groupedField), label: groupedField.name, options: groupedField.settings.options }, null),
        assignFormData: (groupedField, data) => {
            if (data[getFieldKey(groupedField)] === null) {
                data[getFieldKey(groupedField)] = [];
            }
        },
        initFormData: (groupedField, data) => {
            data[getFieldKey(groupedField)] = [];
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
    groupedFieldTypes['dropdown-enum'] = enumSingleFieldType(Dropdown);
    groupedFieldTypes['radio-enum'] = enumSingleFieldType(RadioGroup);

    // Here we rely on the fact the model/groupedFields and model/subscriptions preprocess the groupedField info and subscription
    // such that the grouped entries behave the same as the enum entries
    groupedFieldTypes['checkbox-grouped'] = enumMultipleFieldType(CheckBoxGroup);
    groupedFieldTypes['radio-grouped'] = enumSingleFieldType(RadioGroup);
    groupedFieldTypes['dropdown-grouped'] = enumSingleFieldType(Dropdown);

    return groupedFieldTypes;
}