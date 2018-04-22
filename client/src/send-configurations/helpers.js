'use strict';

import React from "react";

import {MailerType} from "../../../shared/send-configurations";

export const mailerTypesOrder = [
    MailerType.ZONE_MTA,
    MailerType.GENERIC_SMTP,
    MailerType.AWS_SES
];

export function getMailerTypes(t) {
    const mailerTypes = {};

    function clearBeforeSend(data) {
    }

    mailerTypes[MailerType.GENERIC_SMTP] = {
        typeName: t('Generic SMTP'),
        getForm: owner => null,
        initData: () => ({
        }),
        afterLoad: data => {
        },
        beforeSave: data => {
            clearBeforeSend(data);
        },
        afterTypeChange: mutState => {
            // mutState.setIn(['type', 'value'], '');
        }
    };

    mailerTypes[MailerType.ZONE_MTA] = {
        typeName: t('Zone MTA'),
        getForm: owner => null,
        initData: () => ({
        }),
        afterLoad: data => {
        },
        beforeSave: data => {
            clearBeforeSend(data);
        },
        afterTypeChange: mutState => {
        }
    };

    mailerTypes[MailerType.AWS_SES] = {
        typeName: t('Amazon SES'),
        getForm: owner => null,
        initData: () => ({
        }),
        afterLoad: data => {
        },
        beforeSave: data => {
            clearBeforeSend(data);
        },
        afterTypeChange: mutState => {
        }
    };

    return mailerTypes;
}