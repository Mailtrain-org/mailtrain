'use strict';

const config = require('./config');
const log = require('npmlog');

log.level = config.log.level;

module.exports = log;