'use strict';

import React from 'react';
import {Fieldset, InputField} from "../../lib/form";

export function getFieldTypes(t) {

    const fieldTypes = {
        text: {
            label: t('Text'),
        },
        website: {
            label: t('Website'),
        },
        longtext: {
            label: t('Multi-line text'),
        },
        gpg: {
            label: t('GPG Public Key'),
        },
        number: {
            label: t('Number'),
        },
        checkbox: {
            label: t('Checkboxes (from option fields)'),
        },
        'radio-grouped': {
            label: t('Radio Buttons (from option fields)')
        },
        'dropdown-grouped': {
            label: t('Drop Down (from option fields)')
        },
        'radio-enum': {
            label: t('Radio Buttons (enumerated)')
        },
        'dropdown-enum': {
            label: t('Drop Down (enumerated)')
        },
        'date': {
            label: t('Date')
        },
        'birthday': {
            label: t('Birthday')
        },
        json: {
            label: t('JSON value for custom rendering')
        },
        option: {
            label: t('Option')
        }
    };

    return fieldTypes;
}

