'use strict';

const express = require('express');
const InteroperableError = require('./InteroperableError');

function safeHandler(handler) {
    return function(req, res) {
        handler(req, res).catch(error => res.status(500).send(error.message));
    };
}

function safeJSONHandler(handler) {
    return function(req, res) {
        handler(req, res).catch(error => {
            const resp = {
                message: error.message
            };

            if (error instanceof InteroperableError) {
                resp.type = error.type;
                resp.data = error.data;
            }

            res.status(500).json(resp);
        });
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

    router.getAsync = (path, ...handlers) => router.get(path, ...replaceLast(handlers, safeHandler));

    router.getAsyncJSON = (path, ...handlers) => router.get(path, ...replaceLast(handlers, safeJSONHandler));
    router.postAsyncJSON = (path, ...handlers) => router.post(path, ...replaceLast(handlers, safeJSONHandler));
    router.putAsyncJSON = (path, ...handlers) => router.put(path, ...replaceLast(handlers, safeJSONHandler));
    router.deleteAsyncJSON = (path, ...handlers) => router.delete(path, ...replaceLast(handlers, safeJSONHandler));

    return router;
}

module.exports = {
    create
};

