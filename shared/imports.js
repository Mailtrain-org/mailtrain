'use strict';

const ImportType = {
    MIN: 0,

    CSV_FILE: 0,
    LIST: 1,

    MAX: 1
};

const ImportStatus = {
    PREP_SCHEDULED: 0,
    PREP_RUNNING: 1,
    PREP_FINISHED: 2,
    PREP_FAILED: 3,

    RUN_SCHEDULED: 4,
    RUN_RUNNING: 5,
    RUN_FINISHED: 6,
    RUN_FAILED: 7
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