'use strict';

const log = require('npmlog');
const reports = require('./models/reports');
const executor = require('./executor');

let runningWorkersCount = 0;
let maxWorkersCount = 1;

let workers = {};

function startWorker(report) {

    function onStarted(tid) {
        log.info('ReportProcessor', 'Worker process for "%s" started with tid %s. Current worker count is %s.', report.name, tid, runningWorkersCount);
        workers[report.id] = tid;
    }

    function onFinished(code, signal) {
        runningWorkersCount--;
        log.info('ReportProcessor', 'Worker process for "%s" (tid %s) exited with code %s signal %s. Current worker count is %s.', report.name, workers[report.id], code, signal, runningWorkersCount);
        delete workers[report.id];

        const fields = {};
        if (code === 0) {
            fields.state = reports.ReportState.FINISHED;
            fields.lastRun = new Date();
        } else {
            fields.state = reports.ReportState.FAILED;
        }

        reports.updateFields(report.id, fields, err => {
            if (err) {
                log.error('ReportProcessor', err);
            }

            setImmediate(startWorkers);
        });
    }

    function onFailed(msg) {
        runningWorkersCount--;
        log.error('ReportProcessor', 'Executing worker process for "%s" (tid %s) failed with message "%s". Current worker count is %s.', report.name, workers[report.id], msg, runningWorkersCount);
        delete workers[report.id];

        const fields = {
            state: reports.ReportState.FAILED
        };

        reports.updateFields(report.id, fields, err => {
            if (err) {
                log.error('ReportProcessor', err);
            }

            setImmediate(startWorkers);
        });
    }

    const reportData = {
        id: report.id,
        name: report.name
    };

    runningWorkersCount++;
    executor.start('report-processor-worker', reportData, onStarted, onFinished, onFailed);
}

function startWorkers() {
    reports.listWithState(reports.ReportState.SCHEDULED, 0, maxWorkersCount - runningWorkersCount, (err, reportList) => {
        if (err) {
            log.error('ReportProcessor', err);
            return;
        }

        for (let report of reportList) {
            reports.updateFields(report.id, { state: reports.ReportState.PROCESSING }, err => {
                if (err) {
                    log.error('ReportProcessor', err);
                    return;
                }

                startWorker(report);
            });
        }
    });
}

module.exports.start = (reportId, callback) => {
    if (!workers[reportId]) {
        log.info('ReportProcessor', 'Scheduling report id: %s', reportId);
        reports.updateFields(reportId, { state: reports.ReportState.SCHEDULED, lastRun: null}, err => {
            if (err) {
                return callback(err);
            }

            if (runningWorkersCount < maxWorkersCount) {
                log.info('ReportProcessor', 'Starting worker because runningWorkersCount=%s maxWorkersCount=%s', runningWorkersCount, maxWorkersCount);

                startWorkers();
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
    const tid = workers[reportId];
    if (tid) {
        log.info('ReportProcessor', 'Killing worker for report id: %s', reportId);
        executor.stop(tid);
        reports.updateFields(reportId, { state: reports.ReportState.FAILED}, callback);
    } else {
        log.info('ReportProcessor', 'No running worker found for report id: %s', reportId);
    }
};

module.exports.init = callback => {
    reports.listWithState(reports.ReportState.PROCESSING, 0, 0, (err, reportList) => {
        if (err) {
            log.error('ReportProcessor', err);
        }

        function scheduleReport() {
            if (reportList.length > 0) {
                const report = reportList.shift();

                reports.updateFields(report.id, { state: reports.ReportState.SCHEDULED}, err => {
                    if (err) {
                        log.error('ReportProcessor', err);
                    }

                    scheduleReport();
                });
            }

            startWorkers();
            return callback();
        }

        scheduleReport();
    });
};
