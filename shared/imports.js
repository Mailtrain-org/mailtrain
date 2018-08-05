'use strict';

const ImportType = {
    MIN: 0,

    CSV_FILE: 0,
    LIST: 1,

    MAX: 1
};

const ImportStatus = {
    NOT_READY: 0,
    SCHEDULED: 1,
    RUNNING: 2,
    FINISHED: 3
};

const RunStatus = {
    RUNNING: 0,
    FINISHED: 1
};

module.exports = {
    ImportType,
    ImportStatus,
    RunStatus
};