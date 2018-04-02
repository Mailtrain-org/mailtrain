'use strict';

const fork = require('child_process').fork;

const config = require('config');
const log = require('npmlog');
const workers = new Set();

function spawn(callback) {
    let processes = Math.max(Number(config.queue.processes) || 1, 1);
    let spawned = 0;
    let returned = false;

    if (processes > 1 && !config.redis.enabled) {
        log.error('Queue', '%s processes requested but Redis is not enabled, spawning 1 process', processes);
        processes = 1;
    }

    let spawnSender = function () {
        if (spawned >= processes) {
            if (!returned) {
                returned = true;
                return callback();
            }
            return false;
        }

        let child = fork(__dirname + '/../services/sender.js', []);
        let pid = child.pid;
        workers.add(child);

        child.on('close', (code, signal) => {
            spawned--;
            workers.delete(child);
            log.error('Child', 'Sender process %s exited with %s', pid, code || signal);
            // Respawn after 5 seconds
            setTimeout(() => spawnSender(), 5 * 1000).unref();
        });

        spawned++;
        setImmediate(spawnSender);
    };

    spawnSender();
}

module.exports = {
    workers,
    spawn
};
