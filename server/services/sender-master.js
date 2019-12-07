'use strict';

const config = require('../lib/config');
const fork = require('../lib/fork').fork;
const log = require('../lib/log');
const path = require('path');
const knex = require('../lib/knex');
const {CampaignStatus, CampaignType, CampaignMessageStatus} = require('../../shared/campaigns');
const campaigns = require('../models/campaigns');
const builtinZoneMta = require('../lib/builtin-zone-mta');
const {CampaignActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');
const {MessageType} = require('../lib/message-sender');
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

const checkPeriod = 30 * 1000;
const retrieveBatchSize = 1000;
const workerBatchSize = 10;

const sendConfigurationIdByCampaignId = new Map(); // campaignId -> sendConfigurationId
const sendConfigurationStatuses = new Map(); // sendConfigurationId -> {retryCount, postponeTill}

const sendConfigurationMessageQueue = new Map(); // sendConfigurationId -> [queuedMessage]
const campaignMessageQueue = new Map(); // campaignId -> [campaignMessage]

const workAssignment = new Map(); // workerId -> { type: WorkAssignmentType.CAMPAIGN, campaignId, messages: [campaignMessage] / { type: WorkAssignmentType.QUEUED, sendConfigurationId, messages: [queuedMessage] }

const WorkAssignmentType = {
    CAMPAIGN: 0,
    QUEUED: 1
};

const retryBackoff = [10, 20, 30, 30, 60, 60, 120, 120, 300]; // in seconds

function getSendConfigurationStatus(sendConfigurationId) {
    let status = sendConfigurationStatuses.get(sendConfigurationId);
    if (!status) {
        status = {
            retryCount: 0,
            postponeTill: 0
        };

        sendConfigurationStatuses.set(sendConfigurationId, status);
    }

    return status;
}

function setSendConfigurationRetryCount(sendConfigurationStatus, newRetryCount) {
    sendConfigurationStatus.retryCount = newRetryCount;

    let next = 0;
    if (newRetryCount > 0) {
        let backoff;
        if (newRetryCount > retryBackoff.length) {
            backoff = retryBackoff[retryBackoff.length - 1];
        } else {
            backoff = retryBackoff[newRetryCount - 1];
        }

        next = Date.now() + backoff * 1000;
        setTimeout(scheduleCheck, backoff * 1000);
    }

    sendConfigurationStatus.postponeTill = next;
}

function isSendConfigurationPostponed(sendConfigurationId) {
    const now = Date.now();
    const sendConfigurationStatus = getSendConfigurationStatus(sendConfigurationId);
    return sendConfigurationStatus.postponeTill > now;
}

function getPostponedSendConfigurationIds() {
    const result = [];
    const now = Date.now();

    for (const entry of sendConfigurationStatuses.entries()) {
        if (entry[1].postponeTill > now) {
            result.push(entry[0]);
        }
    }

    return result;
}


function getExpirationThresholds() {
    const now = Date.now();

    return {
        [MessageType.TRIGGERED]: {
            threshold: now - config.queue.retention.triggered * 1000,
            title: 'triggered campaign'
        },
        [MessageType.TEST]: {
            threshold: now - config.queue.retention.test * 1000,
            title: 'test campaign'
        },
        [MessageType.SUBSCRIPTION]: {
            threshold: now - config.queue.retention.subscription * 1000,
            title: 'subscription and password-related'
        },
        [MessageType.API_TRANSACTIONAL]: {
            threshold: now - config.queue.retention.apiTransactional * 1000,
            title: 'transactional (API)'
        }
    };
}


function messagesProcessed(workerId, withErrors) {
    const wa = workAssignment.get(workerId);

    const sendConfigurationStatus = getSendConfigurationStatus(wa.sendConfigurationId);
    if (withErrors) {
        if (sendConfigurationStatus.retryCount === wa.sendConfigurationRetryCount) { // This is to avoid multiple increments when more workers simultaneously fail to send messages ot the same send configuration
            setSendConfigurationRetryCount(sendConfigurationStatus, sendConfigurationStatus.retryCount + 1);
        }
    } else {
        setSendConfigurationRetryCount(sendConfigurationStatus, 0);
    }


    workAssignment.delete(workerId);
    idleWorkers.push(workerId);

    notifier.notify('workerFinished');
}

async function workersLoop() {
    async function getAvailableWorker() {
        while (idleWorkers.length === 0) {
            await notifier.waitFor('workerFinished');
        }

        return idleWorkers.shift();
    }

    function cancelWorker(workerId) {
        idleWorkers.push(workerId);
    }

    function selectNextTask() {
        const allocationMap = new Map();
        const allocation = [];

        function initAllocation(waType, attrName, queues, workerMsg, getSendConfigurationId, getQueueEmptyEvent) {
            for (const id of queues.keys()) {
                const sendConfigurationId = getSendConfigurationId(id);
                const key = attrName + ':' + id;

                const queue = queues.get(id);

                const postponed = isSendConfigurationPostponed(sendConfigurationId);

                const task = {
                    type: waType,
                    id,
                    existingWorkers: 0,
                    isValid: queue.length > 0 && !postponed,
                    queue,
                    workerMsg,
                    attrName,
                    getQueueEmptyEvent,
                    sendConfigurationId
                };

                allocationMap.set(key, task);
                allocation.push(task);

                if (postponed && queue.length > 0) {
                    queue.splice(0);
                    notifier.notify(task.getQueueEmptyEvent(task));
                }
            }

            for (const wa of workAssignment.values()) {
                if (wa.type === waType) {
                    const key = attrName + ':' + wa[attrName];
                    const task = allocationMap.get(key);
                    task.existingWorkers += 1;
                }
            }
        }

        initAllocation(
            WorkAssignmentType.QUEUED,
            'sendConfigurationId',
            sendConfigurationMessageQueue,
            'process-queued-messages',
                id => id,
                task => `sendConfigurationMessageQueueEmpty:${task.id}`
        );

        initAllocation(
            WorkAssignmentType.CAMPAIGN,
            'campaignId',
            campaignMessageQueue,
            'process-campaign-messages',
                id => sendConfigurationIdByCampaignId.get(id),
            task => `campaignMessageQueueEmpty:${task.id}`
        );

        let minTask = null;
        let minExistingWorkers;

        for (const task of allocation) {
            if (task.isValid && (minTask === null || minExistingWorkers > task.existingWorkers)) {
                minTask = task;
                minExistingWorkers = task.existingWorkers;
            }
        }

        return minTask;
    }


    while (true) {
        const workerId = await getAvailableWorker();
        const task = selectNextTask();

        if (task) {
            const attrName = task.attrName;
            const sendConfigurationId = task.sendConfigurationId;
            const sendConfigurationStatus = getSendConfigurationStatus(sendConfigurationId);
            const sendConfigurationRetryCount = sendConfigurationStatus.retryCount;

            const queue = task.queue;

            const messages = queue.splice(0, workerBatchSize);
            workAssignment.set(workerId, {
                type: task.type,
                [attrName]: task.id,
                sendConfigurationId,
                sendConfigurationRetryCount,
                messages
            });

            if (queue.length === 0) {
                notifier.notify(task.getQueueEmptyEvent(task));
            }

            sendToWorker(workerId, task.workerMsg, {
                [attrName]: task.id,
                messages
            });

        } else {
            cancelWorker(workerId);
            await notifier.waitFor('workAvailable');
        }
    }
}


async function processCampaign(campaignId) {
    const msgQueue = campaignMessageQueue.get(campaignId);

    const isCompleted = () => {
        if (msgQueue.length > 0) return false;

        let workerRunning = false;

        for (const wa of workAssignment.values()) {
            if (wa.type === WorkAssignmentType.CAMPAIGN && wa.campaignId === campaignId) {
                workerRunning = true;
            }
        }

        return !workerRunning;
    };

    async function finish(clearMsgQueue, newStatus) {
        if (clearMsgQueue) {
            msgQueue.splice(0);
        }

        while (!isCompleted()) {
            await notifier.waitFor('workerFinished');
        }

        if (newStatus) {
            campaignMessageQueue.delete(campaignId);

            await knex('campaigns').where('id', campaignId).update({status: newStatus});
            await activityLog.logEntityActivity('campaign', CampaignActivityType.STATUS_CHANGE, campaignId, {status: newStatus});
        }
    }


    try {
        await campaigns.prepareCampaignMessages(campaignId);

        while (true) {
            const cpg = await knex('campaigns').where('id', campaignId).first();

            if (cpg.status === CampaignStatus.PAUSING) {
                return await finish(true, CampaignStatus.PAUSED);
            }

            const expirationThreshold = Date.now() - config.queue.retention.campaign * 1000;
            if (cpg.start_at && cpg.start_at.valueOf() < expirationThreshold) {
                return await finish(true, CampaignStatus.FINISHED);
            }

            sendConfigurationIdByCampaignId.set(cpg.id, cpg.send_configuration);

            if (isSendConfigurationPostponed(cpg.send_configuration)) {
                // postpone campaign if its send configuration is problematic
                return await finish(true, CampaignStatus.SCHEDULED);
            }

            let messagesInProcessing = [...msgQueue];
            for (const wa of workAssignment.values()) {
                if (wa.type === WorkAssignmentType.CAMPAIGN && wa.campaignId === campaignId) {
                    messagesInProcessing = messagesInProcessing.concat(wa.messages);
                }
            }

            const subs = await knex('campaign_messages')
                .where({status: CampaignMessageStatus.SCHEDULED, campaign: campaignId})
                .whereNotIn('hash_email', messagesInProcessing.map(x => x.hash_email))
                .limit(retrieveBatchSize);

            if (subs.length === 0) {
                if (isCompleted()) {
                    return await finish(false, CampaignStatus.FINISHED);

                } else {
                    await finish(false);

                    // At this point, there might be messages that re-appeared because sending failed.
                    continue;
                }

            }

            for (const sub of subs) {
                msgQueue.push(sub);
            }

            notifier.notify('workAvailable');

            while (msgQueue.length > 0) {
                await notifier.waitFor(`campaignMessageQueueEmpty:${campaignId}`);
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
        // Finish old campaigns
        const nowDate = new Date();
        const now = nowDate.valueOf();

        const expirationThreshold = new Date(now - config.queue.retention.campaign * 1000);
        const expiredCampaigns = await knex('campaigns')
            .whereIn('campaigns.type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
            .whereIn('campaigns.status', [CampaignStatus.SCHEDULED, CampaignStatus.PAUSED])
            .where('campaigns.start_at', '<', expirationThreshold)
            .update({status: CampaignStatus.FINISHED});

        // Empty message queues for PAUSING campaigns. A pausing campaign typically waits for campaignMessageQueueEmpty before it can check for PAUSING
        // We speed this up by discarding messages in the message queue of the campaign.
        const pausingCampaigns = await knex('campaigns')
            .whereIn('campaigns.type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
            .where('campaigns.status', CampaignStatus.PAUSING)
            .select(['id'])
            .forUpdate();

        for (const cpg of pausingCampaigns) {
            const campaignId = cpg.id;
            const queue = campaignMessageQueue.get(campaignId);
            queue.splice(0);
            notifier.notify(`campaignMessageQueueEmpty:${campaignId}`);
        }


        while (true) {
            let campaignId = 0;
            const postponedSendConfigurationIds = getPostponedSendConfigurationIds();

            await knex.transaction(async tx => {
                const scheduledCampaign = await tx('campaigns')
                    .whereIn('campaigns.type', [CampaignType.REGULAR, CampaignType.RSS_ENTRY])
                    .whereNotIn('campaigns.send_configuration', postponedSendConfigurationIds)
                    .where('campaigns.status', CampaignStatus.SCHEDULED)
                    .where('campaigns.start_at', '<=', nowDate)
                    .select(['id'])
                    .forUpdate()
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
            if (wa.type === WorkAssignmentType.QUEUED && wa.sendConfigurationId === sendConfigurationId) {
                workerRunning = true;
            }
        }

        return !workerRunning;
    };

    async function finish(clearMsgQueue, deleteMsgQueue) {
        if (clearMsgQueue) {
            msgQueue.splice(0);
        }

        while (!isCompleted()) {
            await notifier.waitFor('workerFinished');
        }

        if (deleteMsgQueue) {
            sendConfigurationMessageQueue.delete(sendConfigurationId);
        }
    }


    try {
        while (true) {
            if (isSendConfigurationPostponed(sendConfigurationId)) {
                return await finish(true, true);
            }

            let messagesInProcessing = [...msgQueue];
            for (const wa of workAssignment.values()) {
                if (wa.type === WorkAssignmentType.QUEUED && wa.sendConfigurationId === sendConfigurationId) {
                    messagesInProcessing = messagesInProcessing.concat(wa.messages);
                }
            }

            const messageIdsInProcessing = messagesInProcessing.map(x => x.id);

            const rows = await knex('queued')
                .orderByRaw(`FIELD(type, ${MessageType.TRIGGERED}, ${MessageType.API_TRANSACTIONAL}, ${MessageType.TEST}, ${MessageType.SUBSCRIPTION}) DESC, id ASC`) // This orders messages in the following order MessageType.SUBSCRIPTION, MessageType.TEST, MessageType.API_TRANSACTIONAL and MessageType.TRIGGERED
                .where('send_configuration', sendConfigurationId)
                .whereNotIn('id', messageIdsInProcessing)
                .limit(retrieveBatchSize);

            if (rows.length === 0) {
                if (isCompleted()) {
                    return await finish(false, true);

                } else {
                    await finish(false, false);

                    // At this point, there might be new messages in the queued that could belong to us. Thus we have to try again instead for returning.
                    continue;
                }
            }

            const expirationThresholds = getExpirationThresholds();
            const expirationCounters = {};
            for (const type in expirationThresholds) {
                expirationCounters[type] = 0;
            }

            for (const row of rows) {
                const expirationThreshold = expirationThresholds[row.type];

                if (row.created < expirationThreshold.threshold) {
                    expirationCounters[row.type] += 1;
                    await knex('queued').where('id', row.id).del();

                } else {
                    row.data = JSON.parse(row.data);
                    msgQueue.push(row);
                }
            }

            for (const type in expirationThresholds) {
                const expirationThreshold = expirationThresholds[type];
                if (expirationCounters[type] > 0) {
                    log.warn('Senders', `Discarded ${expirationCounters[type]} expired ${expirationThreshold.title} message(s).`);
                }
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
        const sendConfigurationsIdsInProcessing = [...sendConfigurationMessageQueue.keys()];
        const postponedSendConfigurationIds = getPostponedSendConfigurationIds();

        // prune old messages
        const expirationThresholds = getExpirationThresholds();
        for (const type in expirationThresholds) {
            const expirationThreshold = expirationThresholds[type];

            const expiredCount = await knex('queued')
                .whereNotIn('send_configuration', sendConfigurationsIdsInProcessing)
                .where('type', type)
                .where('created', '<', new Date(expirationThreshold.threshold))
                .del();

            if (expiredCount) {
                log.warn('Senders', `Discarded ${expiredCount} expired ${expirationThreshold.title} message(s).`);
            }
        }

        const rows = await knex('queued')
            .whereNotIn('send_configuration', [...sendConfigurationsIdsInProcessing, ...postponedSendConfigurationIds])
            .groupBy('send_configuration')
            .select(['send_configuration']);

        for (const row of rows) {
            const sendConfigurationId = row.send_configuration;
            sendConfigurationMessageQueue.set(sendConfigurationId, []);

            // noinspection JSIgnoredPromiseFromCall
            processQueuedBySendConfiguration(sendConfigurationId);
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
                    messagesProcessed(workerId, msg.data.withErrors);
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


function scheduleCheck() {
    // noinspection JSIgnoredPromiseFromCall
    scheduleCampaigns();

    // noinspection JSIgnoredPromiseFromCall
    scheduleQueued();
}

function periodicCheck() {
    // noinspection JSIgnoredPromiseFromCall
    scheduleCheck();

    setTimeout(periodicCheck, checkPeriod);
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
                scheduleCheck();

            } else if (type === 'reload-config') {
                const sendConfigurationStatus = getSendConfigurationStatus(msg.data.sendConfigurationId);
                if (sendConfigurationStatus.retryCount > 0) {
                    const sendConfigurationStatus = getSendConfigurationStatus(msg.data.sendConfigurationId)
                    setSendConfigurationRetryCount(sendConfigurationStatus, 0);

                    // noinspection JSIgnoredPromiseFromCall
                    scheduleCheck();
                }

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

    periodicCheck();

    setImmediate(workersLoop);
}

// noinspection JSIgnoredPromiseFromCall
init();
