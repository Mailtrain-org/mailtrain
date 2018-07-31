'use strict';

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

function getFieldKey(field) {
    return field.column || 'grouped_' + field.id;
}

module.exports = {
    UnsubscriptionMode,
    SubscriptionStatus,
    getFieldKey
};