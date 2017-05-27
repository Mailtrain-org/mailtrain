'use strict';

const config = require('../helpers/config');
const expect = require('chai').expect;
const driver = require('../helpers/driver');
const home = require('../page-objects/home')(driver);
const flash = require('../page-objects/flash')(driver);
const {
    login,
    account
} = require('../page-objects/users')(driver);

describe('login', function() {
    this.timeout(10000);

    before(() => driver.manage().deleteAllCookies());

    it('can access home page', async () => {
        await home.navigate();
    });

    it('can not access restricted content', async () => {
        driver.navigate().to(config.baseUrl + '/settings');
        flash.waitUntilVisible();
        expect(await flash.getText()).to.contain('Need to be logged in to access restricted content');
        await flash.clear();
    });

    it('can not login with false credentials', async () => {
        login.enterUsername(config.users.admin.username);
        login.enterPassword('invalid');
        login.submit();
        flash.waitUntilVisible();
        expect(await flash.getText()).to.contain('Incorrect username or password');
        await flash.clear();
    });

    it('can login as admin', async () => {
        login.enterUsername(config.users.admin.username);
        login.enterPassword(config.users.admin.password);
        login.submit();
        flash.waitUntilVisible();
        expect(await flash.getText()).to.contain('Logged in as admin');
    });

    it('can access account page as admin', async () => {
        await account.navigate();
    });

    it('can logout', async () => {
        driver.navigate().to(config.baseUrl + '/users/logout');
        flash.waitUntilVisible();
        expect(await flash.getText()).to.contain('logged out');
    });

    after(() => driver.quit());
});
