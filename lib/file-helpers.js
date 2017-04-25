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


function getReportDir(report) {
    return path.join(__dirname, '..', 'protected', 'reports', report.id + '-' + nameToFileName(report.name));
}

function getReportContentFile(report) {
    return path.join(getReportDir(report), 'report');
}

function getReportOutputFile(report) {
    return getReportDir(report) + '.output';
}


module.exports = {
    getReportContentFile,
    getReportDir,
    getReportOutputFile,
    nameToFileName
};
