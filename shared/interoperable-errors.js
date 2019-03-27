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
        super('NotFoundError', msg || 'Not Found', data);
        this.status = 404;
    }
}

class LoopDetectedError extends InteroperableError {
    constructor(msg, data) {
        super('LoopDetectedError', msg, data);
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

class DuplicitKeyError extends InteroperableError {
    constructor(msg, data) {
        super('DuplicitKeyError', msg, data);
    }
}

class IncorrectPasswordError extends InteroperableError {
    constructor(msg, data) {
        super('IncorrectPasswordError', msg, data);
    }
}

class InvalidTokenError extends InteroperableError {
    constructor(msg, data) {
        super('InvalidTokenError', msg, data);
    }
}

class DependencyNotFoundError extends InteroperableError {
    constructor(msg, data) {
        super('DependencyNotFoundError', msg, data);
    }
}

class NamespaceNotFoundError extends InteroperableError {
    constructor(msg, data) {
        super('NamespaceNotFoundError', msg, data);
    }
}

class PermissionDeniedError extends InteroperableError {
    constructor(msg, data) {
        super('PermissionDeniedError', msg || 'Permission Denied', data);
        this.status = 403;
    }
}

class InvalidConfirmationForSubscriptionError extends InteroperableError {
    constructor(msg, data) {
        super('InvalidConfirmationForSubscriptionError', msg, data);
    }
}

class InvalidConfirmationForAddressChangeError extends InteroperableError {
    constructor(msg, data) {
        super('InvalidConfirmationForAddressChangeError', msg, data);
    }
}

class InvalidConfirmationForUnsubscriptionError extends InteroperableError {
    constructor(msg, data) {
        super('InvalidConfirmationForUnsubscriptionError', msg, data);
    }
}

class DependencyPresentError extends InteroperableError {
    constructor(msg, data) {
        super('DependencyPresentError', msg, data);
    }
}

class InvalidStateError extends InteroperableError {
    constructor(msg, data) {
        super('InvalidStateError', msg, data);
    }
}


const errorTypes = {
    InteroperableError,
    NotLoggedInError,
    ChangedError,
    NotFoundError,
    LoopDetectedError,
    DuplicitNameError,
    DuplicitEmailError,
    DuplicitKeyError,
    IncorrectPasswordError,
    InvalidTokenError,
    DependencyNotFoundError,
    NamespaceNotFoundError,
    PermissionDeniedError,
    InvalidConfirmationForSubscriptionError,
    InvalidConfirmationForAddressChangeError,
    InvalidConfirmationForUnsubscriptionError,
    DependencyPresentError,
    InvalidStateError
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