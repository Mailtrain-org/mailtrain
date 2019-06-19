'use strict';

const ReportState = {
    MIN: 0,

    SCHEDULED: 0,
    PROCESSING: 1,
    FINISHED: 2,
    FAILED: 3,

    MAX: 3
};

module.exports = {
    ReportState
};