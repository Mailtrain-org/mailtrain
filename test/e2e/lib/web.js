'use strict';

const config = require('./config');
const By = require('selenium-webdriver').By;
const url = require('url');
const UrlPattern = require('url-pattern');
const driver = require('./mocha-e2e').driver;
const page = require('./page');

module.exports = (...extras) => page({

    async navigate(pathOrParams) {
        let path;
        if (typeof pathOrParams === 'string') {
            path = pathOrParams;
        } else {
            const urlPattern = new UrlPattern(this.requestUrl || this.url);
            path = urlPattern.stringify(pathOrParams);
        }

        const parsedUrl = url.parse(path);
        let absolutePath;
        if (parsedUrl.host) {
            absolutePath = path;
        } else {
            absolutePath = config.baseUrl + path;
        }

        await driver.navigate().to(absolutePath);
        await this.waitUntilVisible();
    },

    async ensureUrl(path) {
        const desiredUrl = path || this.url;

        if (desiredUrl) {
            const currentUrl = url.parse(await driver.getCurrentUrl());
            const urlPattern = new UrlPattern(desiredUrl);
            const params = urlPattern.match(currentUrl.pathname);
            if (!params || config.baseUrl !== `${currentUrl.protocol}//${currentUrl.host}`) {
                throw new Error(`Unexpected URL. Expecting ${config.baseUrl}${this.url} got ${currentUrl.protocol}//${currentUrl.host}/${currentUrl.pathname}`);
            }

            this.params = params;
        }
    },

    async submit() {
        const submitButton = await this.getElement('submitButton');
        await submitButton.click();
    },

    async waitForFlash() {
        await this.waitUntilVisible('div.alert:not(.js-warning)');
    },

    async getFlash() {
        const elem = await driver.findElement(By.css('div.alert:not(.js-warning)'));
        return await elem.getText();
    },

    async clearFlash() {
        await driver.executeScript(`
            var elements = document.getElementsByClassName('alert');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        `);
    },

    async setValue(key, value) {
        const elem = await this.getElement(key);
        await elem.clear();
        await elem.sendKeys(value);
    }

}, ...extras);
