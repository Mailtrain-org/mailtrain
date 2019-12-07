'use strict';

const log = require('../lib/log');
const knex = require('../lib/knex');
const triggers = require('../models/triggers');
const campaigns = require('../models/campaigns');
const subscriptions = require('../models/subscriptions');
const segments = require('../models/segments');
const { Entity, Event } = require('../../shared/triggers');
const { SubscriptionStatus } = require('../../shared/lists');
const links = require('../models/links');
const contextHelpers = require('../lib/context-helpers');
const messageSender = require('../lib/message-sender');

const triggerCheckPeriod = 30 * 1000;
const triggerFirePeriod = 120 * 1000;


async function run() {
    while (true) {
        const fired = await knex.transaction(async tx => {
            const currentTs = Date.now();

            const trigger = await tx('triggers')
                .where('enabled', true)
                .where(qry => qry.whereNull('last_check').orWhere('last_check', '<', new Date(currentTs - triggerFirePeriod)))
                .orderBy('last_check', 'asc')
                .first();
            if (!trigger) {
                return false;
            }

            const campaign = await campaigns.getByIdTx(tx, contextHelpers.getAdminContext(), trigger.campaign, false);

            for (const cpgList of campaign.lists) {
                const addSegmentQuery = cpgList.segment ? await segments.getQueryGeneratorTx(tx, cpgList.list, cpgList.segment) : () => {
                };
                const subsTable = subscriptions.getSubscriptionTableName(cpgList.list);

                let sqlQry = knex.from(subsTable)
                    .leftJoin(
                        function () {
                            return this.from('trigger_messages')
                                .innerJoin('triggers', 'trigger_messages.trigger', 'triggers.id')
                                .where('triggers.campaign', campaign.id)
                                .where('trigger_messages.list', cpgList.list)
                                .select(['id', 'subscription'])
                                .as('related_trigger_messages');
                        },
                        'related_trigger_messages.subscription', subsTable + '.id'
                    )
                    .where(function () {
                        addSegmentQuery(this);
                    })
                    .whereNull('related_trigger_messages.id') // This means only those campaigns where one of their triggers has not fired yet somewhen in the past
                    .where(subsTable + '.status', SubscriptionStatus.SUBSCRIBED)
                    .select(subsTable + '.id');

                let column;

                if (trigger.entity === Entity.SUBSCRIPTION) {
                    column = subsTable + '.' + trigger.event;

                } else if (trigger.entity === Entity.CAMPAIGN) {
                    if (trigger.event === Event[Entity.CAMPAIGN].DELIVERED) {
                        sqlQry = sqlQry.innerJoin(
                            function () {
                                return this.from('campaign_messages')
                                    .where('campaign_messages.campaign', trigger.source_campaign)
                                    .where('campaign_messages.list', cpgList.list)
                                    .as('campaign_messages');
                            }, 'campaign_messages.subscription', subsTable + '.id');

                        column = 'campaign_messages.created';

                    } else if (trigger.event === Event[Entity.CAMPAIGN].OPENED) {
                        sqlQry = sqlQry.innerJoin(
                            function () {
                                return this.from('campaign_links')
                                    .where('campaign_links.campaign', trigger.source_campaign)
                                    .where('campaign_links.list', cpgList.list)
                                    .where('campaign_links.link', links.LinkId.OPEN)
                                    .as('campaign_links');
                            }, 'campaign_links', 'campaign_links.subscription', subsTable + '.id');

                        column = 'campaign_links.created';

                    } else if (trigger.event === Event[Entity.CAMPAIGN].CLICKED) {
                        sqlQry = sqlQry.innerJoin(
                            function () {
                                return this.from('campaign_links')
                                    .where('campaign_links.campaign', trigger.source_campaign)
                                    .where('campaign_links.list', cpgList.list)
                                    .where('campaign_links.link', links.LinkId.GENERAL_CLICK)
                                    .as('campaign_links');
                            }, 'campaign_links', 'campaign_links.subscription', subsTable + '.id');

                        column = 'campaign_links.created';

                    } else if (trigger.event === Event[Entity.CAMPAIGN].NOT_OPENED) {
                        sqlQry = sqlQry.innerJoin(
                            function () {
                                return this.from('campaign_messages')
                                    .where('campaign_messages.campaign', trigger.source_campaign)
                                    .where('campaign_messages.list', cpgList.list)
                                    .as('campaign_messages');
                            }, 'campaign_messages.subscription', subsTable + '.id')
                            .whereNotExists(function () {
                                return this
                                    .select('*')
                                    .from('campaign_links')
                                    .whereRaw(`campaign_links.subscription = ${subsTable}.id`)
                                    .where('campaign_links.campaign', trigger.source_campaign)
                                    .where('campaign_links.list', cpgList.list)
                                    .where('campaign_links.link', links.LinkId.OPEN);
                            });

                        column = 'campaign_messages.created';

                    } else if (trigger.event === Event[Entity.CAMPAIGN].NOT_CLICKED) {
                        sqlQry = sqlQry.innerJoin(
                            function () {
                                return this.from('campaign_messages')
                                    .where('campaign_messages.campaign', trigger.source_campaign)
                                    .where('campaign_messages.list', cpgList.list)
                                    .as('campaign_messages');
                            }, 'campaign_messages.subscription', subsTable + '.id')
                            .whereNotExists(function () {
                                return this
                                    .select('*')
                                    .from('campaign_links')
                                    .whereRaw(`campaign_links.subscription = ${subsTable}.id`)
                                    .where('campaign_links.campaign', trigger.source_campaign)
                                    .where('campaign_links.list', cpgList.list)
                                    .where('campaign_links.link', links.LinkId.GENERAL_CLICK);
                            });

                        column = 'campaign_messages.created';
                    }
                }

                sqlQry = sqlQry.where(column, '<=', new Date(currentTs - trigger.seconds * 1000));

                if (trigger.last_check !== null) {
                    sqlQry = sqlQry.where(column, '>', new Date(trigger.last_check - trigger.seconds * 1000));
                }

                const subscribers = await sqlQry;
                for (const subscriber of subscribers) {
                    await tx('trigger_messages').insert({
                        trigger: trigger.id,
                        list: cpgList.list,
                        subscription: subscriber.id
                    });

                    await messageSender.queueCampaignMessageTx(tx,
                        campaign.send_configuration, cpgList.list, subscriber.id, messageSender.MessageType.TRIGGERED,
                        {
                            campaignId: campaign.id,
                            triggerId: trigger.id
                        }
                    );

                    await tx('triggers').increment('count').where('id', trigger.id);

                    log.verbose('Triggers', `Triggered ${trigger.name} (${trigger.id}) for subscriber ${subscriber.id}`);
                }
            }


            await tx('triggers').update('last_check', new Date(currentTs)).where('id', trigger.id);

            return true;
        });


        if (!fired) {
            const nextCycle = new Promise(resolve => {
                setTimeout(resolve, triggerCheckPeriod);
            });

            await nextCycle;
        }
    }
}

function start() {
    log.info('Triggers', 'Starting trigger check service');
    run().catch(err => {
        log.error('Triggers', err);
    });
}

module.exports.start = start;
