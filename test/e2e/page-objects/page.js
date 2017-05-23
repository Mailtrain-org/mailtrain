'use strict';

const config = require('../helpers/config');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const fs = require('fs-extra');
const driver = require('../helpers/mocha-e2e').driver;
const url = require('url');
const UrlPattern = require('url-pattern');

module.exports = (...extras) => Object.assign({
    elements: {},

    async getElement(key) {
        return await driver.findElement(By.css(this.elements[key]));
    },

    async getLinkParams(key) {
        const elem = await driver.findElement(By.css(this.elements[key]));

        const linkUrl = await elem.getAttribute('href');
        const linkPath = url.parse(linkUrl).path;

        const urlPattern = new UrlPattern(this.links[key]);

        const params = urlPattern.match(linkPath);
        if (!params) {
            throw new Error(`Cannot match URL pattern ${this.links[key]}`);
        }
        return params;
    },

    async waitUntilVisible(selector) {
        const sel = selector || this.elements[this.elementToWaitFor] || 'body';

        await driver.wait(until.elementLocated(By.css(sel)), 10000);

        if (this.url) {
            await this.ensureUrl();
        }
    },

    async click(key) {
        const elem = await this.getElement(key);
        await elem.click();
    },

    async getHref(key) {
        const elem = await this.getElement(key);
        return await elem.getAttribute('href');
    },

    async getText(key) {
        const elem = await this.getElement(key);
        return await elem.getText();
    },

    async getValue(key) {
        const elem = await this.getElement(key);
        return await elem.getAttribute('value');
    },

    async containsText(str) {
        return await driver.executeScript(`
            return (document.documentElement.textContent || document.documentElement.innerText).indexOf('${str}') > -1;
        `);
    },

    async getSource() {
        return await driver.getPageSource();
    },

    async saveSource(destPath) {
        const src = await this.getSource();
        await fs.writeFile(destPath, src);
    },

    async takeScreenshot(destPath) {
        const pngData = await driver.takeScreenshot();
        const buf = new Buffer(pngData, 'base64');
        await fs.writeFile(destPath, buf);
    },

    async sleep(ms) {
        await driver.sleep(ms);
    }
}, ...extras);
