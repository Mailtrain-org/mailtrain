'use strict';

import React from "react";
import PropTypes from 'prop-types';
import {createComponentMixin} from "./decorator-helpers";

function handleError(that, error) {
    let errorHandled;
    if (that.errorHandler) {
        errorHandled = that.errorHandler(error);
    }

    if (!errorHandled && that.props.parentErrorHandler) {
        errorHandled = handleError(that.props.parentErrorHandler, error);
    }

    if (!errorHandled) {
        throw error;
    }

    return errorHandled;
}

export const ParentErrorHandlerContext = React.createContext(null);
export const withErrorHandling = createComponentMixin([{context: ParentErrorHandlerContext, propName: 'parentErrorHandler'}], [], (TargetClass, InnerClass) => {
    /* Example of use:
       this.getFormValuesFromURL(....).catch(error => this.handleError(error));

       It's equivalent to:

       @withAsyncErrorHandler
       async loadFormValues() {
         await this.getFormValuesFromURL(...);
       }
    */

    const originalRender = InnerClass.prototype.render;

    InnerClass.prototype.render = function() {
        return (
            <ParentErrorHandlerContext.Provider value={this}>
                {originalRender.apply(this)}
            </ParentErrorHandlerContext.Provider>
        );
    }

    InnerClass.prototype.handleError = function(error) {
        handleError(this, error);
    };

    return {};
});

export function withAsyncErrorHandler(target, name, descriptor) {
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

export function wrapWithAsyncErrorHandler(self, fn) {
    return async function () {
        try {
            await fn.apply(this, arguments)
        } catch (error) {
            handleError(self, error);
        }
    };
}
