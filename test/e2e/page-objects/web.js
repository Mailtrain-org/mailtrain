'use strict';

const config = require('../helpers/config');
const By = require('selenium-webdriver').By;
const url = require('url');

const page = require('./page');

module.exports = (driver, ...extras) => page(driver, {

    async navigate(path) {
        await this.driver.navigate().to(config.baseUrl + (path || this.url));
        await this.waitUntilVisible();
    },

    async ensureUrl(path) {
        const desiredUrl = path || this.url;

        if (desiredUrl) {
            const currentUrl = url.parse(await this.driver.getCurrentUrl());
            if (this.url !== currentUrl.pathname || config.baseUrl !== `${currentUrl.protocol}//${currentUrl.host}`) {
                throw new Error(`Unexpected URL. Expecting ${config.baseUrl}${this.url} got ${currentUrl.protocol}//${currentUrl.host}/${currentUrl.pathname}`);
            }
        }
    },

    async waitForFlash() {
        await this.waitUntilVisible('div.alert:not(.js-warning)');
    },

    async getFlash() {
        const elem = await this.driver.findElement(By.css('div.alert:not(.js-warning)'));
        return await elem.getText();
    },

    async clearFlash() {
        await this.driver.executeScript(`
            var elements = document.getElementsByClassName('alert');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        `);
    }
}, ...extras);
