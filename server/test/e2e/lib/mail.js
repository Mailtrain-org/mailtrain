'use strict';

const config = require('./config');
const driver = require('./mocha-e2e').driver;
const page = require('./page');

module.exports = (...extras) => page({

    async fetchMail(address) {
        await driver.sleep(1000);
        await driver.navigate().to(`${config.mailUrl}/${address}`);
        await this.waitUntilVisible();
    },

    async ensureUrl() {
        throw new Error('Unsupported method.');
    }

}, ...extras);
