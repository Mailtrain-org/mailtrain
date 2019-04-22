'use strict';

const path = require('path');

function nameToFileName(name) {
    return name.
        trim().
        toLowerCase().
        replace(/[ .+/]/g, '-').
        replace(/[^a-z0-9\-_]/gi, '').
        replace(/--*/g, '-');
}

const reportFilesDir = path.join(__dirname, '..', 'files', 'reports');

function getReportFileBase(report) {
    return path.join(reportFilesDir, report.id + '-' + nameToFileName(report.name));
}

function getReportContentFile(report) {
    return getReportFileBase(report) + '.out';
}

function getReportOutputFile(report) {
    return getReportFileBase(report) + '.err';
}


module.exports = {
    getReportContentFile,
    getReportOutputFile,
    nameToFileName,
    reportFilesDir
};
