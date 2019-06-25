'use strict';

const config = require('config');
const fork = require('../lib/fork').fork;
const log = require('../lib/log');
const path = require('path');
const knex = require('../lib/knex');
const {CampaignStatus, CampaignType} = require('../../shared/campaigns');
const campaigns = require('../models/campaigns');
const builtinZoneMta = require('../lib/builtin-zone-mta');
const {CampaignActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');
const {MessageType} = require('../lib/campaign-sender')
require('../lib/fork');

class Notifications {
    constructor() {
        this.conts = new Map();
    }

    notify(id) {
        const cont = this.conts.get(id);
        if (cont) {
            for (const cb of cont) {
                setImmediate(cb);
            }
            this.conts.delete(id);
        }
    }

    async waitFor(id) {
        let cont = this.conts.get(id);
        if (!cont) {
            cont = [];
        }

        const notified = new Promise(resolve => {
            cont.push(resolve);
        });

        this.conts.set(id, cont);

        await notified;
    }
}

const notifier = new Notifications();

let messageTid = 0;
const workerProcesses = new Map();

const workersCount = config.queue.processes;
const idleWorkers = [];

let campaignSchedulerRunning = false;
let queuedSchedulerRunning = false;

const campaignsCheckPeriod = 30 * 1000;
const retrieveBatchSize = 1000;
const workerBatchSize = 10;

const sendConfigurationMessageQueue = new Map(); // sendConfigurationId -> [{queuedMessage}]
const campaignMessageQueue = new Map(); // campaignId -> [{listId, email}]

const workAssignment = new Map(); // workerId -> { campaignId, messages: [{listId, email} } / { sendConfigurationId, messages: [{queuedMessage}] }


function messagesProcessed(workerId) {
    const wa = workAssignment.get(workerId);

    workAssignment.delete(workerId);
    idleWorkers.push(workerId);

    notifier.notify('workerFinished');
}

async function workersLoop() {
    const reservedWorkersForTestCount = workersCount > 1 ? 1 : 0;

    async function getAvailableWorker() {
        while (idleWorkers.length === 0) {
            await notifier.waitFor('workerFinished');
        }

        return idleWorkers.shift();
    }

    function assignCampaignTaskToWorker(workerId, task) {
        const campaignId = task.campaignId;
        const queue = task.queue;

        const messages = queue.splice(0, workerBatchSize);
        workAssignment.set(workerId, {campaignId, messages});

        if (queue.length === 0) {
            notifier.notify(`campaignMessageQueueEmpty:${campaignId}`);
        }

        sendToWorker(workerId, 'process-campaign-messages', {
            campaignId,
            messages
        });
    }

    function assignSendConfigurationTaskToWorker(workerId, task) {
        const sendConfigurationId = task.sendConfigurationId;
        const queue = task.queue;

        const messages = queue.splice(0, workerBatchSize);
        workAssignment.set(workerId, {sendConfigurationId, messages});

        if (queue.length === 0) {
            notifier.notify(`sendConfigurationMessageQueueEmpty:${sendConfigurationId}`);
        }

        sendToWorker(workerId, 'process-queued-messages', {
            sendConfigurationId,
            messages
        });
    }

    function selectNextTask() {
        const allocationMap = new Map();
        const allocation = [];

        function initAllocation(attrName, queues, assignWorkerHandler) {
            for (const id of queues.keys()) {
                const key = attrName + ':' + id;

                const queue = queues.get(id);

                const task = {
                    [attrName]: id,
                    existingWorkers: 0,
                    isEmpty: queue.length === 0,
                    queue,
                    assignWorkerHandler
                };

                allocationMap.set(key, task);
                allocation.push(task);
            }

            for (const wa of workAssignment.values()) {
                if (wa[attrName]) {
                    const key = attrName + ':' + wa[attrName];
                    const task = allocationMap.get(key);
                    task.existingWorkers += 1;
                }
            }
        }

        initAllocation('sendConfigurationId', sendConfigurationMessageQueue, assignSendConfigurationTaskToWorker);
        initAllocation('campaignId', campaignMessageQueue, assignCampaignTaskToWorker);

        let minTask = null;
        let minExistingWorkers;

        for (const task of allocation) {
            if (!task.isEmpty && (minTask === null || minExistingWorkers > task.existingWorkers)) {
                minTask = task;
                minExistingWorkers = task.existingWorkers;
            }
        }

        return minTask;
    }


    while (true) {
        const task = selectNextTask();

        if (task) {
            const workerId = await getAvailableWorker();
            task.assignWorkerHandler(workerId, task);
            
        } else {
            await notifier.waitFor('workAvailable');
        }
    }
}


async function processCampaign(campaignId) {
    const msgQueue = campaignMessageQueue.get(campaignId);

    async function finish(newStatus) {
        const isCompleted = () => {
            if (msgQueue.length > 0) return false;

            let workerRunning = false;

            for (const wa of workAssignment.values()) {
                if (wa.campaignId === campaignId) {
                    workerRunning = true;
                }
            }

            return !workerRunning;
        };

        while (!isCompleted()) {
            await notifier.waitFor('workerFinished');
        }

        campaignMessageQueue.delete(campaignId);

        await knex('campaigns').where('id', campaignId).update({status: newStatus});
        await activityLog.logEntityActivity('campaign', CampaignActivityType.STATUS_CHANGE, campaignId, {status: newStatus});
    }

    try {
        while (true) {
            const cpg = await knex('campaigns').where('id', campaignId).first();

            if (cpg.status === CampaignStatus.PAUSING) {
                msgQueue.splice(0);
                await finish(CampaignStatus.PAUSED);
                return;
            }

            let qryGen;
            await knex.transaction(async tx => {
                qryGen = await campaigns.getSubscribersQueryGeneratorTx(tx, campaignId);
            });

            if (qryGen) {
                let messagesInProcessing = [...msgQueue];
                for (const wa of workAssignment.values()) {
                    if (wa.campaignId === campaignId) {
                        messagesInProcessing = messagesInProcessing.concat(wa.messages);
                    }
                }

                const qry = qryGen(knex)
                    .whereNotIn('pending_subscriptions.email', messagesInProcessing.map(x => x.email))
                    .select(['pending_subscriptions.email', 'campaign_lists.list'])
                    .limit(retrieveBatchSize);
                const subs = await qry;

                if (subs.length === 0) {
                    await finish(CampaignStatus.FINISHED);
                    return;
                }

                for (const sub of subs) {
                    msgQueue.push({
                        listId: sub.list,
                        email: sub.email
                    });
                }

                notifier.notify('workAvailable');

                while (msgQueue.length > 0) {
                    await notifier.waitFor(`campaignMessageQueueEmpty:${campaignId}`);
                }

            } else {
                await finish(CampaignStatus.FINISHED);
                return;
            }
        }
    } catch (err) {
        log.error('Senders', `Sending campaign ${campaignId} failed with error: ${err.message}`);
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
                    await activityLog.logEntityActivity('campaign', CampaignActivityType.STATUS_CHANGE, scheduledCampaign.id, {status: CampaignStatus.SENDING});
                    campaignId = scheduledCampaign.id;
                }
            });

            if (campaignId) {
                campaignMessageQueue.set(campaignId, []);

                // noinspection JSIgnoredPromiseFromCall
                processCampaign(campaignId);

            } else {
                break;
            }
        }
    } catch (err) {
        log.error('Senders', `Scheduling campaigns failed with error: ${err.message}`);
        log.verbose(err.stack);
    }

    campaignSchedulerRunning = false;
}


async function processQueuedBySendConfiguration(sendConfigurationId) {
    const msgQueue = sendConfigurationMessageQueue.get(sendConfigurationId);

    const isCompleted = () => {
        if (msgQueue.length > 0) return false;

        let workerRunning = false;

        for (const wa of workAssignment.values()) {
            if (wa.sendConfigurationId === sendConfigurationId) {
                workerRunning = true;
            }
        }

        return !workerRunning;
    };

    try {
        while (true) {
            let messagesInProcessing = [...msgQueue];
            for (const wa of workAssignment.values()) {
                if (wa.sendConfigurationId === sendConfigurationId) {
                    messagesInProcessing = messagesInProcessing.concat(wa.messages);
                }
            }

            const rows = await knex('queued')
                .orderByRaw(`FIELD(type, ${MessageType.TRIGGERED}, ${MessageType.TEST}) DESC, id ASC`) // This orders MessageType.TEST messages before MessageType.TRIGGERED ones
                .where('send_configuration', sendConfigurationId)
                .whereNotIn('id', messagesInProcessing.map(x => x.queuedMessage.id))
                .limit(retrieveBatchSize);

            if (rows.length === 0) {
                if (isCompleted()) {
                    sendConfigurationMessageQueue.delete(sendConfigurationId);
                    return;

                } else {
                    while (!isCompleted()) {
                        await notifier.waitFor('workerFinished');
                    }

                    // At this point, there might be new messages in the queued that could belong to us. Thus we have to try again instead for returning.
                    continue;
                }
            }

            for (const row of rows) {
                row.data = JSON.parse(row.data);
                msgQueue.push({
                    queuedMessage: row
                });
            }

            notifier.notify('workAvailable');

            while (msgQueue.length > 0) {
                await notifier.waitFor(`sendConfigurationMessageQueueEmpty:${sendConfigurationId}`);
            }
        }
    } catch (err) {
        log.error('Senders', `Sending queued messages for send configuration ${sendConfigurationId} failed with error: ${err.message}`);
        log.verbose(err.stack);
    }
}

async function scheduleQueued() {
    if (queuedSchedulerRunning) {
        return;
    }

    queuedSchedulerRunning = true;

    try {
        while (true) {
            const sendConfigurationsInProcessing = [...sendConfigurationMessageQueue.keys()];

            const rows = await knex('queued')
                .whereNotIn('send_configuration', sendConfigurationsInProcessing)
                .groupBy('send_configuration')
                .select(['send_configuration']);

            for (const row of rows) {
                const sendConfigurationId = row.send_configuration;
                sendConfigurationMessageQueue.set(sendConfigurationId, []);

                // noinspection JSIgnoredPromiseFromCall
                processQueuedBySendConfiguration(sendConfigurationId);
            }
        }
    } catch (err) {
        log.error('Senders', `Scheduling queued messages failed with error: ${err.message}`);
        log.verbose(err.stack);
    }

    queuedSchedulerRunning = false;
}


async function spawnWorker(workerId) {
    return await new Promise((resolve, reject) => {
        log.verbose('Senders', `Spawning worker process ${workerId}`);

        const senderProcess = fork(path.join(__dirname, 'sender-worker.js'), [workerId], {
            cwd: path.join(__dirname, '..'),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                BUILTIN_ZONE_MTA_PASSWORD: builtinZoneMta.getPassword()
            }
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
    scheduleQueued();

    setTimeout(periodicCampaignsCheck, campaignsCheckPeriod);
}

async function init() {
    const spawnWorkerFutures = [];
    let workerId;
    for (workerId = 0; workerId < workersCount; workerId++) {
        spawnWorkerFutures.push(spawnWorker(workerId));
    }

    await Promise.all(spawnWorkerFutures);

    process.on('message', msg => {
        if (msg) {
            const type = msg.type;

            if (type === 'schedule-check') {
                // noinspection JSIgnoredPromiseFromCall
                scheduleCampaigns();
                scheduleQueued();

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

    setImmediate(workersLoop);
}

// noinspection JSIgnoredPromiseFromCall
init();

