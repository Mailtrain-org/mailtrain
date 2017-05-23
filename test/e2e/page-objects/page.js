'use strict';

const config = require('../helpers/config');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const fs = require('fs-extra');

module.exports = (driver, ...extras) => Object.assign({
    driver,

    elements: {},

    async element(key) {
        return await this.driver.findElement(By.css(this.elements[key] || key));
    },

    async waitUntilVisible(selector) {
        // This is left here to ease debugging
        // await this.sleep(2000);
        // await this.takeScreenshot('image.png');
        // console.log(await this.source());

        const sel = selector || this.elements[this.elementToWaitFor] || 'body';
        await this.driver.wait(until.elementLocated(By.css(sel)), 10000);

        if (this.url) {
            await this.ensureUrl();
        }
    },

    async link(key) {
        const elem = await this.element(key);
        return await elem.getAttribute('href');
    },

    async submit() {
        const submitButton = await this.element('submitButton');
        await submitButton.click();
    },

    async click(key) {
        const elem = await this.element(key);
        await elem.click();
    },

    async getText(key) {
        const elem = await this.element(key);
        return await elem.getText();
    },

    async getValue(key) {
        const elem = await this.element(key);
        return await elem.getAttribute('value');
    },

    async setValue(key, value) {
        const elem = await this.element(key);
        await elem.sendKeys(value);
    },

    async containsText(str) {
        return await this.driver.executeScript(`
            return (document.documentElement.textContent || document.documentElement.innerText).indexOf('${str}') > -1;
        `);
    },

    async source() {
        return await this.driver.getPageSource();
    },

    async takeScreenshot(destPath) {
        const pngData = await this.driver.takeScreenshot();
        const buf = new Buffer(pngData, 'base64');
        await fs.writeFile(destPath, buf);
    },

    async sleep(ms) {
        await this.driver.sleep(ms);
    }
}, ...extras);
