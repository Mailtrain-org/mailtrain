'use strict';

const config = require('../helpers/config');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

module.exports = driver => ({
    driver,
    url: '/',
    elements: {},

    element(key) {
        return this.driver.findElement(By.css(this.elements[key] || key));
    },

    navigate() {
        this.driver.navigate().to(config.baseUrl + this.url);
        return this.waitUntilVisible();
    },

    waitUntilVisible() {
        let selector = this.elements[this.elementToWaitFor];
        if (!selector && this.url) {
            selector = 'body.page--' + (this.url.substring(1).replace(/\//g, '--') || 'home');
        }
        return selector ? this.driver.wait(until.elementLocated(By.css(selector))) : this.driver.sleep(1000);
    },

    submit() {
        return this.element('submitButton').click();
    },

    click(key) {
        return this.element(key).click();
    },

    getText(key) {
        return this.element(key).getText();
    },

    getValue(key) {
        return this.element(key).getAttribute('value');
    },

    setValue(key, value) {
        return this.element(key).sendKeys(value);
    },

    containsText(str) {
        // let text = await driver.findElement({ css: 'body' }).getText();
        return this.driver.executeScript(`
            return (document.documentElement.textContent || document.documentElement.innerText).indexOf('${str}') > -1;
        `);
    }
});
