'use strict';

const config = require('config');
const log = require('../lib/log');
const mailers = require('../lib/mailers');
const CampaignSender = require('../lib/campaign-sender');
const {enforce} = require('../lib/helpers');

const workerId = Number.parseInt(process.argv[2]);
let running = false;

async function processMessages(campaignId, subscribers) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    const cs = new CampaignSender();
    await cs.init({campaignId})

    for (const subData of subscribers) {
        try {
            if (subData.email) {
                await cs.sendMessageByEmail(subData.listId, subData.email);

            } else if (subData.subscriptionId) {
                await cs.sendMessageBySubscriptionId(subData.listId, subData.subscriptionId);

            } else {
                enforce(false);
            }

            log.verbose('Senders', 'Message sent and status updated for %s:%s', subData.listId, subData.email || subData.subscriptionId);
        } catch (err) {
            log.error('Senders', `Sending message to ${subData.listId}:${subData.email} failed with error: ${err.message}`)
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

        } else if (type === 'process-messages') {
            // noinspection JSIgnoredPromiseFromCall
            processMessages(msg.data.campaignId, msg.data.subscribers)
        }

    }
});

if (config.title) {
    process.title = config.title + ': sender/worker ' + workerId;
}

sendToMaster('worker-started');


