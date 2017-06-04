'use strict';

const express = require('express');

function safeAsyncHandler(handler) {
    return function(req, res, next) {
        handler(req, res).catch(error => next(error));
    };
}

function replaceLast(elems, replaceFn) {
    if (elems.length === 0) {
        return elems;
    }

    const lastElem = elems[elems.size - 1];
    const replacement = replaceFn(lastElem);

    elems[elems.size - 1] = replacement;

    return elems;
}

function create() {
    const router = new express.Router();

    router.getAsync = (path, ...handlers) => router.get(path, ...replaceLast(handlers, safeAsyncHandler));
    router.postAsync = (path, ...handlers) => router.post(path, ...replaceLast(handlers, safeAsyncHandler));
    router.putAsync = (path, ...handlers) => router.put(path, ...replaceLast(handlers, safeAsyncHandler));
    router.deleteAsync = (path, ...handlers) => router.delete(path, ...replaceLast(handlers, safeAsyncHandler));

    return router;
}

module.exports = {
    create
};

