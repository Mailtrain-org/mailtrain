'use strict';

const knex = require('../lib/knex');
const path = require('path');
const log = require('npmlog');
const fsExtra = require('fs-extra-promise');
const {ImportSource, MappingType, ImportStatus, RunStatus} = require('../shared/imports');
const imports = require('../models/imports');
const { Writable } = require('stream');
const { enforce } = require('../lib/helpers');

const csvparse = require('csv-parse');
const fs = require('fs');

let running = false;
const maxInsertBatchSize = 100;

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

            if (insertBatch.length >= maxInsertBatchSize) {
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

async function basicSubscribe(impt) {
    let imptRun;
    while (imptRun = await knex('import_runs').where('import', impt.id).whereIn('status', [RunStatus.SCHEDULED]).orderBy('created', 'asc').first()) {
        await knex('import_runs').where('id', imptRun.id).update({
            status: RunStatus.RUNNING
        });



        await knex('import_runs').where('id', imptRun.id).update({
            status: RunStatus.FINISHED
        });
    }

    await knex('imports').where('id', impt.id).update({
        status: ImportStatus.RUN_FINISHED
    });
}

async function basicUnsubscribe(impt) {
    // FIXME
}

async function getTask() {
    return await knex.transaction(async tx => {
        const impt = await tx('imports').whereIn('status', [ImportStatus.PREP_SCHEDULED, ImportStatus.RUN_SCHEDULED]).orderBy('created', 'asc').first();

        if (impt) {
            impt.settings = JSON.parse(impt.settings);

            if (impt.source === ImportSource.CSV_FILE && impt.status === ImportStatus.PREP_SCHEDULED) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.PREP_RUNNING);
                return () => prepareCsv(impt);

            } else if (impt.status === ImportStatus.RUN_SCHEDULED && impt.settings.mappingType === MappingType.BASIC_SUBSCRIBE) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.RUN_RUNNING);
                return () => basicSubscribe(impt);

            } else if (impt.status === ImportStatus.RUN_SCHEDULED && impt.settings.mappingType === MappingType.BASIC_UNSUBSCRIBE) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.RUN_RUNNING);
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

process.send({
    type: 'importer-started'
});

run();

