'use strict';

const Entity = {
    SUBSCRIPTION: 'subscription',
    CAMPAIGN: 'campaign'
};

const Event = {
    [Entity.SUBSCRIPTION]: {
        CREATED: 'created',
        UPDATED: 'updated',
        LATEST_OPEN: 'latest_open',
        LATEST_CLICK: 'latest_click'
    },
    [Entity.CAMPAIGN]: {
        DELIVERED: 'delivered',
        OPENED: 'opened',
        CLICKED: 'clicked',
        NOT_OPENED: 'not_opened',
        NOT_CLICKED: 'not_clicked'
    }
};

const EntityVals = {
    subscription: 'SUBSCRIPTION',
    campaign: 'CAMPAIGN'
};

const EventVals = {
    [Entity.SUBSCRIPTION]: {
        created: 'CREATED',
        updated: 'UPDATED',
        latest_open: 'LATEST_OPEN',
        latest_click: 'LATEST_CLICK'
    },
    [Entity.CAMPAIGN]: {
        delivered: 'DELIVERED',
        opened: 'OPENED',
        clicked: 'CLICKED',
        not_opened: 'NOT_OPENED',
        not_clicked: 'NOT_CLICKED'
    }
};

module.exports = {
    Entity,
    Event,
    EntityVals,
    EventVals
};
