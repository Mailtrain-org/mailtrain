'use strict';

const config = require('config');
const fork = require('child_process').fork;
const log = require('./log');
const path = require('path');

let zoneMtaProcess;

module.exports = {
    spawn
};

function spawn(callback) {
    if (config.builtinZoneMTA.enabled) {
        log.info('ZoneMTA', 'Starting built-in Zone MTA process');

        zoneMtaProcess = fork(
            path.join(__dirname, '..', '..', 'zone-mta', 'index.js'),
            ['--config=' + path.join(__dirname, '..', '..', 'zone-mta', 'config', 'zonemta.js')],
            {
                cwd: path.join(__dirname, '..', '..', 'zone-mta'),
                env: {NODE_ENV: process.env.NODE_ENV}
            }
        );

        zoneMtaProcess.on('message', msg => {
            if (msg) {
                if (msg.type === 'zone-mta-started') {
                    log.info('ZoneMTA', 'ZoneMTA process started');
                    return callback();
                } else if (msg.type === 'entries-added') {
                    senders.scheduleCheck();
                }
            }
        });

        zoneMtaProcess.on('close', (code, signal) => {
            log.error('ZoneMTA', 'ZoneMTA process exited with code %s signal %s', code, signal);
        });

    } else {
        callback();
    }
}
