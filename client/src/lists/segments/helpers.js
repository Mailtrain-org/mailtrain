'use strict';

import React from 'react';
import {DateTimePicker, Dropdown, InputField} from "../../lib/form";
import {DateFormat, formatBirthday, formatDate, parseBirthday, parseDate} from '../../../../shared/date';
import {tMark} from "../../lib/i18n";

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
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('dateInColumnColNameIsTheCurrentDate'), tMark('dateInColumnColNameIsTheValuethDayAfter'), tMark('dateInColumnColNameIsTheValuethDayBefore')]),
        },
        ltTodayPlusDays: {
            dropdownLabel: t('beforeXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('dateInColumnColNameIsBeforeTheCurrent'), tMark('dateInColumnColNameIsBeforeTheValuethDay'), tMark('dateInColumnColNameIsBeforeTheValuethDay-1')]),
        },
        leTodayPlusDays: {
            dropdownLabel: t('beforeOrOnXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('dateInColumnColNameIsBeforeOrOnThe'), tMark('dateInColumnColNameIsBeforeOrOnThe-1'), tMark('dateInColumnColNameIsBeforeOrOnThe-2')]),
        },
        gtTodayPlusDays: {
            dropdownLabel: t('afterXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('dateInColumnColNameIsAfterTheCurrentDate'), tMark('dateInColumnColNameIsAfterTheValuethDay'), tMark('dateInColumnColNameIsAfterTheValuethDay-1')]),
        },
        geTodayPlusDays: {
            dropdownLabel: t('afterOrOnXthDayBeforeafterCurrentDate'),
            treeLabel: rule => getRelativeDateTreeLabel(rule, [tMark('dateInColumnColNameIsAfterOrOnTheCurrent'), tMark('dateInColumnColNameIsAfterOrOnTheValueth'), tMark('dateInColumnColNameIsAfterOrOnTheValueth-1')]),
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

    ruleHelpers.primitiveRuleTypes['dropdown-static'] = {
        eq: {
            dropdownLabel: t('equalTo'),
            treeLabel: rule => t('valueInColumnColNameIsEqualToValue', {colName: ruleHelpers.getColumnName(rule.column), value: rule.value}),
        }
    };


    const stringValueSettings = allowEmpty => ({
        getForm: fldDef => <InputField id="value" label={t('value')} />,
        getFormData: (rule, fldDef) => ({
            value: rule.value
        }),
        assignRuleSettings: (rule, getter, fldDef) => {
            rule.value = getter('value');
        },
        validate: (state, fldDef) => {
            if (!allowEmpty && !state.getIn(['value', 'value'])) {
                state.setIn(['value', 'error'], t('valueMustNotBeEmpty'));
            } else {
                state.setIn(['value', 'error'], null);
            }
        }
    });

    const numberValueSettings = {
        getForm: fldDef => <InputField id="value" label={t('value')} />,
        getFormData: (rule, fldDef) => ({
            value: rule.value.toString()
        }),
        assignRuleSettings: (rule, getter, fldDef) => {
            rule.value = parseInt(getter('value'));
        },
        validate: (state, fldDef) => {
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
        getForm: fldDef => <DateTimePicker id="birthday" label={t('date')} birthday />,
        getFormData: (rule, fldDef) => ({
            birthday: formatBirthday(DateFormat.INTL, rule.value)
        }),
        assignRuleSettings: (rule, getter, fldDef) => {
            rule.value = parseBirthday(DateFormat.INTL, getter('birthday')).toISOString();
        },
        validate: (state, fldDef) => {
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
        getForm: fldDef => <DateTimePicker id="date" label={t('date')} />,
        getFormData: (rule, fldDef) => ({
            date: formatDate(DateFormat.INTL, rule.value)
        }),
        assignRuleSettings: (rule, getter, fldDef) => {
            rule.value = parseDate(DateFormat.INTL, getter('date')).toISOString();
        },
        validate: (state, fldDef) => {
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
        getForm: fldDef =>
            <div>
                <InputField id="daysValue" label={t('numberOfDays')}/>
                <Dropdown id="direction" label={t('beforeAfter')} options={[
                    { key: 'before', label: t('beforeCurrentDate') },
                    { key: 'after', label: t('afterCurrentDate') }
                ]}/>
            </div>,
        getFormData: (rule, fldDef) => ({
            daysValue: Math.abs(rule.value).toString(),
            direction: rule.value >= 0 ? 'after' : 'before'
        }),
        assignRuleSettings: (rule, getter, fldDef) => {
            const direction = getter('direction');
            rule.value = parseInt(getter('daysValue')) * (direction === 'before' ? -1 : 1);
        },
        validate: (state, fldDef) => {
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
        getForm: fldDef => null,
        getFormData: (rule, fldDef) => ({}),
        assignRuleSettings: (rule, getter, fldDef) => {},
        validate: state => {}
    };

    const staticEnumValueSettings = {
        getForm: fldDef => {
            const opts = [];
            for (const opt in fldDef.options) {
                opts.push({key: opt, label: fldDef.options[opt]});
            }

            return <Dropdown id="value" label={t('value')} options={opts}/>;
        },
        getFormData: (rule, fldDef) => {
            let value;
            if (rule.value in fldDef.options) {
                value = rule.value;
            } else {
                value = fldDef.default
            }

            return {
                value
            };
        },
        assignRuleSettings: (rule, getter, fldDef) => {
            let value = getter('value');
            if (!(value in fldDef.options)) {
                value = fldDef.default
            }

            rule.value = value;
        },
        validate: (state, fldDef) => {
        }
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
    assignSettingsToRuleTypes(ruleHelpers.primitiveRuleTypes['dropdown-static'], ['eq'], staticEnumValueSettings);

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
            'radio-enum': ['eq', 'like', 're', 'lt', 'le', 'gt', 'ge'],
            'dropdown-static': ['eq'],
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
        },
        {
            column: 'is_test',
            name: t('testUser'),
            type: 'option'
        },
        {
            column: 'status',
            name: t('status'),
            type: 'dropdown-static',
            options: {
                subscribed: t('subscribed'),
                unsubscribed: t('unsubscribed'),
                bounced: t('bounced'),
                complained: t('complained')
            },
            default: 'subscribed'
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

    ruleHelpers.getColumnDef = column => {
        const field = ruleHelpers.fieldsByColumn[column];
        if (field) {
            return field;
        }
    };

    ruleHelpers.getColumnName = column => {
        const field = ruleHelpers.fieldsByColumn[column];
        if (field) {
            return field.name;
        }
    };

    ruleHelpers.isCompositeRuleType = ruleType => ruleType in ruleHelpers.compositeRuleTypes;

    ruleHelpers.getTreeLabel = rule => {
        if (ruleHelpers.isCompositeRuleType(rule.type)) {
            return ruleHelpers.compositeRuleTypes[rule.type].treeLabel(rule);
        } else {
            const colDef = ruleHelpers.getColumnDef(rule.column);

            if (colDef) {
                const colType = colDef.type;
                if (rule.type in ruleHelpers.primitiveRuleTypes[colType]) {
                    return ruleHelpers.primitiveRuleTypes[colType][rule.type].treeLabel(rule);
                }
            }
        }
    };


    ruleHelpers.extraFieldTypes = {
        'dropdown-static': {
            label: t('dropdown')
        }
    };

    return ruleHelpers;
}

