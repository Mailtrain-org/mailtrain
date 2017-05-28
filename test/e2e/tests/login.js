'use strict';

/* eslint-disable prefer-arrow-callback */

const config = require('../lib/config');
const { useCase, step, driver } = require('../lib/mocha-e2e');
const expect = require('chai').expect;

const page = require('../page-objects/user');
const home = require('../page-objects/home');

suite('Login use-cases', () => {
    before(() => driver.manage().deleteAllCookies());

    test('User can access home page', async () => {
        await home.navigate();
    });

    test('Anonymous user cannot access restricted content', async () => {
        await driver.navigate().to(config.baseUrl + '/settings');
        await page.login.waitUntilVisible();
        await page.login.waitForFlash();
        expect(await page.login.getFlash()).to.contain('Need to be logged in to access restricted content');
    });

    useCase('Login (invalid credential)', async () => {
        await step('User navigates to the login page.', async () => {
            await page.login.navigate();
        });

        await step('User fills in the user name and incorrect password.', async () => {
            await page.login.setValue('usernameInput', config.users.admin.username);
            await page.login.setValue('passwordInput', 'invalid');
            await page.login.submit();
        });

        await step('System shows a flash notice that credentials are invalid.', async () => {
            await page.login.waitForFlash();
            expect(await page.login.getFlash()).to.contain('Incorrect username or password');
        });
    });

    useCase('Login and logout', async () => {
        await step('User navigates to the login page.', async () => {
            await page.login.navigate();
        });

        await step('User fills in the user name and password.', async () => {
            await page.login.setValue('usernameInput', config.users.admin.username);
            await page.login.setValue('passwordInput', config.users.admin.password);
            await page.login.submit();
        });

        await step('System shows the home page and a flash notice that user has been logged in.', async () => {
            await home.waitUntilVisibleAfterRefresh();
            await home.waitForFlash();
            expect(await home.getFlash()).to.contain('Logged in as admin');
        });

        await step('User navigates to its account.', async () => {
            await page.account.navigate();
        });

        await step('User logs out.', async () => {
            await page.logout.navigate();
            await home.waitForFlash();
            expect(await home.getFlash()).to.contain('logged out');
        });
    });
});
