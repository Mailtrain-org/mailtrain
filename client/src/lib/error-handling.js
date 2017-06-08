'use strict';

import PropTypes from 'prop-types';


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

    return errorHandled;
}

function withErrorHandling(target) {
    const inst = target.prototype;

    if (inst._withErrorHandlingApplied) return;
    inst._withErrorHandlingApplied = true;

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

    /* Example of use:
       this.getFormValuesFromURL(....).catch(error => this.handleError(error));

       It's equivalent to:

       @withAsyncErrorHandler
       async loadFormValues() {
         await this.getFormValuesFromURL(...);
       }
    */
    inst.handleError = function(error) {
        handleError(this, error);
    };

    return target;
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