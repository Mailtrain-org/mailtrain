'use strict';

const config = require('../helpers/config');

const page = require('./page');

module.exports = (driver, ...extras) => page(driver, {

    async fetchMail(address) {
        await this.driver.sleep(1000);
        await this.driver.navigate().to(`${config.mailUrl}/${address}`);
        await this.waitUntilVisible();
    },

    async ensureUrl(path) {
        throw new Error('Unsupported method.');
    },

}, ...extras);
