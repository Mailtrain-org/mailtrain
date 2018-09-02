'use strict';

const fork = require('child_process').fork;
const log = require('npmlog');
const path = require('path');

let messageTid = 0;
let senderProcess;

function spawn(callback) {
    log.info('Senders', 'Spawning master sender process');

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
}

function scheduleCheck() {
    senderProcess.send({
        type: 'scheduleCheck',
        tid: messageTid
    });

    messageTid++;
}

function reloadConfig(sendConfigurationId) {
    senderProcess.send({
        type: 'reloadConfig',
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

