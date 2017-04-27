'use strict';

const fork = require('child_process').fork;
const log = require('npmlog');
const path = require('path');

const requestCallbacks = {};
let messageTid = 0;
let executorProcess;

module.exports = {
    spawn,
    start,
    stop
};

function spawn(callback) {
    log.info('Executor', 'Spawning executor process.');

    executorProcess = fork(path.join(__dirname, '..', 'services', 'executor.js'), [], {
        cwd: path.join(__dirname, '..'),
        env: {NODE_ENV: process.env.NODE_ENV}
    });

    executorProcess.on('message', msg => {
        if (msg) {
            if (msg.type === 'process-started') {
                let requestCallback = requestCallbacks[msg.tid];
                if (requestCallback && requestCallback.startedCallback) {
                    requestCallback.startedCallback(msg.tid);
                }

            } else if (msg.type === 'process-failed') {
                let requestCallback = requestCallbacks[msg.tid];
                if (requestCallback && requestCallback.failedCallback) {
                    requestCallback.failedCallback(msg.msg);
                }

                delete requestCallbacks[msg.tid];

            } else if (msg.type === 'process-finished') {
                let requestCallback = requestCallbacks[msg.tid];
                if (requestCallback && requestCallback.startedCallback) {
                    requestCallback.finishedCallback(msg.code, msg.signal);
                }

                delete requestCallbacks[msg.tid];

            } else if (msg.type === 'executor-started') {
                log.info('Executor', 'Executor process started.');
                return callback();
            }
        }
    });

    executorProcess.on('close', (code, signal) => {
        log.info('Executor', 'Executor process exited with code %s signal %s.', code, signal);
    });
}

function start(type, data, startedCallback, finishedCallback, failedCallback) {
    requestCallbacks[messageTid] = {
        startedCallback,
        finishedCallback,
        failedCallback
    };

    executorProcess.send({
        type: 'start-' + type,
        data,
        tid: messageTid
    });

    messageTid++;
}

function stop(tid) {
    executorProcess.send({
        type: 'stop-process',
        tid
    });
}

