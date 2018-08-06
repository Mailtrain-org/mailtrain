'use strict';

const knex = require('../lib/knex');
const path = require('path');
const log = require('npmlog');
const fsExtra = require('fs-extra-promise');
const {ImportType, ImportStatus, RunStatus} = require('../shared/imports');
const imports = require('../models/imports');

const csvparse = require('csv-parse');
const fs = require('fs');

let running = false;

function prepareCsv(impt) {
    async function finishWithError(msg, err) {
        if (finished) {
            return;
        }

        finished = true;
        log.error('Importer (CSV)', err.stack);

        await knex('imports').where('id', impt.id).update({
            status: ImportStatus.PREP_FAILED,
            error: msg + '\n' + err.stack
        });

        await fsExtra.removeAsync(filePath);
    }

    async function finishWithSuccess() {
        if (finished) {
            return;
        }

        finished = true;
        log.info('Importer (CSV)', 'Preparation finished');

        await knex('imports').where('id', impt.id).update({
            status: ImportStatus.PREP_FINISHED,
            error: null
        });

        await fsExtra.removeAsync(filePath);
    }

    // Processing of CSV intake
    const filePath = path.join(imports.filesDir, impt.settings.csv.filename);

    const parser = csvparse({
        comment: '#',
        delimiter: impt.settings.csv.delimiter
    });

    const inputStream = fs.createReadStream(filePath);
    let finished;

    inputStream.on('error', err => finishWithError('Error reading CSV file.', err));
    parser.on('error', err => finishWithError('Error parsing CSV file.', err));

    let firstRow;
    let processing = false;
    const processRows = () => {
        const record = parser.read();
        if (record === null) {
            processing = false;
            return;
        }
        processing = true;

        if (!firstRow) {
            firstRow = record;
            console.log(record);
            return setImmediate(processRows);

        }

        console.log(record);
        return setImmediate(processRows);
    };

    parser.on('readable', () => {
        if (finished || processing) {
            return;
        }
        processRows();
    });

    parser.on('finish', () => {
        finishWithSuccess();
    });

    inputStream.pipe(parser);
}

async function getTask() {
    await knex.transaction(async tx => {
        const impt = await tx('imports').whereIn('status', [ImportStatus.PREP_SCHEDULED, ImportStatus.RUN_SCHEDULED]).orderBy('created', 'asc').first();

        if (impt) {
            impt.settings = JSON.parse(impt.settings);

            if (impt.type === ImportType.CSV_FILE && impt.status === ImportStatus.PREP_SCHEDULED) {
                await tx('imports').where('id', impt.id).update('status', ImportStatus.PREP_RUNNING);
                return () => prepareCsv(impt);
            }

        } else {
            return null;
        }
    })
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
            run()
        }
    }
});

process.send({
    type: 'importer-started'
});

