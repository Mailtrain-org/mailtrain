'use strict';

import React from 'react';

export function getFieldTypes(t) {

    const fieldTypes = {
        text: {
            label: t('text')
        },
        website: {
            label: t('website')
        },
        longtext: {
            label: t('multilineText')
        },
        gpg: {
            label: t('gpgPublicKey')
        },
        number: {
            label: t('number')
        },
        'checkbox-grouped': {
            label: t('checkboxesFromOptionFields')
        },
        'radio-grouped': {
            label: t('radioButtonsFromOptionFields')
        },
        'dropdown-grouped': {
            label: t('dropDownFromOptionFields')
        },
        'radio-enum': {
            label: t('radioButtonsEnumerated')
        },
        'dropdown-enum': {
            label: t('dropDownEnumerated')
        },
        'date': {
            label: t('date')
        },
        'birthday': {
            label: t('birthday')
        },
        json: {
            label: t('jsonValueForCustomRendering')
        },
        option: {
            label: t('option')
        }
    };

    return fieldTypes;
}

