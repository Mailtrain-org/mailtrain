'use strict';

const config = require('config');
const log = require('../lib/log');
const mailers = require('../lib/mailers');
const {CampaignSender} = require('../lib/campaign-sender');
require('../lib/fork');

const workerId = Number.parseInt(process.argv[2]);
let running = false;

async function processCampaignMessages(campaignId, messages) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    const cs = new CampaignSender();
    await cs.initByCampaignId(campaignId);

    for (const msgData of messages) {
        try {
            await cs.sendRegularMessage(msgData.listId, msgData.email);

            log.verbose('Senders', 'Message sent and status updated for %s:%s', msgData.listId, msgData.email);
        } catch (err) {
            log.error('Senders', `Sending message to ${msgData.listId}:${msgData.email} failed with error: ${err.message}`);
            log.verbose(err.stack);
        }
    }

    running = false;

    sendToMaster('messages-processed');
}

async function processQueuedMessages(sendConfigurationId, messages) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    for (const msgData of messages) {
        const queuedMessage = msgData.queuedMessage;
        try {
            await CampaignSender.sendQueuedMessage(queuedMessage);

            log.verbose('Senders', 'Message sent and status updated for %s:%s', queuedMessage.list, queuedMessage.subscription);
        } catch (err) {
            log.error('Senders', `Sending message to ${queuedMessage.list}:${queuedMessage.subscription} failed with error: ${err.message}`);
            log.verbose(err.stack);
        }
    }

    running = false;

    sendToMaster('messages-processed');
}

function sendToMaster(msgType) {
    process.send({
        type: msgType
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


