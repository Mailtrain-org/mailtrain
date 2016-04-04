'use strict';

let config = require('config');
let mysql = require('mysql');

module.exports = mysql.createPool(config.mysql);
