'use strict';

const log = require('npmlog');
const db = require('../lib/db');
const reports = require('../lib/models/reports');
const _ = require('../lib/translate')._;
const path = require('path');
const tools = require('../lib/tools');
const fs = require('fs');
const fork = require('child_process').fork;

let runningWorkersCount = 0;
let maxWorkersCount = 1;

let workers = {};

function getFileName(report, suffix) {
    return path.join(__dirname, '..', 'protected', 'reports', report.id + '-' + tools.nameToFileName(report.name) + '.' + suffix);
}

module.exports.getFileName = getFileName;

function spawnWorker(report) {

    fs.open(getFileName(report, 'output'), 'w', (err, outFd) => {
        if (err) {
            log.error('ReportProcessor', err);
            return;
        }

        runningWorkersCount++;

        const options = {
            stdio: ['ignore', outFd, outFd, 'ipc'],
            cwd: path.join(__dirname, '..')
        };

        let child = fork(path.join(__dirname, 'report-processor-worker.js'), [report.id], options);
        let pid = child.pid;
        workers[report.id] = child;

        log.info('ReportProcessor', 'Worker process for "%s" started with pid %s. Current worker count is %s.', report.name, pid, runningWorkersCount);

        child.on('close', (code, signal) => {
            runningWorkersCount--;

            delete workers[report.id];
            log.info('ReportProcessor', 'Worker process for "%s" (pid %s) exited with code %s signal %s. Current worker count is %s.', report.name, pid, code, signal, runningWorkersCount);

            fs.close(outFd, (err) => {
                if (err) {
                    log.error('ReportProcessor', err);
                }

                const fields = {};
                if (code ===0 ) {
                    fields.state = reports.ReportState.FINISHED;
                    fields.lastRun = new Date();
                } else {
                    fields.state = reports.ReportState.FAILED;
                }

                reports.updateFields(report.id, fields, (err) => {
                    if (err) {
                        log.error('ReportProcessor', err);
                    }

                    setImmediate(worker);
                });
            });
        });
    });
};

function worker() {
    reports.listWithState(reports.ReportState.SCHEDULED, 0, maxWorkersCount - runningWorkersCount, (err, reportList) => {
        if (err) {
            log.error('ReportProcessor', err);
            return;
        }

        for (let report of reportList) {
            reports.updateFields(report.id, { state: reports.ReportState.PROCESSING }, (err) => {
                if (err) {
                    log.error('ReportProcessor', err);
                    return;
                }

                spawnWorker(report);
            });
        }
    });
}

module.exports.start = (reportId, callback) => {
    if (!workers[reportId]) {
        log.info('ReportProcessor', 'Scheduling report id: %s', reportId);
        reports.updateFields(reportId, { state: reports.ReportState.SCHEDULED, lastRun: null}, (err) => {
            if (err) {
                return callback(err);
            }

            if (runningWorkersCount < maxWorkersCount) {
                log.info('ReportProcessor', 'Starting worker because runningWorkersCount=%s maxWorkersCount=%s', runningWorkersCount, maxWorkersCount);

                worker();
            } else {
                log.info('ReportProcessor', 'Not starting worker because runningWorkersCount=%s maxWorkersCount=%s', runningWorkersCount, maxWorkersCount);
            }

            callback(null);
        });
    } else {
        log.info('ReportProcessor', 'Worker for report id: %s is already running.', reportId);
    }
};

module.exports.stop = (reportId, callback) => {
    const child = workers[reportId];
    if (child) {
        log.info('ReportProcessor', 'Killing worker for report id: %s', reportId);
        child.kill();
        reports.updateFields(reportId, { state: reports.ReportState.FAILED}, callback);
    } else {
        log.info('ReportProcessor', 'No running worker found for report id: %s', reportId);
    }
};

module.exports.init = (callback) => {
    reports.listWithState(reports.ReportState.PROCESSING, 0, 0, (err, reportList) => {
        if (err) {
            log.error('ReportProcessor', err);
        }

        function scheduleReport() {
            if (reportList.length > 0) {
                const report = reportList.shift();

                reports.updateFields(report.id, { state: reports.ReportState.SCHEDULED}, (err) => {
                    if (err) {
                        log.error('ReportProcessor', err);
                    }

                    scheduleReport();
                });
            }

            worker();
            callback();
        }

        scheduleReport();
    });
};
