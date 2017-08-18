'use strict';

import React from 'react';
import {InputField} from "../../lib/form";

export function getRuleHelpers(t, fields) {

    function formatDate(date) {
        return date; // FIXME
    }
    
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

    ruleHelpers.primitiveRuleTypes.date = ruleHelpers.primitiveRuleTypes.birthday = {
        eq: {
            dropdownLabel: t('On'),
            treeLabel: rule => t('Date in column "{{colName}}" is {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(rule.value)}),
        },
        lt: {
            dropdownLabel: t('Before'),
            treeLabel: rule => t('Date in column "{{colName}}" is before {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(rule.value)}),
        },
        le: {
            dropdownLabel: t('Before or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is before or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(rule.value)}),
        },
        gt: {
            dropdownLabel: t('After'),
            treeLabel: rule => t('Date in column "{{colName}}" is after {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(rule.value)}),
        },
        ge: {
            dropdownLabel: t('After or on'),
            treeLabel: rule => t('Date in column "{{colName}}" is after or on {{value}}', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(rule.value)}),
        },
        eqNowPlusDays: {
            dropdownLabel: t('On x-th day before/after now'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is'),
        },
        ltNowPlusDays: {
            dropdownLabel: t('Before x-th day before/after now'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is before'),
        },
        leNowPlusDays: {
            dropdownLabel: t('Before or on x-th day before/after now'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is before or on'),
        },
        gtNowPlusDays: {
            dropdownLabel: t('After x-th day before/after now'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is after'),
        },
        geNowPlusDays: {
            dropdownLabel: t('After or on x-th day before/after now'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is after or on'),
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


    const stringValueSettings = {
        form: <InputField id="value" label={t('Value')} />,
        getFormData: rule => ({
            value: rule.value
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = getter('value');
        },
        validate: state => {
            if (!state.getIn(['value', 'value'])) {
                state.setIn(['value', 'error'], t('Value must not be empty'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    };

    const numberValueSettings = {
        form: <InputField id="value" label={t('Value')} />,
        getFormData: rule => ({
            value: rule.value.toString()
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = parseInt(getter('value'));
        },
        validate: state => {
            const value = state.getIn(['value', 'value']);
            if (!value) {
                state.setIn(['value', 'error'], t('Value must not be empty'));
            } else if (isNaN(value)) {
                state.setIn(['value', 'error'], t('Value must be a number'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    };

    const birthdayValueSettings = {
        form: <InputField id="value" label={t('Value')} /> // FIXME
    };

    const birthdayRelativeValueSettings = {
        form: <InputField id="value" label={t('Value')} /> // FIXME
    };

    const dateValueSettings = {
        form: <InputField id="value" label={t('Value')} /> // FIXME
    };

    const dateRelativeValueSettings = {
        form: <InputField id="value" label={t('Value')} /> // FIXME
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

    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.text, Object.keys(ruleHelpers.primitiveRuleTypes.text), stringValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.website, Object.keys(ruleHelpers.primitiveRuleTypes.website), stringValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.number, Object.keys(ruleHelpers.primitiveRuleTypes.number), numberValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.birthday, ['eq', 'lt', 'le', 'gt', 'ge'], birthdayValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.birthday, ['eqNowPlusDays', 'ltNowPlusDays', 'leNowPlusDays', 'gtNowPlusDays', 'geNowPlusDays'], birthdayRelativeValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.date, ['eq', 'lt', 'le', 'gt', 'ge'], dateValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.date, ['eqNowPlusDays', 'ltNowPlusDays', 'leNowPlusDays', 'gtNowPlusDays', 'geNowPlusDays'], dateRelativeValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes.option, Object.keys(ruleHelpers.primitiveRuleTypes.option), optionValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['dropdown-enum'], Object.keys(ruleHelpers.primitiveRuleTypes['dropdown-enum']), stringValueSettings);
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['radio-enum'], Object.keys(ruleHelpers.primitiveRuleTypes['radio-enum']), stringValueSettings);


    ruleHelpers.getCompositeRuleTypeOptions = () => {
        const order = ['all', 'some', 'none'];
        return order.map(key => ({ key, label: ruleHelpers.compositeRuleTypes[key].dropdownLabel }));
    };

    ruleHelpers.getPrimitiveRuleTypeOptions = columnType => {
        const order = {
            text: ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge'],
            website: ['eq', 'like', 're'],
            number: ['eq', 'lt', 'le', 'gt', 'ge'],
            birthday: ['eq', 'lt', 'le', 'gt', 'ge', 'eqNowPlusDays', 'ltNowPlusDays', 'leNowPlusDays', 'gtNowPlusDays', 'geNowPlusDays'],
            date: ['eq', 'lt', 'le', 'gt', 'ge', 'eqNowPlusDays', 'ltNowPlusDays', 'leNowPlusDays', 'gtNowPlusDays', 'geNowPlusDays'],
            option: ['isTrue', 'isFalse'],
            'radio-enum': ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge'],
            'dropdown-enum': ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge']
        };

        return order[columnType].map(key => ({ key, label: ruleHelpers.primitiveRuleTypes[columnType][key].dropdownLabel }));
    };



    const predefColumns = [
        {
            column: 'email',
            name: t('Email address'),
            type: 'text',
            tag: 'EMAIL'
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

    ruleHelpers.fieldsByColumn = [];
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

