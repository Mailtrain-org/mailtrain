'use strict';

const config = require('config');
const log = require('../lib/log');
const mailers = require('../lib/mailers');
const messageSender = require('../lib/message-sender');
require('../lib/fork');

const workerId = Number.parseInt(process.argv[2]);
let running = false;

async function processCampaignMessages(campaignId, messages) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    const cs = new MessageSender();
    await cs.initByCampaignId(campaignId);

    let withErrors = false;

    for (const msgData of messages) {
        try {
            await cs.sendRegularMessage(msgData.listId, msgData.email);

            log.verbose('Senders', 'Message sent and status updated for %s:%s', msgData.listId, msgData.email);
        } catch (err) {

            if (err instanceof mailers.SendConfigurationError) {
                log.error('Senders', `Sending message to ${msgData.listId}:${msgData.email} failed with error: ${err.message}. Will retry the message if within retention interval.`);
                withErrors = true;
                break;

            } else {
                log.error('Senders', `Sending message to ${msgData.listId}:${msgData.email} failed with error: ${err.message}. Dropping the message.`);
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

    for (const msgData of messages) {
        const queuedMessage = msgData.queuedMessage;
        try {
            await messageSender.sendQueuedMessage(queuedMessage);
            log.verbose('Senders', 'Message sent and status updated for %s:%s', queuedMessage.list, queuedMessage.subscription);
        } catch (err) {
            if (err instanceof mailers.SendConfigurationError) {
                log.error('Senders', `Sending message to ${queuedMessage.list}:${queuedMessage.subscription} failed with error: ${err.message}. Will retry the message if within retention interval.`);
                withErrors = true;
                break;
            } else {
                log.error('Senders', `Sending message to ${queuedMessage.list}:${queuedMessage.subscription} failed with error: ${err.message}. Dropping the message.`);
                log.verbose(err.stack);
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


