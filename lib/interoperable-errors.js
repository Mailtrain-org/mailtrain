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


module.exports = {
    InteroperableError,
    NotLoggedInError
};