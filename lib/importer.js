'use strict';

const knex = require('./knex');
const fork = require('child_process').fork;
const log = require('./log');
const path = require('path');
const {ImportStatus, RunStatus} = require('../shared/imports');

let messageTid = 0;
let importerProcess;

module.exports = {
    spawn,
    scheduleCheck
};

function spawn(callback) {
    log.verbose('Importer', 'Spawning importer process');

    knex.transaction(async tx => {
        await tx('imports').where('status', ImportStatus.PREP_RUNNING).update({status: ImportStatus.PREP_SCHEDULED});
        await tx('imports').where('status', ImportStatus.PREP_STOPPING).update({status: ImportStatus.PREP_FAILED});

        await tx('imports').where('status', ImportStatus.RUN_RUNNING).update({status: ImportStatus.RUN_SCHEDULED});
        await tx('imports').where('status', ImportStatus.RUN_STOPPING).update({status: ImportStatus.RUN_FAILED});

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


