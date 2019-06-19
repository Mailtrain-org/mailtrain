'use strict';

const express = require('express');

function replaceLastBySafeHandler(handlers) {
    if (handlers.length === 0) {
        return [];
    }

    const lastHandler = handlers[handlers.length - 1];
    const ret = handlers.slice();
    ret[handlers.length - 1] = (req, res, next) => lastHandler(req, res, next).catch(error => next(error));
    return ret;
}

function create() {
    const router = new express.Router();

    router.allAsync = (path, ...handlers) => router.all(path, ...replaceLastBySafeHandler(handlers));
    router.getAsync = (path, ...handlers) => router.get(path, ...replaceLastBySafeHandler(handlers));
    router.postAsync = (path, ...handlers) => router.post(path, ...replaceLastBySafeHandler(handlers));
    router.putAsync = (path, ...handlers) => router.put(path, ...replaceLastBySafeHandler(handlers));
    router.deleteAsync = (path, ...handlers) => router.delete(path, ...replaceLastBySafeHandler(handlers));

    return router;
}

module.exports = {
    create
};

