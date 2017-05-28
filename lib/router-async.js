'use strict';

const express = require('express');

function safeHandler(handler) {
    return function(req, res) {
        handler(req, res).catch(error => res.status(500).send(error.message));
    };
}

function create() {
    const router = new express.Router();

    router.getAsync = (path, asyncFn) => router.get(path, safeHandler(asyncFn));

    router.postAsync = (path, asyncFn) => router.post(path, safeHandler(asyncFn));

    return router;
}

module.exports = {
    create
};

