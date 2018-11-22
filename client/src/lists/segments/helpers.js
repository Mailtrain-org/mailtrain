'use strict';

import React from 'react';
import {DatePicker, Dropdown, InputField} from "../../lib/form";
import { parseDate, parseBirthday, formatDate, formatBirthday, DateFormat, birthdayYear, getDateFormatString, getBirthdayFormatString } from '../../../../shared/date';
import { tMark } from "../../lib/i18n";

export function getRuleHelpers(t, fields) {

    const ruleHelpers = {};

    ruleHelpers.compositeRuleTypes = {
        all: {
            dropdownLabel: t('allRulesMustMatch'),
            treeLabel: rule => t('allRulesMustMatch')
        },
        some: {
            dropdownLabel: t('atLeastOneRuleMustMatch'),
            treeLabel: rule => t('atLeastOneRuleMustMatch')
        },
        none: {
            dropdownLabel: t('noRuleMayMatch'),
            treeLabel: rule => t('noRuleMayMatch')
        }
    };

    ruleHelpers.primitiveRuleTypes = {};

    ruleHelpers.primitiveRuleTypes.text = {
        eq: {
            dropdownLabel: t('equalTo'),
            treeLabel: rule => t('valueInColumnColNameIsEqualToValue', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('matchWithSqlLike'),
            treeLabel: rule => t('valueInColumnColNameMatchesWithSqlLike', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('matchWithRegularExpressions'),
            treeLabel: rule => t('valueInColumnColNameMatchesWithRegular', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('alphabeticallyBefore'),
            treeLabel: rule => t('valueInColumnColNameIsAlphabetically', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('alphabeticallyBeforeOrEqualTo'),
            treeLabel: rule => t('valueInColumnColNameIsAlphabetically-1', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('alphabeticallyAfter'),
            treeLabel: rule => t('valueInColumnColNameIsAlphabetically-2', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('alphabeticallyAfterOrEqualTo'),
            treeLabel: rule => t('valueInColumnColNameIsAlphabetically-3', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    ruleHelpers.primitiveRuleTypes.website = {
        eq: {
            dropdownLabel: t('equalTo'),
            treeLabel: rule => t('valueInColumnColNameIsEqualToValue', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('matchWithSqlLike'),
            treeLabel: rule => t('valueInColumnColNameMatchesWithSqlLike', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('matchWithRegularExpressions'),
            treeLabel: rule => t('valueInColumnColNameMatchesWithRegular', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    ruleHelpers.primitiveRuleTypes.number = {
        eq: {
            dropdownLabel: t('equalTo'),
            treeLabel: rule => t('valueInColumnColNameIsEqualToValue-1', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('lessThan'),
            treeLabel: rule => t('valueInColumnColNameIsLessThanValue', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('lessThanOrEqualTo'),
            treeLabel: rule => t('valueInColumnColNameIsLessThanOrEqualTo', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('greaterThan'),
            treeLabel: rule => t('valueInColumnColNameIsGreaterThanValue', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('greaterThanOrEqualTo'),
            treeLabel: rule => t('valueInColumnColNameIsGreaterThanOrEqual', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };

    // FXIME - the localization here is still wrong
    function getRelativeDateTreeLabel(rule, variants) {
        if (rule.value === 0) {
            return t(variants[0], {colName: ruleHelpers.getColumnName(rule.column)})
        } else if (rule.value > 0) {
            return t(variants[1], {colName: ruleHelpers.getColumnName(rule.column), value: rule.value});
        } else {
            return t(variants[2], {colName: ruleHelpers.getColumnName(rule.column), value: -rule.value});
        }
    }

    ruleHelpers.primitiveRuleTypes.date = {
        eq: {
            dropdownLabel: t('on'),
            treeLabel: rule => t('dateInColumnColNameIsValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        lt: {
            dropdownLabel: t('before'),
            treeLabel: rule => t('dateInColumnColNameIsBeforeValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        le: {
            dropdownLabel: t('beforeOrOn'),
            treeLabel: rule => t('dateInColumnColNameIsBeforeOrOnValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        gt: {
            dropdownLabel: t('after'),
            treeLabel: rule => t('dateInColumnColNameIsAfterValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        ge: {
            dropdownLabel: t('afterOrOn'),
            treeLabel: rule => t('dateInColumnColNameIsAfterOrOnValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatDate(DateFormat.INTL, rule.value)}),
        },
        eqTodayPlusDays: {
            dropdownLabel: t('onXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, 'is', [tMark('Date in column "{{colName}}" is the current date'), tMark('Date in column "{{colName}}" is {{value}}-th day after the current date'), tMark('Date in column "{{colName}}" is {{value}}-th day before the current date')]),
        },
        ltTodayPlusDays: {
            dropdownLabel: t('beforeXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('Date in column "{{colName}}" is before the current date'), tMark('Date in column "{{colName}}" is before {{value}}-th day after the current date'), tMark('Date in column "{{colName}}" is before {{value}}-th day before the current date')]),
        },
        leTodayPlusDays: {
            dropdownLabel: t('beforeOrOnXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('Date in column "{{colName}}" is before or on the current date'), tMark('Date in column "{{colName}}" is before or on {{value}}-th day after the current date'), tMark('Date in column "{{colName}}" is before or on {{value}}-th day before the current date')]),
        },
        gtTodayPlusDays: {
            dropdownLabel: t('afterXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('Date in column "{{colName}}" is after the current date'), tMark('Date in column "{{colName}}" is after {{value}}-th day after the current date'), tMark('Date in column "{{colName}}" is after {{value}}-th day before the current date')]),
        },
        geTodayPlusDays: {
            dropdownLabel: t('afterOrOnXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('Date in column "{{colName}}" is after or on the current date'), tMark('Date in column "{{colName}}" is after or on {{value}}-th day after the current date'), tMark('Date in column "{{colName}}" is after or on {{value}}-th day before the current date')]),
        }
    };

    ruleHelpers.primitiveRuleTypes.birthday = {
        eq: {
            dropdownLabel: t('on'),
            treeLabel: rule => t('dateInColumnColNameIsValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        lt: {
            dropdownLabel: t('before'),
            treeLabel: rule => t('dateInColumnColNameIsBeforeValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        le: {
            dropdownLabel: t('beforeOrOn'),
            treeLabel: rule => t('dateInColumnColNameIsBeforeOrOnValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        gt: {
            dropdownLabel: t('after'),
            treeLabel: rule => t('dateInColumnColNameIsAfterValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        },
        ge: {
            dropdownLabel: t('afterOrOn'),
            treeLabel: rule => t('dateInColumnColNameIsAfterOrOnValue', {colName: ruleHelpers.getColumnName(rule.column), value: formatBirthday(DateFormat.INTL, rule.value)}),
        }
    };

    ruleHelpers.primitiveRuleTypes.option = {
        isTrue: {
            dropdownLabel: t('isSelected'),
            treeLabel: rule => t('valueInColumnColNameIsSelected', {colName: ruleHelpers.getColumnName(rule.column)}),
        },
        isFalse: {
            dropdownLabel: t('isNotSelected'),
            treeLabel: rule => t('valueInColumnColNameIsNotSelected', {colName: ruleHelpers.getColumnName(rule.column)}),
        }
    };

    ruleHelpers.primitiveRuleTypes['dropdown-enum'] = ruleHelpers.primitiveRuleTypes['radio-enum'] = {
        eq: {
            dropdownLabel: t('keyEqualTo'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameIsEqualTo', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        like: {
            dropdownLabel: t('keyMatchWithSqlLike'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameMatchesWith', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        re: {
            dropdownLabel: t('keyMatchWithRegularExpressions'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameMatchesWith-1', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        lt: {
            dropdownLabel: t('keyAlphabeticallyBefore'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameIs', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        le: {
            dropdownLabel: t('keyAlphabeticallyBeforeOrEqualTo'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameIs-1', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        gt: {
            dropdownLabel: t('keyAlphabeticallyAfter'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameIs-2', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        },
        ge: {
            dropdownLabel: t('keyAlphabeticallyAfterOrEqualTo'),
            treeLabel: rule => t('theSelectedKeyInColumnColNameIs-3', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };


    const stringValueSettings = allowEmpty => ({
        form: <InputField id="value" label={t('value')} />,
        getFormData: rule => ({
            value: rule.value
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = getter('value');
        },
        validate: state => {
            if (!allowEmpty && !state.getIn(['value', 'value'])) {
                state.setIn(['value', 'error'], t('valueMustNotBeEmpty'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    });

    const numberValueSettings = {
        form: <InputField id="value" label={t('value')} />,
        getFormData: rule => ({
            value: rule.value.toString()
        }),
        assignRuleSettings: (rule, getter) => {
            rule.value = parseInt(getter('value'));
        },
        validate: state => {
            const value = state.getIn(['value', 'value']).trim();
            if (value === '') {
                state.setIn(['value', 'error'], t('valueMustNotBeEmpty'));
            } else if (isNaN(value)) {
                state.setIn(['value', 'error'], t('valueMustBeANumber'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    };

    const birthdayValueSettings = {
        form: <DatePicker id="birthday" label={t('date')} birthday />,
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
                state.setIn(['birthday', 'error'], t('dateMustNotBeEmpty'));
            } else if (!date) {
                state.setIn(['birthday', 'error'], t('dateIsInvalid'));
            } else {
                state.setIn(['birthday', 'error'], null);
            }
        }
    };

    const dateValueSettings = {
        form: <DatePicker id="date" label={t('date')} />,
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
                state.setIn(['date', 'error'], t('dateMustNotBeEmpty'));
            } else if (!date) {
                state.setIn(['date', 'error'], t('dateIsInvalid'));
            } else {
                state.setIn(['date', 'error'], null);
            }
        }
    };

    const dateRelativeValueSettings = {
        form:
            <div>
                <InputField id="daysValue" label={t('numberOfDays')}/>
                <Dropdown id="direction" label={t('beforeAfter')} options={[
                    { key: 'before', label: t('beforeCurrentDate') },
                    { key: 'after', label: t('afterCurrentDate') }
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
                state.setIn(['daysValue', 'error'], t('numberOfDaysMustNotBeEmpty'));
            } else if (isNaN(value)) {
                state.setIn(['daysValue', 'error'], t('numberOfDaysMustBeANumber'));
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
            name: t('emailAddress-1'),
            type: 'text',
            key: 'EMAIL'
        },
        {
            column: 'opt_in_country',
            name: t('signupCountry'),
            type: 'text'
        },
        {
            column: 'created',
            name: t('signUpDate'),
            type: 'date'
        },
        {
            column: 'latest_open',
            name: t('latestOpen'),
            type: 'date'
        },
        {
            column: 'latest_click',
            name: t('latestClick'),
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

