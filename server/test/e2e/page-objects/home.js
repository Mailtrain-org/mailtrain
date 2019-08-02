'use strict';

const config = require('../lib/config');
const web = require('../lib/web');

module.exports = web({
    baseUrl: config.baseTrustedUrl,
    url: '/'
});
