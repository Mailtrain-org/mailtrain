'use strict';

const reports = require('../../lib/models/reports');
const reportTemplates = require('../../lib/models/report-templates');
const lists = require('../../lib/models/lists');
const subscriptions = require('../../lib/models/subscriptions');
const campaigns = require('../../lib/models/campaigns');
const handlebars = require('handlebars');
const handlebarsHelpers = require('../../lib/handlebars-helpers');
const _ = require('../../lib/translate')._;
const hbs = require('hbs');
const vm = require('vm');
const log = require('npmlog');
const fs = require('fs');

handlebarsHelpers.registerHelpers(handlebars);

let reportId = Number(process.argv[2]);
let reportDir;

function resolveEntities(getter, ids, callback) {
    const idsRemaining = ids.slice();
    const resolved = [];

    function doWork() {
        if (idsRemaining.length == 0) {
            return callback(null, resolved);
        }

        getter(idsRemaining.shift(), (err, entity) => {
            if (err) {
                return callback(err);
            }

            resolved.push(entity);
            return doWork();
        });
    }

    setImmediate(doWork);
}

const userFieldTypeToGetter = {
    'campaign': (id, callback) => campaigns.get(id, false, callback),
    'list': lists.get
};

function resolveUserFields(userFields, params, callback) {
    const userFieldsRemaining = userFields.slice();
    const resolved = {};

    function doWork() {
        if (userFieldsRemaining.length == 0) {
            return callback(null, resolved);
        }

        const spec = userFieldsRemaining.shift();
        const getter = userFieldTypeToGetter[spec.type];

        if (getter) {
            return resolveEntities(getter, params[spec.id], (err, entities) => {
                if (spec.minOccurences == 1 && spec.maxOccurences == 1) {
                    resolved[spec.id] = entities[0];
                } else {
                    resolved[spec.id] = entities;
                }

                doWork();
            });
        } else {
            return callback(new Error(_('Unknown user field type "' + spec.type + '".')));
        }
    }

    setImmediate(doWork);
}

function doneSuccess() {
    process.exit(0);
}

function doneFail() {
    process.exit(1)
}



reports.get(reportId, (err, report) => {
    if (err || !report) {
        log.error('reports', err && err.message || err || _('Could not find report with specified ID'));
        doneFail();
    }

    reportTemplates.get(report.reportTemplate, (err, reportTemplate) => {
        if (err) {
            log.error('reports', err && err.message || err || _('Could not find report template'));
            doneFail();
        }

        resolveUserFields(reportTemplate.userFieldsObject, report.paramsObject, (err, inputs) => {
            if (err) {
                log.error('reports', err.message || err);
                doneFail();
            }

            const campaignsProxy = {
                results: reports.getCampaignResults,
                list: campaigns.list,
                get: campaigns.get
            };

            const subscriptionsProxy = {
                list: subscriptions.list
            };

            const sandbox = {
                console,
                campaigns: campaignsProxy,
                subscriptions: subscriptionsProxy,
                inputs,

                callback: (err, outputs) => {
                    if (err) {
                        log.error('reports', err.message || err);
                        doneFail();
                    }

                    const hbsTmpl = handlebars.compile(reportTemplate.hbs);
                    const reportText = hbsTmpl(outputs);

                    process.stdout.write(reportText);
                    doneSuccess();
                }
            };

            const script = new vm.Script(reportTemplate.js);

            try {
                script.runInNewContext(sandbox, {displayErrors: true, timeout: 120000});
            } catch (err) {
                console.error(err);
                doneFail();
            }
        });
    });
});

