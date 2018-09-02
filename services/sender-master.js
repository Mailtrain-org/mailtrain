'use strict';

const config = require('config');
const fork = require('child_process').fork;
const log = require('npmlog');
const path = require('path');
const knex = require('../lib/knex');

let messageTid = 0;
let workerProcesses = new Map();

let running = false;

/*
const path = require('path');
const log = require('npmlog');
const fsExtra = require('fs-extra-promise');
const {ImportSource, MappingType, ImportStatus, RunStatus} = require('../shared/imports');
const imports = require('../models/imports');
const fields = require('../models/fields');
const subscriptions = require('../models/subscriptions');
const { Writable } = require('stream');
const { cleanupFromPost, enforce } = require('../lib/helpers');
const contextHelpers = require('../lib/context-helpers');
const tools = require('../lib/tools');
const shares = require('../models/shares');
const _ = require('../lib/translate')._;
*/


async function processCampaign(campaignId) {
    const campaignSubscribersTable = 'campaign__' + campaignId;


}

async function spawnWorker(workerId) {
    return await new Promise((resolve, reject) => {
        log.verbose('Senders', `Spawning worker process ${workerId}`);

        const senderProcess = fork(path.join(__dirname, 'sender-worker.js'), [workerId], {
            cwd: path.join(__dirname, '..'),
            env: {NODE_ENV: process.env.NODE_ENV}
        });

        senderProcess.on('message', msg => {
            if (msg) {
                if (msg.type === 'worker-started') {
                    log.info('Senders', `Worker process ${workerId} started`);
                    return resolve();
                }
            }
        });

        senderProcess.on('close', (code, signal) => {
            log.error('Senders', `Worker process ${workerId} exited with code %s signal %s`, code, signal);
        });

        workerProcesses.set(workerId, senderProcess);
    });
}

async function run() {
    if (running) {
        return;
    }

    running = true;

    // FIXME

    running = false;
}

function sendToWorker(workerId, msgType, data) {
    workerProcesses.get(workerId).send({
        type: msgType,
        data,
        tid: messageTid
    });

    messageTid++;
}

async function init() {
    const spawnWorkerFutures = [];
    let workerId;
    for (workerId = 0; workerId < config.queue.processes; workerId++) {
        spawnWorkerFutures.push(spawnWorker(workerId));
    }

    await Promise.all(spawnWorkerFutures);

    process.on('message', msg => {
        if (msg) {
            const type = msg.type;

            if (type === 'scheduleCheck') {
                // FIXME

            } else if (type === 'reloadConfig') {
                for (const worker of workerProcesses.keys()) {
                    sendToWorker(workerId, 'reloadConfig', msg.data);
                }
            }
        }
    });

    process.send({
        type: 'sender-started'
    });

    run();
}

init();

