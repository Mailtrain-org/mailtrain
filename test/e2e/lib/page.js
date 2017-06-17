'use strict';

const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const fs = require('fs-extra');
const driver = require('./mocha-e2e').driver;
const url = require('url');
const UrlPattern = require('url-pattern');

const waitTimeout = 10000;

module.exports = (...extras) => Object.assign({
    elements: {},

    async getElement(key) {
        return await driver.findElement(By.css(this.elements[key] || key));
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
        await driver.wait(until.elementLocated(By.css('body')), waitTimeout);

        if (selector) {
            await driver.wait(until.elementLocated(By.css(selector)), waitTimeout);
        }

        for (const elem of (this.elementsToWaitFor || [])) {
            const sel = this.elements[elem];
            if (!sel) {
                throw new Error(`Element "${elem}" not found.`);
            }
            await driver.wait(until.elementLocated(By.css(sel)), waitTimeout);
        }

        for (const text of (this.textsToWaitFor || [])) {
            await driver.wait(new webdriver.Condition(`for text "${text}"`, async () => await this.containsText(text)), waitTimeout);
        }

        if (this.url) {
            await this.ensureUrl();
        }

        await driver.executeScript('document.mailTrainRefreshAcknowledged = true;');
    },

    async waitUntilVisibleAfterRefresh(selector) {
        await driver.wait(new webdriver.Condition('for refresh', async driver => {
            const val = await driver.executeScript('return document.mailTrainRefreshAcknowledged;');
            return !val;
        }), waitTimeout);

        await this.waitUntilVisible(selector);
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
            return (document.documentElement.innerText || document.documentElement.textContent).indexOf('${str}') > -1;
        `);
    },

    async getSource() {
        return await driver.getPageSource();
    },

    async saveSource(destPath) {
        const src = await this.getSource();
        await fs.writeFile(destPath, src);
    },

    async saveScreenshot(destPath) {
        const pngData = await driver.takeScreenshot();
        const buf = new Buffer(pngData, 'base64');
        await fs.writeFile(destPath, buf);
    },

    async saveSnapshot(destPathBase) {
        destPathBase = destPathBase || 'last-failed-e2e-test';
        const currentUrl = await driver.getCurrentUrl();
        const info = `URL: ${currentUrl}`;
        await fs.writeFile(destPathBase + '.info', info);
        await this.saveSource(destPathBase + '.html');
        await this.saveScreenshot(destPathBase + '.png');
    },

    async sleep(ms) {
        await driver.sleep(ms);
    }
}, ...extras);
