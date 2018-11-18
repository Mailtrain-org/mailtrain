'use strict';

const config = require('./config');

module.exports = {
    client: 'mysql2',
    connection: config.mysql
};
