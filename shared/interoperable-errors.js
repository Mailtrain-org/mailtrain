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
        super('NotLoggedIn', msg, data);
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

const errorTypes = {
    InteroperableError,
    NotLoggedInError,
    ChangedError,
    NotFoundError
};

function deserialize(errorObj) {
    if (errorObj.type) {
        return new errorTypes[errorObj.type](errorObj.message, errorObj.data)
    }
}

module.exports = Object.assign({}, errorTypes, {
    deserialize
});