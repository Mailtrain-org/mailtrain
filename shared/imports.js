'use strict';

const ImportSource = {
    MIN: 0,

    CSV_FILE: 0,
    LIST: 1,

    MAX: 1
};

const MappingType = {
    MIN: 0,

    BASIC_SUBSCRIBE: 0,
    BASIC_UNSUBSCRIBE: 1,

    MAX: 1
};

const ImportStatus = {
    PREP_SCHEDULED: 0,
    PREP_RUNNING: 1,
    PREP_STOPPING: 2,
    PREP_FINISHED: 3,
    PREP_FAILED: 4,

    RUN_SCHEDULED: 5,
    RUN_RUNNING: 6,
    RUN_STOPPING: 7,
    RUN_FINISHED: 8,
    RUN_FAILED: 9
};

const RunStatus = {
    SCHEDULED: 0,
    RUNNING: 1,
    STOPPING: 2,
    FINISHED: 3,
    FAILED: 4
};

function prepInProgress(status) {
    return status === ImportStatus.PREP_SCHEDULED || status === ImportStatus.PREP_RUNNING || status === ImportStatus.PREP_STOPPING;
}

function runInProgress(status) {
    return status === ImportStatus.RUN_SCHEDULED || status === ImportStatus.RUN_RUNNING || status === ImportStatus.RUN_STOPPING;
}

function inProgress(status) {
    return status === ImportStatus.PREP_SCHEDULED || status === ImportStatus.PREP_RUNNING || status === ImportStatus.PREP_STOPPING ||
        status === ImportStatus.RUN_SCHEDULED || status === ImportStatus.RUN_RUNNING || status === ImportStatus.RUN_STOPPING;
}

function prepFinished(status) {
    return status === ImportStatus.PREP_FINISHED ||
        status === ImportStatus.RUN_SCHEDULED || status === ImportStatus.RUN_RUNNING || status === ImportStatus.RUN_STOPPING ||
        status === ImportStatus.RUN_FINISHED || status === ImportStatus.RUN_FAILED;
}

function prepFinishedAndNotInProgress(status) {
    return status === ImportStatus.PREP_FINISHED ||
        status === ImportStatus.RUN_FINISHED || status === ImportStatus.RUN_FAILED;
}

function runStatusInProgress(status) {
    return status === RunStatus.SCHEDULED || status === RunStatus.RUNNING || status === RunStatus.STOPPING;
}

module.exports = {
    ImportSource,
    MappingType,
    ImportStatus,
    RunStatus,
    prepInProgress,
    runInProgress,
    prepFinished,
    prepFinishedAndNotInProgress,
    inProgress,
    runStatusInProgress
};