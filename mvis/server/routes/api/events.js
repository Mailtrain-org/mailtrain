'use strict';

const config = require('../../../ivis-core/server/lib/config');
const moment = require('moment');
const knex = require('../../../ivis-core/server/lib/knex');
const router = require('../../../ivis-core/server/lib/router-async').create();
const log = require('../../../ivis-core/server/lib/log');
const signalSets = require('../../../ivis-core/server/models/signal-sets');
const { SignalType } = require('../../../ivis-core/shared/signals');
const contextHelpers = require('../../../ivis-core/server/lib/context-helpers');
const namespaces = require('../../../ivis-core/server/models/namespaces');

/*
async function ensureCampaignTracker() {
    const schema = {
        type: {
            type: SignalType.INTEGER,
            name: 'Type',
            settings: {},
            indexed: true,
            weight_list: 0,
            weight_edit: 0
        },
        timestamp: {
            type: SignalType.DATE_TIME,
            name: 'Timestamp',
            settings: {},
            indexed: true,
            weight_list: 1,
            weight_edit: 1
        },
        campaignId: {
            type: SignalType.INTEGER,
            name: 'Campaign ID',
            settings: {},
            indexed: true,
            weight_list: 2,
            weight_edit: 2
        },
        listId: {
            type: SignalType.INTEGER,
            name: 'List ID',
            settings: {},
            indexed: true,
            weight_list: 3,
            weight_edit: 3
        },
        subscriptionId: {
            type: SignalType.INTEGER,
            name: 'Subscription ID',
            settings: {},
            indexed: true,
            weight_list: 4,
            weight_edit: 4
        },

    };

    return await signalSets.ensure(
        req.context,
        'campaignTracker',
        schema,
        'Campaign Tracker',
        '',
        config.mailtrain.namespace
    );
}

async function ingestCampaignTrackerRecord(record) {
    return {
        id: TODO
    };
}

const types = {
    campaign_tracker: {
        ensure: ensureCampaignTracker,
        ingest: ingestCampaignTrackerRecord
    }
}

router.postAsync('/events', async (req, res) => {
    const batch = req.body;

    const recordsByType = {};
    const signalSetWithSignalMapByType = {};

    for (const type in types) {
        recordsByType[type] = [];
        signalSetWithSignalMapByType[type] = await types[type].ensure();
    }

    for (const dataEntry of batch.data) {
        const record = {
            id: dataEntry[idField],
            signals: {}
        };

        for (const fieldId in dataEntry) {
            if (fieldId !== idField) {
                if (!(fieldId in schema)) {
                    throw new Error(`Unknown data field "${fieldId}`);
                }

                let value = dataEntry[fieldId];
                if (schema[fieldId].type === SignalType.DATE_TIME) {
                    value = moment(value);
                }

                record.signals[fieldId] = value;
            }
        }

        records.push(record);
    }

    await signalSets.insertRecords(req.context, signalSetWithSignalMap, records);

    return res.json();
});
*/

module.exports = router;
