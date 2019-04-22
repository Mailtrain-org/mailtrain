'use strict';

const path = require('path');
const csvStringify = require('csv-stringify');
const stream = require('stream');

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

async function renderCsvFromStream(readable, writable, opts, transform) {
    const finished = new Promise((success, fail) => {
        let lastReadable = readable;

        const stringifier = csvStringify(opts);

        stringifier.on('finish', () => success());
        stringifier.on('error', err => fail(err));

        if (transform) {
            const rowTransform = new stream.Transform({
                objectMode: true,
                transform(row, encoding, callback) {
                    async function performTransform() {
                        try {
                            const newRow = await transform(row, encoding);
                            callback(null, newRow);
                        } catch (err) {
                            callback(err);
                        }
                    }

                    // noinspection JSIgnoredPromiseFromCall
                    performTransform();
                }
            });

            lastReadable.on('error', err => fail(err));
            lastReadable.pipe(rowTransform);

            lastReadable = rowTransform;
        }

        stringifier.pipe(writable);
        lastReadable.pipe(stringifier);
    });

    await finished;
}


module.exports = {
    getReportContentFile,
    getReportOutputFile,
    nameToFileName,
    reportFilesDir,
    renderCsvFromStream
};
