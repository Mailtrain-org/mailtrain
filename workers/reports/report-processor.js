'use strict';

const reports = require('../../models/reports');
const reportTemplates = require('../../models/report-templates');
const lists = require('../../models/lists');
const subscriptions = require('../../models/subscriptions');
const campaigns = require('../../models/campaigns');
const handlebars = require('handlebars');
const handlebarsHelpers = require('../../lib/handlebars-helpers');
const _ = require('../../lib/translate')._;
const hbs = require('hbs');
const vm = require('vm');
const log = require('npmlog');
const fs = require('fs');
const knex = require('../../lib/knex');
const contextHelpers = require('../../lib/context-helpers');


handlebarsHelpers.registerHelpers(handlebars);

const userFieldGetters = {
    'campaign': campaigns.getById,
    'list': lists.getById
};


async function main() {
    try {
        const context = contextHelpers.getServiceContext();

        const reportId = Number(process.argv[2]);

        const report = await reports.getByIdWithTemplate(context, reportId);

        const inputs = {};

        for (const spec of report.user_fields) {
            const getter = userFieldGetters[spec.type];
            if (!getter) {
                throw new Error(_('Unknown user field type "' + spec.type + '".'));
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
            getResults: (campaign, select, extra) => reports.getCampaignResults(context, campaign, select, extra),
            getById: campaigns.getById
        };

        const subscriptionsProxy = {
            list: subscriptions.list
        };

        const sandbox = {
            console,
            campaigns: campaignsProxy,
            subscriptions: subscriptionsProxy,
            knex,
            process,
            inputs,

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

