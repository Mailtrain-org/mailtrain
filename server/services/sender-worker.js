'use strict';

const config = require('../lib/config');
const log = require('../lib/log');
const mailers = require('../lib/mailers');
const messageSender = require('../lib/message-sender');
const {CampaignTrackerActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');

// TODO - use extension manager to add check to cleanExit (in fork) that waits for sendRegularCampaignMessage or sendQueuedMessage to finish
require('../lib/fork');

const MessageType = messageSender.MessageType;

const workerId = Number.parseInt(process.argv[2]);
let running = false;

async function processCampaignMessages(campaignId, messages) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    const cs = new messageSender.MessageSender();
    await cs.initByCampaignId(campaignId);

    let withErrors = false;

    for (const campaignMessage of messages) {
        try {
            await cs.sendRegularCampaignMessage(campaignMessage);

            await activityLog.logCampaignTrackerActivity(CampaignTrackerActivityType.SENT, campaignId, campaignMessage.list, campaignMessage.subscription);

            log.verbose('Senders', 'Message sent and status updated for %s:%s', campaignMessage.list, campaignMessage.subscription);
        } catch (err) {

            if (err instanceof mailers.SendConfigurationError) {
                log.error('Senders', `Sending message to ${campaignMessage.list}:${campaignMessage.subscription} failed with error: ${err.message}. Will retry the message if within retention interval.`);
                withErrors = true;
                break;
            } else {
                log.error('Senders', `Sending message to ${campaignMessage.list}:${campaignMessage.subscription} failed with error: ${err.message}.`);

                log.verbose(err.code);
                log.verbose(err.response);
                log.verbose(err.responseCode);
                log.verbose(err.stack);
            }
        }
    }

    running = false;

    sendToMaster('messages-processed', { withErrors });
}

async function processQueuedMessages(sendConfigurationId, messages) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    let withErrors = false;

    for (const queuedMessage of messages) {

        const messageType = queuedMessage.type;

        const msgData = queuedMessage.data;
        let target = '';
        if (msgData.listId && msgData.subscriptionId) {
            target = `${msgData.listId}:${msgData.subscriptionId}`;
        } else if (msgData.to) {
            if (msgData.to.name && msgData.to.address) {
                target = `${msgData.to.name} <${msgData.to.address}>`;
            } else if (msgData.to.address) {
                target = msgData.to.address;
            } else {
                target = msgData.to.toString();
            }
        }

        try {
            await messageSender.sendQueuedMessage(queuedMessage);

            if ((messageType === MessageType.TRIGGERED || messageType === MessageType.TEST) && msgData.campaignId && msgData.listId && msgData.subscriptionId) {
                await activityLog.logCampaignTrackerActivity(CampaignTrackerActivityType.SENT, msgData.campaignId, msgData.listId, msgData.subscriptionId);
            }

            log.verbose('Senders', `Message sent and status updated for ${target}`);
        } catch (err) {
            if (err instanceof mailers.SendConfigurationError) {
                log.error('Senders', `Sending message to ${target} failed with error: ${err.message}. Will retry the message if within retention interval.`);
                withErrors = true;
                break;
            } else {
                log.error('Senders', `Sending message to ${target} failed with error: ${err.message}. Dropping the message.`);
                log.verbose(err.stack);

                try {
                    await messageSender.dropQueuedMessage(queuedMessage);
                } catch (err) {
                    log.error(err.stack);
                }
            }
        }
    }

    running = false;

    sendToMaster('messages-processed', { withErrors });
}

function sendToMaster(msgType, data) {
    process.send({
        type: msgType,
        data
    });
}

process.on('message', msg => {
    if (msg) {
        const type = msg.type;

        if (type === 'reload-config') {
            mailers.invalidateMailer(msg.data.sendConfigurationId);

        } else if (type === 'process-campaign-messages') {
            // noinspection JSIgnoredPromiseFromCall
            processCampaignMessages(msg.data.campaignId, msg.data.messages)

        } else if (type === 'process-queued-messages') {
            // noinspection JSIgnoredPromiseFromCall
            processQueuedMessages(msg.data.sendConfigurationId, msg.data.messages)
        }
    }
});

if (config.title) {
    process.title = config.title + ': sender/worker ' + workerId;
}

sendToMaster('worker-started');


