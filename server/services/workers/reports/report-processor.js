'use strict';

const reports = require('../../../models/reports');
const reportTemplates = require('../../../models/report-templates');
const lists = require('../../../models/lists');
const subscriptions = require('../../../models/subscriptions');
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
            getCampaignOpenStatistics: reports.getCampaignOpenStatistics,
            getCampaignClickStatistics: reports.getCampaignClickStatistics,
            getCampaignLinkClickStatistics: reports.getCampaignLinkClickStatistics,
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

            renderCsvFromStream: async (readable, opts) => {
                const stringifier = csvStringify(opts);

                const finished = new Promise((success, fail) => {
                    stringifier.on('finish', () => success())
                    stringifier.on('error', (err) => fail(err))
                });

                stringifier.pipe(process.stdout);
                readable.pipe(stringifier);

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

