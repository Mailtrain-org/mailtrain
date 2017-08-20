'use strict';

import React from 'react';
import {DatePicker, Dropdown, InputField} from "../../lib/form";
import { parseDate, parseBirthday, formatDate, formatBirthday, DateFormat, birthdayYear, getDateFormatString, getBirthdayFormatString } from '../../../../shared/date';


export function getRuleHelpers(t, fields) {

    const ruleHelpers = {};

    ruleHelpers.compositeRuleTypes = {
        all: {
            dropdownLabel: t('All rules must match'),
            treeLabel: rule => t('All rules must match')
        },
        some: {
            dropdownLabel: t('At least one rule must match'),
            treeLabel: rule => t('At least one rule must match')
        },
        none: {
            dropdownLabel: t('No rule may match'),
            treeLabel: rule => t('No rule may match')
        }
    };

    ruleHelpers.primitiveRuleTypes = {};

    ruleHelpers.primitiveRuleTypes.text = {
        eq: {
            dropdownLabel: t('Equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('Match (with SQL LIKE)'),
            treeLabel: rule => t('Value in column "{{colName}}" matches (with SQL LIKE) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('Match (with regular expressions)'),
            treeLabel: rule => t('Value in column "{{colName}}" matches (with regular expressions) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('Alphabetically before'),
            treeLabel: rule => t('Value in column "{{colName}}" is alphabetically before "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('Alphabetically before or equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is alphabetically before or equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('Alphabetically after'),
            treeLabel: rule => t('Value in column "{{colName}}" is alphabetically after "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('Alphabetically after or equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is alphabetically after or equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    ruleHelpers.primitiveRuleTypes.website = {
        eq: {
            dropdownLabel: t('Equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('Match (with SQL LIKE)'),
            treeLabel: rule => t('Value in column "{{colName}}" matches (with SQL LIKE) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('Match (with regular expressions)'),
            treeLabel: rule => t('Value in column "{{colName}}" matches (with regular expressions) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    ruleHelpers.primitiveRuleTypes.number = {
        eq: {
            dropdownLabel: t('Equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is equal to {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('Less than'),
            treeLabel: rule => t('Value in column "{{colName}}" is less than {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('Less than or equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is less than or equal to {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('Greater than'),
            treeLabel: rule => t('Value in column "{{colName}}" is greater than {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('Greater than or equal to'),
            treeLabel: rule => t('Value in column "{{colName}}" is greater than or equal to {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    // TODO: This generates strings that cannot be statically detected. It will require dynamic discovery of translatable strings.
    function getRelativeDateTreeLabel(rule, textFragment) {
        if (rule.value === 0) {
            return t('Date in column "{{colName}}" ' + textFragment + ' the current date', {colName: ruleHelpers.getColumnName(rule.column)})
        } else if (rule.value > 0) {
            return t('Date in column "{{colName}}" ' + textFragment + ' {{value}}-th day after the current date', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value});
        } else {
            return t('Date in column "{{colName}}" ' + textFragment + ' {{value}}-th day before the current date', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value});
        }
    }

    ruleHelpers.primitiveRuleTypes.date = {
        eq: {
            dropdownLabel: t('On'),
            treeLabel: rule => t('Date in column "{{colName}}" is {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        lt: {
            dropdownLabel: t('Before'),
            treeLabel: rule => t('Date in column "{{colName}}" is before {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        le: {
            dropdownLabel: t('Before or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is before or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        gt: {
            dropdownLabel: t('After'),
            treeLabel: rule => t('Date in column "{{colName}}" is after {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        ge: {
            dropdownLabel: t('After or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is after or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        eqTodayPlusDays: {
            dropdownLabel: t('On x-th day before/after current date'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is'),
        },
        ltTodayPlusDays: {
            dropdownLabel: t('Before x-th day before/after current date'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is before'),
        },
        leTodayPlusDays: {
            dropdownLabel: t('Before or on x-th day before/after current date'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is before or on'),
        },
        gtTodayPlusDays: {
            dropdownLabel: t('After x-th day before/after current date'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is after'),
        },
        geTodayPlusDays: {
            dropdownLabel: t('After or on x-th day before/after current date'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is after or on'),
        }
    };

    ruleHelpers.primitiveRuleTypes.birthday = {
        eq: {
            dropdownLabel: t('On'),
            treeLabel: rule => t('Date in column "{{colName}}" is {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        lt: {
            dropdownLabel: t('Before'),
            treeLabel: rule => t('Date in column "{{colName}}" is before {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        le: {
            dropdownLabel: t('Before or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is before or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        gt: {
            dropdownLabel: t('After'),
            treeLabel: rule => t('Date in column "{{colName}}" is after {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        ge: {
            dropdownLabel: t('After or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is after or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        }
    };

    ruleHelpers.primitiveRuleTypes.option = {
        isTrue: {
            dropdownLabel: t('Is selected'),
            treeLabel: rule => t('Value in column "{{colName}}" is selected', {colName: ruleHelpers.getColumnName(rule.column)}),
        },
        isFalse: {
            dropdownLabel: t('Is not selected'),
            treeLabel: rule => t('Value in column "{{colName}}" is not selected', {colName: ruleHelpers.getColumnName(rule.column)}),
        }
    };

    ruleHelpers.primitiveRuleTypes['dropdown-enum'] = ruleHelpers.primitiveRuleTypes['radio-enum'] = {
        eq: {
            dropdownLabel: t('Key equal to'),
            treeLabel: rule => t('The selected key in column "{{colName}}" is equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('Key match (with SQL LIKE)'),
            treeLabel: rule => t('The selected key in column "{{colName}}" matches (with SQL LIKE) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('Key match (with regular expressions)'),
            treeLabel: rule => t('The selected key in column "{{colName}}" matches (with regular expressions) "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('Key alphabetically before'),
            treeLabel: rule => t('The selected key in column "{{colName}}" is alphabetically before "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('Key alphabetically before or equal to'),
            treeLabel: rule => t('The selected key in column "{{colName}}" is alphabetically before or equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('Key alphabetically after'),
            treeLabel: rule => t('The selected key in column "{{colName}}" is alphabetically after "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('Key alphabetically after or equal to'),
            treeLabel: rule => t('The selected key in column "{{colName}}" is alphabetically after or equal to "{{value}}"', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };


    const stringValueSettings = allowEmpty => ({
        form: <InputField id="value" label={t('Value')} />,
        getFormData: rule => ({
            value: rule.value
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = getter('value');
        },
        validate: state => {
            if (!allowEmpty && !state.getIn(['value', 'value'])) {
                state.setIn(['value', 'error'], t('Value must not be empty'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    });

    const numberValueSettings = {
        form: <InputField id="value" label={t('Value')} />,
        getFormData: rule => ({
            value: rule.value.toString()
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = parseInt(getter('value'));
        },
        validate: state => {
            const value = state.getIn(['value', 'value']).trim();
            if (value === '') {
                state.setIn(['value', 'error'], t('Value must not be empty'));
            } else if (isNaN(value)) {
                state.setIn(['value', 'error'], t('Value must be a number'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    };

    const birthdayValueSettings = {
        form: <DatePicker id="birthday" label={t('Date')} birthday />,
        getFormData: rule => ({
            birthday: formatBirthday(DateFormat.INTL, rule.value)
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = parseBirthday(DateFormat.INTL, getter('birthday')).toISOString();
        },
        validate: state => {
            const value = state.getIn(['birthday', 'value']);
            const date = parseBirthday(DateFormat.INTL, value);
            if (!value) {
                state.setIn(['birthday', 'error'], t('Date must not be empty'));
            } else if (!date) {
                state.setIn(['birthday', 'error'], t('Date is invalid'));
            } else {
                state.setIn(['birthday', 'error'], null);
            }
        }
    };

    const dateValueSettings = {
        form: <DatePicker id="date" label={t('Date')} />,
        getFormData: rule => ({
            date: formatDate(DateFormat.INTL, rule.value)
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = parseDate(DateFormat.INTL, getter('date')).toISOString();
        },
        validate: state => {
            const value = state.getIn(['date', 'value']);
            const date = parseDate(DateFormat.INTL, value);
            if (!value) {
                state.setIn(['date', 'error'], t('Date must not be empty'));
            } else if (!date) {
                state.setIn(['date', 'error'], t('Date is invalid'));
            } else {
                state.setIn(['date', 'error'], null);
            }
        }
    };

    const dateRelativeValueSettings = {
        form:
            <div>
                <InputField id="daysValue" label={t('Number of days')}/>
                <Dropdown id="direction" label={t('Before/After')} options={[
                    { key: 'before', label: t('Before current date') },
                    { key: 'after', label: t('After current date') }
                ]}/>
            </div>,
        getFormData: rule => ({
            daysValue: Math.abs(rule.value).toString(),
            direction: rule.value >= 0 ? 'after' : 'before'
        }),
        assignRuleSettings: (rule, getter) => {
            const direction = getter('direction');
            rule.value = parseInt(getter('daysValue')) * (direction === 'before' ? -1 : 1);
        },
        validate: state => {
            const value = state.getIn(['daysValue', 'value']);
            if (!value) {
                state.setIn(['daysValue', 'error'], t('Number of days must not be empty'));
            } else if (isNaN(value)) {
                state.setIn(['daysValue', 'error'], t('Number of days must be a number'));
            } else {
                state.setIn(['daysValue', 'error'], null);
            }
        }
    };

    const optionValueSettings = {
        form: null,
        getFormData: rule => ({}),
        assignRuleSettings: (rule, getter) => {},
        validate: state => {}
    };


    function assignSettingsToRuleTypes(ruleTypes, keys, settings) {
        for (const key of keys) {
            Object.assign(ruleTypes[key], settings);
        }
    }

    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.text, ['eq', 'like', 're'], stringValueSettings(true));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.text, ['lt', 'le', 'gt', 'ge'], stringValueSettings(false));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.website, ['eq', 'like', 're'], stringValueSettings(true));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.number, ['eq', 'lt', 'le', 'gt', 'ge'], numberValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.birthday, ['eq', 'lt', 'le', 'gt', 'ge'], birthdayValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.date, ['eq', 'lt', 'le', 'gt', 'ge'], dateValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.date, ['eqTodayPlusDays', 'ltTodayPlusDays', 'leTodayPlusDays', 'gtTodayPlusDays', 'geTodayPlusDays'], dateRelativeValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.option, ['isTrue', 'isFalse'], optionValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['dropdown-enum'], ['eq', 'like', 're'], stringValueSettings(true));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['dropdown-enum'], ['lt', 'le', 'gt', 'ge'], stringValueSettings(false));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['radio-enum'], ['eq', 'like', 're'], stringValueSettings(true));
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['radio-enum'], ['lt', 'le', 'gt', 'ge'], stringValueSettings(false));

    ruleHelpers.primitiveRuleTypesFormDataDefaults = {
        value: '',
        date: '',
        daysValue: '',
        birthday: '',
        direction: 'before'
    };



    ruleHelpers.getCompositeRuleTypeOptions = () => {
        const order = ['all', 'some', 'none'];
        return order.map(key => ({ key, label: ruleHelpers.compositeRuleTypes[key].dropdownLabel }));
    };

    ruleHelpers.getPrimitiveRuleTypeOptions = columnType => {
        const order = {
            text: ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge'],
            website: ['eq', 'like', 're'],
            number: ['eq', 'lt', 'le', 'gt', 'ge'],
            birthday: ['eq', 'lt', 'le', 'gt', 'ge'],
            date: ['eq', 'lt', 'le', 'gt', 'ge', 'eqTodayPlusDays', 'ltTodayPlusDays', 'leTodayPlusDays', 'gtTodayPlusDays', 'geTodayPlusDays'],
            option: ['isTrue', 'isFalse'],
            'dropdown-enum': ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge'],
            'radio-enum': ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge']
        };

        return order[columnType].map(key => ({ key, label: ruleHelpers.primitiveRuleTypes[columnType][key].dropdownLabel }));
    };

    const predefColumns = [
        {
            column: 'email',
            name: t('Email address'),
            type: 'text',
            key: 'EMAIL'
        },
        {
            column: 'opt_in_country',
            name: t('Signup country'),
            type: 'text'
        },
        {
            column: 'created',
            name: t('Sign up date'),
            type: 'date'
        },
        {
            column: 'latest_open',
            name: t('Latest open'),
            type: 'date'
        },
        {
            column: 'latest_click',
            name: t('Latest click'),
            type: 'date'
        }
    ];

    ruleHelpers.fields = [
        ...predefColumns,
        ...fields.filter(fld => fld.type in ruleHelpers.primitiveRuleTypes)
    ];

    ruleHelpers.fieldsByColumn = {};
    for (const fld of ruleHelpers.fields) {
        ruleHelpers.fieldsByColumn[fld.column] = fld;
    }

    ruleHelpers.getColumnType = column => {
        const field = ruleHelpers.fieldsByColumn[column];
        if (field) {
            return field.type;
        }
    };

    ruleHelpers.getColumnName = column => {
        const field = ruleHelpers.fieldsByColumn[column];
        if (field) {
            return field.name;
        }
    };

    ruleHelpers.getRuleTypeSettings = rule => {
        if (ruleHelpers.isCompositeRuleType(rule.type)) {
            return ruleHelpers.compositeRuleTypes[rule.type];
        } else {
            const colType = ruleHelpers.getColumnType(rule.column);

            if (colType) {
                if (rule.type in ruleHelpers.primitiveRuleTypes[colType]) {
                    return ruleHelpers.primitiveRuleTypes[colType][rule.type];
                }
            }
        }
    };

    ruleHelpers.isCompositeRuleType = ruleType => ruleType in ruleHelpers.compositeRuleTypes;

    return ruleHelpers;
}

