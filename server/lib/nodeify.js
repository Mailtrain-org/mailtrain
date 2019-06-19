'use strict';

const nodeify = require('nodeify');

module.exports.nodeifyPromise = nodeify;

module.exports.nodeifyFunction = (asyncFun) => {
    return (...args) => {
        const callback = args.pop();

        const promise = asyncFun(...args);

        return module.exports.nodeifyPromise(promise, callback);
    };
};
