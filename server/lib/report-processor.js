'use strict';

const log = require('./log');
const reports = require('../models/reports');
const executor = require('./executor');
const contextHelpers = require('./context-helpers');

let runningWorkersCount = 0;
let maxWorkersCount = 1;

const workers = {};

function startWorker(report) {

    async function onStarted(tid) {
        log.info('ReportProcessor', 'Worker process for "%s" started with tid %s. Current worker count is %s.', report.name, tid, runningWorkersCount);
        workers[report.id] = tid;
    }

    async function onFinished(code, signal) {
        runningWorkersCount--;
        log.info('ReportProcessor', 'Worker process for "%s" (tid %s) exited with code %s signal %s. Current worker count is %s.', report.name, workers[report.id], code, signal, runningWorkersCount);
        delete workers[report.id];

        const fields = {};
        if (code === 0) {
            fields.state = reports.ReportState.FINISHED;
            fields.last_run = new Date();
        } else {
            fields.state = reports.ReportState.FAILED;
        }

        try {
            await reports.updateFields(report.id, fields);
            setImmediate(tryStartWorkers);
        } catch (err) {
            log.error('ReportProcessor', err);
        }
    }

    async function onFailed(msg) {
        runningWorkersCount--;
        log.error('ReportProcessor', 'Executing worker process for "%s" (tid %s) failed with message "%s". Current worker count is %s.', report.name, workers[report.id], msg, runningWorkersCount);
        delete workers[report.id];

        const fields = {
            state: reports.ReportState.FAILED
        };

        try {
            await reports.updateFields(report.id, fields);
            setImmediate(tryStartWorkers);
        } catch (err) {
            log.error('ReportProcessor', err);
        }
    }

    const reportData = {
        id: report.id,
        name: report.name
    };

    runningWorkersCount++;
    executor.start('report-processor-worker', reportData, onStarted, onFinished, onFailed);
}

let isStartingWorkers = false;

async function tryStartWorkers() {

    if (isStartingWorkers) {
        // Generally it is possible that this function is invoked simultaneously multiple times. This is to prevent it.
        return;
    }
    isStartingWorkers = true;

    try {
        while (runningWorkersCount < maxWorkersCount) {
            log.info('ReportProcessor', 'Trying to start worker because runningWorkersCount=%s maxWorkersCount=%s', runningWorkersCount, maxWorkersCount);

            const reportList = await reports.listByState(reports.ReportState.SCHEDULED, 1);

            if (reportList.length > 0) {
                log.info('ReportProcessor', 'Starting worker');

                const report = reportList[0];
                await reports.updateFields(report.id, {state: reports.ReportState.PROCESSING});
                startWorker(report);

            } else {
                log.info('ReportProcessor', 'No more reports to start a worker for');
                break;
            }
        }

    } catch (err) {
        log.error('ReportProcessor', err);
    }

    isStartingWorkers = false;
}

module.exports.start = async (reportId) => {
    if (!workers[reportId]) {
        log.info('ReportProcessor', 'Scheduling report id: %s', reportId);
        await reports.updateFields(reportId, { state: reports.ReportState.SCHEDULED, last_run: null});
        await tryStartWorkers();
    } else {
        log.info('ReportProcessor', 'Worker for report id: %s is already running.', reportId);
    }
};

module.exports.stop = async reportId => {
    const tid = workers[reportId];
    if (tid) {
        log.info('ReportProcessor', 'Killing worker for report id: %s', reportId);
        executor.stop(tid);

        await reports.updateFields(reportId, { state: reports.ReportState.FAILED });
    } else {
        log.info('ReportProcessor', 'No running worker found for report id: %s', reportId);
    }
};

module.exports.init = async () => {
    try {
        await reports.bulkChangeState(reports.ReportState.PROCESSING, reports.ReportState.SCHEDULED);
        await tryStartWorkers();
    } catch (err) {
        log.error('ReportProcessor', err);
    }
};
