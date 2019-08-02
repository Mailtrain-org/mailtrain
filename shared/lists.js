'use strict';

const {TagLanguages} = require('./templates');

const UnsubscriptionMode = {
    MIN: 0,

    ONE_STEP: 0,
    ONE_STEP_WITH_FORM: 1,
    TWO_STEP: 2,
    TWO_STEP_WITH_FORM: 3,
    MANUAL: 4,

    MAX: 4
};

const SubscriptionStatus = {
    MIN: 0,

    SUBSCRIBED: 1,
    UNSUBSCRIBED: 2,
    BOUNCED: 3,
    COMPLAINED: 4,

    MAX: 4
};

const SubscriptionSource = {
    ADMIN_FORM: -1,
    SUBSCRIPTION_FORM: -2,
    API: -3,
    NOT_IMPORTED_V1: -4,
    IMPORTED_V1: -5,
    ERASED: -6
};

const FieldWizard = {
    NONE: 'none',
    NAME: 'full_name',
    FIRST_LAST_NAME: 'first_last_name'
}

function getFieldColumn(field) {
    return field.column || 'grouped_' + field.id;
}

const toNameTagLangauge = TagLanguages.SIMPLE;

module.exports = {
    UnsubscriptionMode,
    SubscriptionStatus,
    SubscriptionSource,
    FieldWizard,
    getFieldColumn,
    toNameTagLangauge
};