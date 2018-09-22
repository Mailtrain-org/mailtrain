'use strict';

const config = require('config');
const log = require('npmlog');
const mailers = require('../lib/mailers');
const CampaignSender = require('../lib/campaign-sender');

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
            await cs.sendMessage(subData.listId, subData.email);
            log.verbose('Senders', 'Message sent and status updated for %s:%s', subData.listId, subData.email);
        } catch (err) {
            log.error('Senders', `Sending message to ${subData.listId}:${subData.email} failed with error: ${err.message}`)
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

sendToMaster('worker-started');


