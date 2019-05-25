'use strict';

const knex = require('./knex');
const fork = require('./fork').fork;
const log = require('./log');
const path = require('path');
const {ImportStatus, RunStatus} = require('../../shared/imports');
const {ListActivityType} = require('../../shared/activity-log');
const activityLog = require('./activity-log');
const bluebird = require('bluebird');

let messageTid = 0;
let importerProcess;

function spawn(callback) {
    log.verbose('Importer', 'Spawning importer process');

    knex.transaction(async tx => {
        const updateStatus = async (fromStatus, toStatus) => {
            for (const impt of await tx('imports').where('status', fromStatus).select(['id', 'list'])) {
                await tx('imports').where('id', impt.id).update({status: toStatus});
                await activityLog.logEntityActivity('list', ListActivityType.IMPORT_STATUS_CHANGE, impt.list, {importId: impt.id, importStatus: toStatus});
            }
        }

        await updateStatus(ImportStatus.PREP_RUNNING, ImportStatus.PREP_SCHEDULED);
        await updateStatus(ImportStatus.PREP_STOPPING, ImportStatus.PREP_FAILED);
        await updateStatus(ImportStatus.RUN_RUNNING, ImportStatus.RUN_SCHEDULED);
        await updateStatus(ImportStatus.RUN_STOPPING, ImportStatus.RUN_FAILED);

        await tx('import_runs').where('status', RunStatus.RUNNING).update({status: RunStatus.SCHEDULED});
        await tx('import_runs').where('status', RunStatus.STOPPING).update({status: RunStatus.FAILED});

    }).then(() => {
        importerProcess = fork(path.join(__dirname, '..', 'services', 'importer.js'), [], {
            cwd: path.join(__dirname, '..'),
            env: {NODE_ENV: process.env.NODE_ENV}
        });

        importerProcess.on('message', msg => {
            if (msg) {
                if (msg.type === 'importer-started') {
                    log.info('Importer', 'Importer process started');
                    return callback();
                }
            }
        });

        importerProcess.on('close', (code, signal) => {
            log.error('Importer', 'Importer process exited with code %s signal %s', code, signal);
        });
    });
}

function scheduleCheck() {
    importerProcess.send({
        type: 'scheduleCheck',
        tid: messageTid
    });

    messageTid++;
}

module.exports.spawn = bluebird.promisify(spawn);
module.exports.scheduleCheck = scheduleCheck;