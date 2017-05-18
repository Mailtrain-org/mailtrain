'use strict';

const config = require('./config');
const webdriver = require('selenium-webdriver');

const driver = new webdriver.Builder()
    .forBrowser(config.app.seleniumwebdriver.browser || 'phantomjs')
    .build();

if (global.USE_SHARED_DRIVER === true) {
    driver.originalQuit = driver.quit;
    driver.quit = () => {};
}

module.exports = driver;
