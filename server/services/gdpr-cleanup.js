'use strict';

const config = require('../lib/config');
const log = require('../lib/log');
const knex = require('../lib/knex');
const subscriptions = require('../models/subscriptions');
const { SubscriptionStatus } = require('../../shared/lists');
const contextHelpers = require('../lib/context-helpers');

const checkPeriod = 60 * 1000;

async function run() {
    while (true) {
        await knex.transaction(async tx => {
            const currentTs = Date.now();

            const lsts = await tx('lists').select(['id']);
            for (const list of lsts) {

                if (config.gdpr.deleteSubscriptionAfterUnsubscribe.enabled) {
                    await tx(subscriptions.getSubscriptionTableName(list.id))
                        .whereIn('status', [SubscriptionStatus.UNSUBSCRIBED, SubscriptionStatus.COMPLAINED])
                        .where('unsubscribed', '<=', new Date(currentTs - config.gdpr.deleteSubscriptionAfterUnsubscribe.secondsAfterUnsubscribe * 1000))
                        .del();
                }

                if (config.gdpr.deleteDataAfterUnsubscribe.enabled) {
                    const groupedFieldsMap = await subscriptions.getGroupedFieldsMapTx(tx, list.id);

                    const purgedEntity = {};
                    subscriptions.purgeSensitiveData(purgedEntity, groupedFieldsMap);

                    await tx(subscriptions.getSubscriptionTableName(list.id))
                        .whereNotNull('email')
                        .whereIn('status', [SubscriptionStatus.UNSUBSCRIBED, SubscriptionStatus.COMPLAINED])
                        .where('unsubscribed', '<=', new Date(currentTs - config.gdpr.deleteDataAfterUnsubscribe.secondsAfterUnsubscribe * 1000))
                        .update(purgedEntity);
                }
            }
        });

        const nextCycle = new Promise(resolve => {
            setTimeout(resolve, checkPeriod);
        });
        await nextCycle;
    }
}

function start() {
    if (config.gdpr.deleteDataAfterUnsubscribe.enabled || config.gdpr.deleteDataAfterUnsubscribe.enabled) {
        log.info('GDPR', 'Starting GDPR cleanup service');
        run().catch(err => {
            log.error('GDPR', err);
        });
    }
}

module.exports.start = start;
