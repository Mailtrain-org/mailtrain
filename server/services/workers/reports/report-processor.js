'use strict';

const reports = require('../../../models/reports');
const lists = require('../../../models/lists');
const subscriptions = require('../../../models/subscriptions');
const { SubscriptionSource, SubscriptionStatus } = require('../../../../shared/lists');
const campaigns = require('../../../models/campaigns');
const handlebars = require('handlebars');
const hbs = require('hbs');
const vm = require('vm');
const log = require('../../../lib/log');
const fs = require('fs');
const knex = require('../../../lib/knex');
const contextHelpers = require('../../../lib/context-helpers');

const csvStringify = require('csv-stringify');
const stream = require('stream');

async function main() {
    try {
        const context = contextHelpers.getAdminContext();

        const userFieldGetters = {
            'campaign': id => campaigns.getById(context, id, false, campaigns.Content.ALL),
            'list': id => lists.getById(context, id)
        };

        const reportId = Number(process.argv[2]);

        const report = await reports.getByIdWithTemplate(context, reportId, false);

        const inputs = {};

        for (const spec of report.user_fields) {
            const getter = userFieldGetters[spec.type];
            if (!getter) {
                throw new Error('Unknown user field type "' + spec.type + '".');
            }

            const entities = [];
            for (const id of report.params[spec.id]) {
                entities.push(await getter(id));
            }

            if (spec.minOccurences == 1 && spec.maxOccurences == 1) {
                inputs[spec.id] = entities[0];
            } else {
                inputs[spec.id] = entities;
            }
        }

        const campaignsProxy = {
            getCampaignStatistics: reports.getCampaignStatistics,
            getCampaignOpenStatistics: reports.getCampaignOpenStatistics,
            getCampaignClickStatistics: reports.getCampaignClickStatistics,
            getCampaignLinkClickStatistics: reports.getCampaignLinkClickStatistics,
            getCampaignStatisticsStream: reports.getCampaignStatisticsStream,
            getCampaignOpenStatisticsStream: reports.getCampaignOpenStatisticsStream,
            getCampaignClickStatisticsStream: reports.getCampaignClickStatisticsStream,
            getCampaignLinkClickStatisticsStream: reports.getCampaignLinkClickStatisticsStream,
            getById: campaignId => campaigns.getById(context, campaignId, false, campaigns.Content.ALL)
        };

        const subscriptionsProxy = {
            list: (listId, grouped, offset, limit) => subscriptions.list(context, listId, grouped, offset, limit)
        };

        const sandbox = {
            console,
            campaigns: campaignsProxy,
            subscriptions: subscriptionsProxy,
            stream,
            knex,
            process,
            inputs,
            SubscriptionSource,
            SubscriptionStatus,

            renderCsvFromStream: async (readable, opts, transform) => {
                const finished = new Promise((success, fail) => {
                    let lastReadable = readable;

                    const stringifier = csvStringify(opts);

                    stringifier.on('finish', () => success());
                    stringifier.on('error', err => fail(err));

                    if (transform) {
                        const rowTransform = new stream.Transform({
                            objectMode: true,
                            transform(row, encoding, callback) {
                                async function performTransform() {
                                    try {
                                        const newRow = await transform(row, encoding);
                                        callback(null, newRow);
                                    } catch (err) {
                                        callback(err);
                                    }
                                }

                                // noinspection JSIgnoredPromiseFromCall
                                performTransform();
                            }
                        });

                        lastReadable.on('error', err => fail(err));
                        lastReadable.pipe(rowTransform);

                        lastReadable = rowTransform;
                    }

                    stringifier.pipe(process.stdout);
                    lastReadable.pipe(stringifier);
                });

                await finished;
            },

            render: data => {
                const hbsTmpl = handlebars.compile(report.hbs);
                const reportText = hbsTmpl(data);

                process.stdout.write(reportText);
            }
        };

        const js =
            '(async function() {' +
            report.js +
            '})().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); })';

        const script = new vm.Script(js);

        script.runInNewContext(sandbox, {displayErrors: true, timeout: 120000});

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();

