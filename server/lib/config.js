"use strict";

const config = require('config');

if (!config.roles) {
    config.roles = config.defaultRoles;
}

module.exports = config;