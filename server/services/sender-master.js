'use strict';

const config = require('config');
const fork = require('child_process').fork;
const log = require('../lib/log');
const path = require('path');
const knex = require('../lib/knex');
const {CampaignStatus, CampaignType} = require('../../shared/campaigns');
const { enforce } = require('../lib/helpers');
const campaigns = require('../models/campaigns');

let messageTid = 0;
const workerProcesses = new Map();

const idleWorkers = [];

let campaignSchedulerRunning = false;
let queuedSchedulerRunning = false;
let workerSchedulerRunning = false;

const campaignsCheckPeriod = 5 * 1000;
const retrieveBatchSize = 1000;
const workerBatchSize = 100;

const messageQueue = new Map(); // campaignId -> [{listId, email}]
const messageQueueCont = new Map(); // campaignId -> next batch callback

const workAssignment = new Map(); // workerId -> { campaignId, subscribers: [{listId, email}] }

let workerSchedulerCont = null;
let queuedLastId = 0;


function messagesProcessed(workerId) {
    workAssignment.delete(workerId);
    idleWorkers.push(workerId);

    if (workerSchedulerCont) {
        const cont = workerSchedulerCont;
        setImmediate(workerSchedulerCont);
        workerSchedulerCont = null;
    }
}

async function scheduleWorkers() {
    async function getAvailableWorker() {
        if (idleWorkers.length > 0) {
            return idleWorkers.shift();

        } else {
            const workerAvailable = new Promise(resolve => {
                workerSchedulerCont = resolve;
            });

            await workerAvailable;
            return idleWorkers.shift();
        }
    }


    if (workerSchedulerRunning) {
        return;
    }

    workerSchedulerRunning = true;
    let workerId = await getAvailableWorker();

    let keepLooping = true;

    while (keepLooping) {
        keepLooping = false;

        for (const campaignId of messageQueue.keys()) {
            const queue = messageQueue.get(campaignId);

            if (queue.length > 0) {
                const subscribers = queue.splice(0, workerBatchSize);
                workAssignment.set(workerId, {campaignId, subscribers});

                if (queue.length === 0 && messageQueueCont.has(campaignId)) {
                    const scheduleMessages = messageQueueCont.get(campaignId);
                    setImmediate(scheduleMessages);
                }

                sendToWorker(workerId, 'process-messages', {
                    campaignId,
                    subscribers
                });
                workerId = await getAvailableWorker();

                keepLooping = true;
            }
        }
    }

    idleWorkers.push(workerId);

    workerSchedulerRunning = false;
}



async function processCampaign(campaignId) {
    async function finish() {
        await knex('campaigns').where('id', campaignId).update({status: CampaignStatus.FINISHED});
        messageQueue.delete(campaignId);
    }

    const msgQueue = [];
    messageQueue.set(campaignId, msgQueue);

    try {
        while (true) {
            const cpg = await knex('campaigns').where('id', campaignId).first();

            if (cpg.status === CampaignStatus.PAUSED) {
                messageQueue.delete(campaignId);
                return;
            }

            let qryGen;
            await knex.transaction(async tx => {
                qryGen = await campaigns.getSubscribersQueryGeneratorTx(tx, campaignId, true);
            });

            if (qryGen) {
                let subscribersInProcessing = [...msgQueue];
                for (const wa of workAssignment.values()) {
                    if (wa.campaignId === campaignId) {
                        subscribersInProcessing = subscribersInProcessing.concat(wa.subscribers);
                    }
                }

                const qry = qryGen(knex)
                    .whereNotIn('pending_subscriptions.email', subscribersInProcessing.map(x => x.email))
                    .select(['pending_subscriptions.email', 'campaign_lists.list'])
                    .limit(retrieveBatchSize);
                const subs = await qry;

                if (subs.length === 0) {
                    await finish();
                    return;
                }

                for (const sub of subs) {
                    msgQueue.push({
                        listId: sub.list,
                        email: sub.email
                    });
                }

                const nextBatchNeeded = new Promise(resolve => {
                    messageQueueCont.set(campaignId, resolve);
                });

                setImmediate(scheduleWorkers);

                await nextBatchNeeded;

            } else {
                await finish();
                return;
            }
        }
    } catch (err) {
        log.error('Senders', `Sending campaign ${campaignId} failed with error: ${err.message}`)
        log.verbose(err.stack);
    }
}


async function scheduleCampaigns() {
    if (campaignSchedulerRunning) {
        return;
    }

    campaignSchedulerRunning = true;

    try {
        while (true) {
            let campaignId = 0;

            await knex.transaction(async tx => {
                const scheduledCampaign = await tx('campaigns')
                    .whereIn('campaigns.type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
                    .where('campaigns.status', CampaignStatus.SCHEDULED)
                    .where(qry => qry.whereNull('campaigns.scheduled').orWhere('campaigns.scheduled', '<=', new Date()))
                    .select(['id'])
                    .first();

                if (scheduledCampaign) {
                    await tx('campaigns').where('id', scheduledCampaign.id).update({status: CampaignStatus.SENDING});
                    campaignId = scheduledCampaign.id;
                }
            });

            if (campaignId) {
                // noinspection JSIgnoredPromiseFromCall
                processCampaign(campaignId);

            } else {
                break;
            }
        }
    } catch (err) {
        log.error('Senders', `Scheduling campaigns failed with error: ${err.message}`)
        log.verbose(err.stack);
    }


    campaignSchedulerRunning = false;
}


async function processQueued() {
    if (queuedSchedulerRunning) {
        return;
    }

    queuedSchedulerRunning = true;

    try {
        while (true) {
            const rows = await knex('queued')
                .orderBy('id', 'asc')
                .where('id', '>', queuedLastId)
                .limit(retrieveBatchSize);

            if (rows.length === 0) {
                break;
            }

            for (const row of rows) {
                let msgQueue = messageQueue.get(row.campaign);
                if (!msgQueue) {
                    msgQueue = [];
                    messageQueue.set(row.campaign, msgQueue);
                }

                msgQueue.push({
                    listId: row.list,
                    subscriptionId: row.subscription
                });
            }

            queuedLastId = rows[rows.length - 1].id;

            setImmediate(scheduleWorkers);
        }
    } catch (err) {
        log.error('Senders', `Processing queued messages failed with error: ${err.message}`)
        log.verbose(err.stack);
    }

    queuedSchedulerRunning = false;
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

                } else if (msg.type === 'messages-processed') {
                    messagesProcessed(workerId);
                }

            }
        });

        senderProcess.on('close', (code, signal) => {
            log.error('Senders', `Worker process ${workerId} exited with code %s signal %s`, code, signal);
        });

        workerProcesses.set(workerId, senderProcess);
        idleWorkers.push(workerId);
    });
}

function sendToWorker(workerId, msgType, data) {
    workerProcesses.get(workerId).send({
        type: msgType,
        data,
        tid: messageTid
    });

    messageTid++;
}


function periodicCampaignsCheck() {
    // noinspection JSIgnoredPromiseFromCall
    scheduleCampaigns();

    // noinspection JSIgnoredPromiseFromCall
    processQueued();

    setTimeout(periodicCampaignsCheck, campaignsCheckPeriod);
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

            if (type === 'schedule-check') {
                // noinspection JSIgnoredPromiseFromCall
                scheduleCampaigns();

            } else if (type === 'reload-config') {
                for (const workerId of workerProcesses.keys()) {
                    sendToWorker(workerId, 'reload-config', msg.data);
                }
            }
        }
    });

    if (config.title) {
        process.title = config.title + ': sender/master';
    }

    process.send({
        type: 'master-sender-started'
    });

    periodicCampaignsCheck();
}

// noinspection JSIgnoredPromiseFromCall
init();

