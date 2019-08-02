'use strict';

const config = require('../lib/config');
const knex = require('../lib/knex');
const path = require('path');
const log = require('../lib/log');
const fsExtra = require('fs-extra-promise');
const {ImportSource, MappingType, ImportStatus, RunStatus} = require('../../shared/imports');
const imports = require('../models/imports');
const fields = require('../models/fields');
const subscriptions = require('../models/subscriptions');
const { Writable } = require('stream');
const { cleanupFromPost, enforce } = require('../lib/helpers');
const contextHelpers = require('../lib/context-helpers');
const tools = require('../lib/tools');
const shares = require('../models/shares');
const { tLog } = require('../lib/translate');
const {ListActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');
require('../lib/fork');


const csvparse = require('csv-parse');
const fs = require('fs');

let running = false;
const maxPrepareBatchSize = 100;
const maxImportBatchSize = 10;

function prepareCsv(impt) {
    // Processing of CSV intake
    const filePath = path.join(imports.filesDir, impt.settings.csv.filename);
    const importTable = 'import_file__' + impt.id;

    let finishedWithError = false;
    let firstRow;

    const finishWithError = async (msg, err) => {
        finishedWithError = true;
        log.error('Importer (CSV)', err.stack);

        await knex('imports').where('id', impt.id).update({
            status: ImportStatus.PREP_FAILED,
            error: msg + '\n' + err.message
        });

        await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.PREP_FAILED});

        await fsExtra.removeAsync(filePath);
    };

    const finishWithSuccess = async () => {
        if (finishedWithError) {
            return;
        }

        log.info('Importer (CSV)', 'Preparation finished');

        await knex('imports').where('id', impt.id).update({
            status: ImportStatus.PREP_FINISHED,
            error: null
        });

        await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.PREP_FINISHED});

        await fsExtra.removeAsync(filePath);
    };

    const processRows = async (chunks) => {
        let insertBatch = [];
        for (const chunkEntry of chunks) {
            const record = chunkEntry.chunk;

            if (!firstRow) {
                firstRow = true;

                const cols = [];
                let colsDef = '';
                for (let idx = 0; idx < record.length; idx++) {
                    const colName = 'column_' + idx;
                    cols.push({
                        column: colName,
                        name: record[idx]
                    });

                    colsDef += '  `' + colName + '` text DEFAULT NULL,\n';
                }

                impt.settings.csv.columns = cols;
                impt.settings.sourceTable = importTable;

                await knex('imports').where({id: impt.id}).update({settings: JSON.stringify(impt.settings)});

                await knex.schema.raw('CREATE TABLE `' + importTable + '` (\n' +
                    '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
                    colsDef +
                    '  PRIMARY KEY (`id`)\n' +
                    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

            } else {
                const dbRecord = {};
                for (let idx = 0; idx < record.length; idx++) {
                    dbRecord['column_' + idx] = record[idx];
                }

                insertBatch.push(dbRecord);
            }

            if (insertBatch.length >= maxPrepareBatchSize) {
                await knex(importTable).insert(insertBatch);
                insertBatch = [];
            }
        }

        if (insertBatch.length > 0) {
            await knex(importTable).insert(insertBatch);
        }
    };


    const inputStream = fs.createReadStream(filePath);
    const parser = csvparse({
        comment: '#',
        delimiter: impt.settings.csv.delimiter
    });

    inputStream.on('error', err => finishWithError('Error reading CSV file.', err));
    parser.on('error', err => finishWithError('Error parsing CSV file.', err));

    const importProcessor = new Writable({
        write(chunk, encoding, callback) {
            processRows([{chunk, encoding}]).then(() => callback());
        },
        writev(chunks, callback) {
            processRows(chunks).then(() => callback());
        },
        final(callback) {
            finishWithSuccess().then(() => callback());
        },
        objectMode: true
    });

    parser.pipe(importProcessor);
    inputStream.pipe(parser);
}

async function _execImportRun(impt, handlers) {
    try {
        let imptRun;

        // It should not really happen that we have more than one run to be processed for an import. However, to be on the safe side, we process it in a while.
        while (imptRun = await knex('import_runs').where('import', impt.id).whereIn('status', [RunStatus.SCHEDULED]).orderBy('created', 'asc').first()) {
            try {
                imptRun.mapping = JSON.parse(imptRun.mapping) || {};

                log.info('Importer', `Starting BASIC_SUBSCRIBE run ${impt.id}.${imptRun.id}`);
                await knex('import_runs').where('id', imptRun.id).update({
                    status: RunStatus.RUNNING
                });

                const importTable = impt.settings.sourceTable;

                const flds = await fields.list(contextHelpers.getAdminContext(), impt.list);

                let lastId = imptRun.last_id || 0;
                let countNew = imptRun.new || 0;
                let countProcessed = imptRun.processed || 0;
                let countFailed = imptRun.failed || 0;

                while (true) {
                    const rows = await knex(importTable).orderBy('id', 'asc').where('id', '>', lastId).limit(maxImportBatchSize);
                    log.verbose('Importer', `Processing run ${impt.id}.${imptRun.id} with id > ${lastId} ... ${rows.length} entries`);

                    if (rows.length === 0) {
                        break;
                    }

                    const subscrs = [];
                    const unsubscrs = [];
                    const failures = [];

                    // This should help in case we do the DNS check inside process row because it does all the checks at the same time.
                    await Promise.all(rows.map(row => handlers.processSourceRow(impt, imptRun, flds, row, subscrs, unsubscrs, failures)));

                    lastId = rows[rows.length - 1].id;

                    await knex.transaction(async tx => {
                        const groupedFieldsMap = await subscriptions.getGroupedFieldsMapTx(tx, impt.list);

                        let newRows = 0;

                        for (const subscr of subscrs) {
                            const meta = {
                                updateAllowed: true,
                                updateOfUnsubscribedAllowed: true,
                                subscribeIfNoExisting: true
                            };

                            try {
                                await subscriptions.createTxWithGroupedFieldsMap(tx, contextHelpers.getAdminContext(), impt.list, groupedFieldsMap, subscr, impt.id, meta);
                                if (!meta.existing) {
                                    newRows += 1;
                                }

                            } catch (err) {
                                failures.push({
                                    run: imptRun.id,
                                    source_id: subscr.source_id,
                                    email: subscr.email,
                                    reason: err.message
                                });
                            }
                        }

                        for (const unsubscr of unsubscrs) {
                            try {
                                await subscriptions.unsubscribeByEmailAndGetTx(tx, contextHelpers.getAdminContext(), impt.list, unsubscr.email);
                            } catch (err) {
                                failures.push({
                                    run: imptRun.id,
                                    source_id: unsubscr.source_id,
                                    email: unsubscr.email,
                                    reason: err.message
                                });
                            }
                        }

                        countProcessed += rows.length;
                        countNew += newRows;
                        countFailed += failures.length;

                        if (failures.length > 0) {
                            await tx('import_failed').insert(failures);
                        }
                        await tx('import_runs').where('id', imptRun.id).update({
                            last_id: lastId,
                            new: countNew,
                            failed: countFailed,
                            processed: countProcessed
                        });
                    });

                    const imptRunStatus = await knex('import_runs').where('id', imptRun.id).select(['status']).first();
                    if (imptRunStatus.status === RunStatus.STOPPING) {
                        throw new Error('Aborted');
                    }
                }

                await knex('import_runs').where('id', imptRun.id).update({
                    status: RunStatus.FINISHED,
                    error: null,
                    finished: new Date()
                });

                log.info('Importer', `BASIC_SUBSCRIBE run ${impt.id}.${imptRun.id} finished`);
            } catch (err) {
                await knex('import_runs').where('id', imptRun.id).update({
                    status: RunStatus.FAILED,
                    error: err.message,
                    finished: new Date()
                });

                throw new Error('Last run failed');
            }
        }

        await knex('imports').where('id', impt.id).update({
            last_run: new Date(),
            error: null,
            status: ImportStatus.RUN_FINISHED
        });

        await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.RUN_FINISHED});

    } catch (err) {
        await knex('imports').where('id', impt.id).update({
            last_run: new Date(),
            error: err.message,
            status: ImportStatus.RUN_FAILED
        });

        await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.PREP_FAILED});
    }
}

async function basicSubscribe(impt) {
    const handlers = {
        processSourceRow: async (impt, imptRun, flds, row, subscriptions, unsubscriptions, failures) => {
            const mappingFields = imptRun.mapping.fields || {};
            const mappingSettings = imptRun.mapping.settings || {};

            const convRow = {};
            for (const col in mappingFields) {
                const fldMapping = mappingFields[col];

                if (fldMapping && fldMapping.column) {
                    convRow[col] = row[fldMapping.column];
                }
            }

            const subscription = fields.fromImport(impt.list, flds, convRow);
            const email = cleanupFromPost(convRow.email);

            let errorMsg;

            if (!email) {
                errorMsg = tLog('missingEmail');
            }

            if (mappingSettings.checkEmails) {
                const emailErr = await tools.validateEmail(email);
                if (emailErr) {
                    errorMsg = tools.validateEmailGetMessage(emailErr, email);
                }
            }

            if (!errorMsg) {
                subscription.email = email;
                subscription.source_id = row.id;
                subscriptions.push(subscription);
            } else {
                failures.push({
                    run: imptRun.id,
                    source_id: row.id,
                    email: email,
                    reason: errorMsg
                });
            }
        }
    };

    return await _execImportRun(impt, handlers);
}

async function basicUnsubscribe(impt) {
    const handlers = {
        processSourceRow: async (impt, imptRun, flds, row, subscriptions, unsubscriptions, failures) => {
            const emailCol = imptRun.mapping.fields.email.column;
            const email = cleanupFromPost(row[emailCol]);

            let errorMsg;

            if (!email) {
                errorMsg = tLog('missingEmail');
            }

            if (!errorMsg) {
                unsubscriptions.push({
                    source_id: row.id,
                    email
                });
            } else {
                failures.push({
                    run: imptRun.id,
                    source_id: row.id,
                    email: email,
                    reason: errorMsg
                });
            }
        }
    };

    return await _execImportRun(impt, handlers);
}

async function getTask() {
    return await knex.transaction(async tx => {
        const impt = await tx('imports').whereIn('status', [ImportStatus.PREP_SCHEDULED, ImportStatus.RUN_SCHEDULED]).orderBy('created', 'asc').first();

        if (impt) {
            impt.settings = JSON.parse(impt.settings) || {};

            if (impt.source === ImportSource.CSV_FILE && impt.status === ImportStatus.PREP_SCHEDULED) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.PREP_RUNNING);
                await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.PREP_RUNNING});

                return () => prepareCsv(impt);

            } else if (impt.status === ImportStatus.RUN_SCHEDULED && impt.mapping_type === MappingType.BASIC_SUBSCRIBE) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.RUN_RUNNING);
                await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.RUN_RUNNING});

                return () => basicSubscribe(impt);

            } else if (impt.status === ImportStatus.RUN_SCHEDULED && impt.mapping_type === MappingType.BASIC_UNSUBSCRIBE) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.RUN_RUNNING);
                await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: ImportStatus.RUN_RUNNING});

                return () => basicUnsubscribe(impt);
            }

        } else {
            return null;
        }
    });
}

async function run() {
    if (running) {
        return;
    }

    running = true;

    let task;
    while ((task = await getTask()) != null) {
        task();
    }

    running = false;
}

process.on('message', msg => {
    if (msg) {
        const type = msg.type;

        if (type === 'scheduleCheck') {
            run();
        }
    }
});

if (config.title) {
    process.title = config.title + ': importer';
}

process.send({
    type: 'importer-started'
});

run();

