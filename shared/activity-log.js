'use strict';

const EntityActivityType = {
    CREATE: 1,
    UPDATE: 2,
    REMOVE: 3,
    MAX: 3
};

const CampaignActivityType = {
    STATUS_CHANGE: EntityActivityType.MAX + 1,
    TEST_SEND: EntityActivityType.MAX + 2,
};

const ListActivityType = {
    CREATE_SUBSCRIPTION: EntityActivityType.MAX + 1,
    UPDATE_SUBSCRIPTION: EntityActivityType.MAX + 2,
    REMOVE_SUBSCRIPTION: EntityActivityType.MAX + 3,
    SUBSCRIPTION_STATUS_CHANGE: EntityActivityType.MAX + 4,
    CREATE_FIELD: EntityActivityType.MAX + 5,
    UPDATE_FIELD: EntityActivityType.MAX + 6,
    REMOVE_FIELD: EntityActivityType.MAX + 7,
    CREATE_SEGMENT: EntityActivityType.MAX + 5,
    UPDATE_SEGMENT: EntityActivityType.MAX + 6,
    REMOVE_SEGMENT: EntityActivityType.MAX + 7,
    CREATE_IMPORT: EntityActivityType.MAX + 8,
    UPDATE_IMPORT: EntityActivityType.MAX + 9,
    REMOVE_IMPORT: EntityActivityType.MAX + 10,
    IMPORT_STATUS_CHANGE: EntityActivityType.MAX + 11,
};

const CampaignTrackerActivityType = {
    SENT: 1,
    BOUNCED: 2,
    UNSUBSCRIBED: 3,
    COMPLAINED: 4,
    OPENED: 5,
    CLICKED: 6
};

const BlacklistActivityType = {
    ADD: 1,
    REMOVE: 2
};


module.exports.EntityActivityType = EntityActivityType;
module.exports.BlacklistActivityType = BlacklistActivityType;
module.exports.CampaignActivityType = CampaignActivityType;
module.exports.ListActivityType = ListActivityType;
module.exports.CampaignTrackerActivityType = CampaignTrackerActivityType;