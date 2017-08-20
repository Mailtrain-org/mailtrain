'use strict';

import React from "react";
import {SubscriptionStatus} from "../../../../shared/lists";
import {ACEEditor, CheckBoxGroup, DatePicker, Dropdown, InputField, RadioGroup, TextArea} from "../../lib/form";
import {formatBirthday, formatDate, parseBirthday, parseDate} from "../../../../shared/date";
import {getFieldKey} from '../../../../shared/lists';

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

    const fieldTypes = {};

    const stringFieldType = long => ({
        form: field => long ? <TextArea key={getFieldKey(field)} id={getFieldKey(field)} label={field.name}/> : <InputField key={getFieldKey(field)} id={getFieldKey(field)} label={field.name}/>,
        assignFormData: (field, data) => {},
        initFormData: (field, data) => {
            data[getFieldKey(field)] = '';
        },
        assignEntity: (field, data) => {},
        validate: (field, state) => {}
    });

    const numberFieldType = {
        form: field => <InputField key={getFieldKey(field)} id={getFieldKey(field)} label={field.name}/>,
        assignFormData: (field, data) => {
            const value = data[getFieldKey(field)];
            data[getFieldKey(field)] = value ? value.toString() : '';
        },
        initFormData: (field, data) => {
            data[getFieldKey(field)] = '';
        },
        assignEntity: (field, data) => {
            data[getFieldKey(field)] = parseInt(data[getFieldKey(field)]);
        },
        validate: (field, state) => {
            const value = state.getIn([getFieldKey(field), 'value']).trim();
            if (value !== '' && isNaN(value)) {
                state.setIn([getFieldKey(field), 'error'], t('Value must be a number'));
            } else {
                state.setIn([getFieldKey(field), 'error'], null);
            }
        }
    };

    const dateFieldType = {
        form: field => <DatePicker key={getFieldKey(field)} id={getFieldKey(field)} label={field.name} dateFormat={field.settings.dateFormat} />,
        assignFormData: (field, data) => {
            const value = data[getFieldKey(field)];
            data[getFieldKey(field)] = value ? formatDate(field.settings.dateFormat, value) : '';
        },
        initFormData: (field, data) => {
            data[getFieldKey(field)] = '';
        },
        assignEntity: (field, data) => {
            const date = parseDate(field.settings.dateFormat, data[getFieldKey(field)]);
            data[getFieldKey(field)] = date;
        },
        validate: (field, state) => {
            const value = state.getIn([getFieldKey(field), 'value']);
            const date = parseDate(field.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldKey(field), 'error'], t('Date is invalid'));
            } else {
                state.setIn([getFieldKey(field), 'error'], null);
            }
        }
    };

    const birthdayFieldType = {
        form: field => <DatePicker key={getFieldKey(field)} id={getFieldKey(field)} label={field.name} dateFormat={field.settings.dateFormat} birthday />,
        assignFormData: (field, data) => {
            const value = data[getFieldKey(field)];
            data[getFieldKey(field)] = value ? formatBirthday(field.settings.dateFormat, value) : '';
        },
        initFormData: (field, data) => {
            data[getFieldKey(field)] = '';
        },
        assignEntity: (field, data) => {
            const date = parseBirthday(field.settings.dateFormat, data[getFieldKey(field)]);
            data[getFieldKey(field)] = date;
        },
        validate: (field, state) => {
            const value = state.getIn([getFieldKey(field), 'value']);
            const date = parseBirthday(field.settings.dateFormat, value);
            if (value !== '' && !date) {
                state.setIn([getFieldKey(field), 'error'], t('Date is invalid'));
            } else {
                state.setIn([getFieldKey(field), 'error'], null);
            }
        }
    };

    const jsonFieldType = {
        form: field => <ACEEditor key={getFieldKey(field)} id={getFieldKey(field)} label={field.name} mode="json" height="300px"/>,
        assignFormData: (field, data) => {},
        initFormData: (field, data) => {
            data[getFieldKey(field)] = '';
        },
        assignEntity: (field, data) => {},
        validate: (field, state) => {}
    };

    const enumSingleFieldType = componentType => ({
        form: field => React.createElement(componentType, { key: getFieldKey(field), id: getFieldKey(field), label: field.name, options: field.settings.options }, null),
        assignFormData: (field, data) => {
            if (data[getFieldKey(field)] === null) {
                if (field.default_value) {
                    data[getFieldKey(field)] = field.default_value;
                } else if (field.settings.options.length > 0) {
                    data[getFieldKey(field)] = field.settings.options[0].key;
                } else {
                    data[getFieldKey(field)] = '';
                }
            }
        },
        initFormData: (field, data) => {
            if (field.default_value) {
                data[getFieldKey(field)] = field.default_value;
            } else if (field.settings.options.length > 0) {
                data[getFieldKey(field)] = field.settings.options[0].key;
            } else {
                data[getFieldKey(field)] = '';
            }
        },
        assignEntity: (field, data) => {
        },
        validate: (field, state) => {}
    });

    const enumMultipleFieldType = componentType => ({
        form: field => React.createElement(componentType, { key: getFieldKey(field), id: getFieldKey(field), label: field.name, options: field.settings.options }, null),
        assignFormData: (field, data) => {
            if (data[getFieldKey(field)] === null) {
                data[getFieldKey(field)] = [];
            }
        },
        initFormData: (field, data) => {
            data[getFieldKey(field)] = [];
        },
        assignEntity: (field, data) => {},
        validate: (field, state) => {}
    });


    fieldTypes.text = stringFieldType(false);
    fieldTypes.website = stringFieldType(false);
    fieldTypes.longtext = stringFieldType(true);
    fieldTypes.gpg = stringFieldType(true);
    fieldTypes.number = numberFieldType;
    fieldTypes.date = dateFieldType;
    fieldTypes.birthday = birthdayFieldType;
    fieldTypes.json = jsonFieldType;
    fieldTypes['dropdown-enum'] = enumSingleFieldType(Dropdown);
    fieldTypes['radio-enum'] = enumSingleFieldType(RadioGroup);

    // Here we rely on the fact the model/fields and model/subscriptions preprocess the field info and subscription
    // such that the grouped entries behave the same as the enum entries
    fieldTypes['checkbox-grouped'] = enumMultipleFieldType(CheckBoxGroup);
    fieldTypes['radio-grouped'] = enumSingleFieldType(RadioGroup);
    fieldTypes['dropdown-grouped'] = enumSingleFieldType(Dropdown);

    return fieldTypes;
}