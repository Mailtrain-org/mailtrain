'use strict';

class InteroperableError extends Error {
    constructor(type, msg, data) {
        super(msg);
        this.type = type;
        this.data = data;
    }
}

class NotLoggedInError extends InteroperableError {
    constructor(msg, data) {
        super('NotLoggedInError', msg, data);
    }
}

class ChangedError extends InteroperableError {
    constructor(msg, data) {
        super('ChangedError', msg, data);
    }
}

class NotFoundError extends InteroperableError {
    constructor(msg, data) {
        super('NotFoundError', msg, data);
    }
}

class LoopDetectedError extends InteroperableError {
    constructor(msg, data) {
        super('LoopDetectedError', msg, data);
    }
}

class ChildDetectedError extends InteroperableError {
    constructor(msg, data) {
        super('ChildDetectedError', msg, data);
    }
}

class DuplicitNameError extends InteroperableError {
    constructor(msg, data) {
        super('DuplicitNameError', msg, data);
    }
}

class DuplicitEmailError extends InteroperableError {
    constructor(msg, data) {
        super('DuplicitEmailError', msg, data);
    }
}

const errorTypes = {
    InteroperableError,
    NotLoggedInError,
    ChangedError,
    NotFoundError,
    LoopDetectedError,
    ChildDetectedError,
    DuplicitNameError,
    DuplicitEmailError
};

function deserialize(errorObj) {
    if (errorObj.type) {

        const ctor = errorTypes[errorObj.type];
        if (ctor) {
            return new ctor(errorObj.message, errorObj.data);
        } else {
            console.log('Warning unknown type of interoperable error: ' + errorObj.type);
        }
    }
}

module.exports = Object.assign({}, errorTypes, {
    deserialize
});