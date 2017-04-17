'use strict';

const reports = require('../lib/models/reports');
const reportTemplates = require('../lib/models/report-templates');
const lists = require('../lib/models/lists');
const campaigns = require('../lib/models/campaigns');
const handlebars = require('handlebars');
const handlebarsHelpers = require('../lib/handlebars-helpers');
const _ = require('../lib/translate')._;
const hbs = require('hbs');
const vm = require('vm');
const log = require('npmlog');
const fs = require('fs');
const path = require('path');
const fsTools = require('../lib/fs-tools');

handlebarsHelpers.registerHelpers(handlebars);

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

function doneSuccess(id) {
    // TODO: Mark in the DB as completed + update the date/time
    // TODO update the report filename in the DB

    process.exit(0);
}

function doneFail(id) {
    // TODO: Mark in the DB as failed
    process.exit(1);
}

function start(id) {
    // TODO: Mark in the DB as running
}

// TODO: Retrieve report task from the DB and run it

function processReport(reportId) {
    reports.get(reportId, (err, report) => {
        if (err || !report) {
            log.error('reports', err && err.message || err || _('Could not find report with specified ID'));
            doneFail(reportId);
        }

        reportTemplates.get(report.reportTemplate, (err, reportTemplate) => {
            if (err) {
                log.error('reports', err && err.message || err || _('Could not find report template'));
                doneFail(reportId);
            }

            resolveUserFields(reportTemplate.userFieldsObject, report.paramsObject, (err, inputs) => {
                if (err) {
                    log.error('reports', err.message || err);
                    doneFail(reportId);
                }

                const filename = fsTools.nameToFileName(report.name);

                const sandbox = {
                    require: require,
                    inputs: inputs,
                    callback: (err, outputs) => {
                        if (err) {
                            log.error('reports', err.message || err);
                            doneFail(reportId);
                        }

                        const hbsTmpl = handlebars.compile(reportTemplate.hbs);
                        const reportText = hbsTmpl(outputs);

                        fs.writeFile(path.join(__dirname, '../protected/reports', filename + '.report'), reportText, (err, reportContent) => {
                            if (err) {
                                log.error('reports', err && err.message || err || _('Could not find report with specified ID'));
                                doneFail(reportId);
                            }

                            doneSuccess(reportId, filename);
                            process
                        });
                    }
                };

                const script = new vm.Script(reportTemplate.js);
                script.runInNewContext(sandbox, {displayErrors: true, timeout: 120000});
            });
        });
    });
}

processReport(1);
