'use strict';

/* Privileged executor. If Mailtrain is started as root, this process keeps the root privilege to be able to spawn workers
   that can chroot.
  */

const fileHelpers = require('../lib/file-helpers');
const fork = require('child_process').fork;
const path = require('path');
const log = require('npmlog');
const fs = require('fs');
const privilegeHelpers = require('../lib/privilege-helpers');

let processes = {};

function spawnProcess(tid, executable, args, outFile, errFile, cwd, uid, gid) {

    function reportFail(msg) {
        process.send({
            type: 'process-failed',
            msg,
            tid
        });
    }

    fs.open(outFile, 'w', (err, outFd) => {
        if (err) {
            log.error('Executor', err);
            reportFail('Cannot create standard output file.');
            return;
        }

        fs.open(errFile, 'w', (err, errFd) => {
            if (err) {
                log.error('Executor', err);
                reportFail('Cannot create standard error file.');
                return;
            }

            privilegeHelpers.ensureMailtrainOwner(outFile, (err) => {
                if (err) {
                    log.warn('Executor', 'Cannot change owner of output file of process tid:%s.', tid)
                }

                privilegeHelpers.ensureMailtrainOwner(errFile, (err) => {
                    if (err) {
                        log.warn('Executor', 'Cannot change owner of error output file of process tid:%s.', tid)
                    }

                    const options = {
                        stdio: ['ignore', outFd, errFd, 'ipc'],
                        cwd,
                        env: {NODE_ENV: process.env.NODE_ENV},
                        uid,
                        gid
                    };

                    let child;

                    try {
                        child = fork(executable, args, options);
                    } catch (err) {
                        log.error('Executor', 'Cannot start process with tid:%s.', tid);
                        reportFail('Cannot start process.');
                        return;
                    }

                    const pid = child.pid;
                    processes[tid] = child;

                    log.info('Executor', 'Process started with tid:%s pid:%s.', tid, pid);
                    process.send({
                        type: 'process-started',
                        tid
                    });

                    child.on('close', (code, signal) => {

                        delete processes[tid];
                        log.info('Executor', 'Process tid:%s pid:%s exited with code %s signal %s.', tid, pid, code, signal);

                        fs.close(outFd, (err) => {
                            if (err) {
                                log.error('Executor', err);
                            }

                            fs.close(errFd, (err) => {
                                if (err) {
                                    log.error('Executor', err);
                                }

                                process.send({
                                    type: 'process-finished',
                                    tid,
                                    code,
                                    signal
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

process.on('message', msg => {
    if (msg) {
        const type = msg.type;

        if (type === 'start-report-processor-worker') {

            const ids = privilegeHelpers.getConfigROUidGid();
            spawnProcess(msg.tid, path.join(__dirname, '..', 'workers', 'reports', 'report-processor.js'), [msg.data.id], fileHelpers.getReportContentFile(msg.data), fileHelpers.getReportOutputFile(msg.data), path.join(__dirname, '..', 'workers', 'reports'), ids.uid, ids.gid);

        } else if (type === 'stop-process') {
            const child = processes[msg.tid];

            if (child) {
                log.info('Executor', 'Killing process tid:%s pid:%s', msg.tid, child.pid);
                child.kill();
            } else {
                log.info('Executor', 'No running process found with tid:%s pid:%s', msg.tid, child.pid);
            }
        }
    }
});

process.send({
    type: 'executor-started'
});
