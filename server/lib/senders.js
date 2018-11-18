'use strict';

const fork = require('child_process').fork;
const log = require('./log');
const path = require('path');
const knex = require('./knex');
const {CampaignStatus} = require('../../shared/campaigns');

let messageTid = 0;
let senderProcess;

function spawn(callback) {
    log.verbose('Senders', 'Spawning master sender process');

    knex('campaigns').where('status', CampaignStatus.SENDING).update({status: CampaignStatus.SCHEDULED})
    .then(() => {
        senderProcess = fork(path.join(__dirname, '..', 'services', 'sender-master.js'), [], {
            cwd: path.join(__dirname, '..'),
            env: {NODE_ENV: process.env.NODE_ENV}
        });

        senderProcess.on('message', msg => {
            if (msg) {
                if (msg.type === 'master-sender-started') {
                    log.info('Senders', 'Master sender process started');
                    return callback();
                }
            }
        });

        senderProcess.on('close', (code, signal) => {
            log.error('Senders', 'Master sender process exited with code %s signal %s', code, signal);
        });
    });
}

function scheduleCheck() {
    senderProcess.send({
        type: 'schedule-check',
        tid: messageTid
    });

    messageTid++;
}

function reloadConfig(sendConfigurationId) {
    senderProcess.send({
        type: 'reload-config',
        data: {
            sendConfigurationId
        },
        tid: messageTid
    });

    messageTid++;
}

module.exports = {
    spawn,
    scheduleCheck,
    reloadConfig
};

