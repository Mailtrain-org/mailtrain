'use strict';

const UnsubscriptionMode = {
    ONE_STEP: 0,
    ONE_STEP_WITH_FORM: 1,
    TWO_STEP: 2,
    TWO_STEP_WITH_FORM: 3,
    MANUAL: 4,
    MAX: 5
};

const SubscriptionStatus = {
    SUBSCRIBED: 1,
    UNSUBSCRIBED: 2,
    BOUNCED: 3,
    COMPLAINED: 4,
    MAX: 5
}

module.exports = {
    UnsubscriptionMode,
    SubscriptionStatus
};