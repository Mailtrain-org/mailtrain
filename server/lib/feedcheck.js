'use strict';

const fork = require('child_process').fork;
const log = require('./log');
const path = require('path');
const senders = require('./senders');

let messageTid = 0;
let feedcheckProcess;

module.exports = {
    spawn,
    scheduleCheck
};

function spawn(callback) {
    log.verbose('Feed', 'Spawning feedcheck process');

    feedcheckProcess = fork(path.join(__dirname, '..', 'services', 'feedcheck.js'), [], {
        cwd: path.join(__dirname, '..'),
        env: {NODE_ENV: process.env.NODE_ENV}
    });

    feedcheckProcess.on('message', msg => {
        if (msg) {
            if (msg.type === 'feedcheck-started') {
                log.info('Feed', 'Feedcheck process started');
                return callback();
            } else if (msg.type === 'entries-added') {
                senders.scheduleCheck();
            }
        }
    });

    feedcheckProcess.on('close', (code, signal) => {
        log.error('Feed', 'Feedcheck process exited with code %s signal %s', code, signal);
    });
}

function scheduleCheck() {
    feedcheckProcess.send({
        type: 'scheduleCheck',
        tid: messageTid
    });

    messageTid++;
}

