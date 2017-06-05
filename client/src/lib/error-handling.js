'use strict';

import PropTypes from 'prop-types';

function withErrorHandling(target) {
    const inst = target.prototype;

    const contextTypes = target.contextTypes || {};
    contextTypes.parentErrorHandler = PropTypes.object;
    target.contextTypes = contextTypes;

    const childContextTypes = target.childContextTypes || {};
    childContextTypes.parentErrorHandler = PropTypes.object;
    target.childContextTypes = childContextTypes;

    const existingGetChildContext = inst.getChildContext;
    if (existingGetChildContext) {
        inst.getChildContext = function() {
            const childContext = (this::existingGetChildContext)();
            childContext.parentErrorHandler = this;
            return childContext;
        }
    } else {
        inst.getChildContext = function() {
            return {
                parentErrorHandler: this
            };
        }
    }

    return target;
}

function handleError(that, error) {
    let errorHandled;
    if (that.errorHandler) {
        errorHandled = that.errorHandler(error);
    }

    if (!errorHandled && that.context.parentErrorHandler) {
        errorHandled = handleError(that.context.parentErrorHandler, error);
    }

    if (!errorHandled) {
        throw error;
    }
}

function withAsyncErrorHandler(target, name, descriptor) {
    let fn = descriptor.value;

    descriptor.value = async function () {
        try {
            await fn.apply(this, arguments)
        } catch (error) {
            handleError(this, error);
        }
    };

    return descriptor;
}


export {
    withErrorHandling,
    withAsyncErrorHandler
}