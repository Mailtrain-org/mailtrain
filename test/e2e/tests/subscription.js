'use strict';

const config = require('../helpers/config');
const shortid = require('shortid');
const expect = require('chai').expect;
const driver = require('../helpers/driver');

const page = require('../page-objects/page')(driver);
const flash = require('../page-objects/flash')(driver);

const {
    webSubscribe,
    webConfirmSubscriptionNotice,
    mailConfirmSubscription,
    webSubscribedNotice,
    mailSubscriptionConfirmed,
    webUnsubscribe,
    webUnsubscribedNotice,
    mailUnsubscriptionConfirmed
} = require('../page-objects/subscription')(driver, config.lists.one);

const testuser = {
    email: 'keep.' + shortid.generate() + '@mailtrain.org'
};

// console.log(testuser.email);

describe('subscribe (list one)', function() {
    this.timeout(10000);

    before(() => driver.manage().deleteAllCookies());

    it('visits web-subscribe', async () => {
        await webSubscribe.navigate();
    });

    it('submits invalid email (error)', async () => {
        webSubscribe.enterEmail('foo@bar.nope');
        webSubscribe.submit();
        flash.waitUntilVisible();
        expect(await flash.getText()).to.contain('Invalid email address');
    });

    it('submits valid email', async () => {
        webSubscribe.enterEmail(testuser.email);
        await webSubscribe.submit();
    });

    it('sees web-confirm-subscription-notice', async () => {
        webConfirmSubscriptionNotice.waitUntilVisible();
        expect(await page.containsText('Almost Finished')).to.be.true;
    });

    it('receives mail-confirm-subscription', async () => {
        mailConfirmSubscription.navigate(testuser.email);
        expect(await page.containsText('Please Confirm Subscription')).to.be.true;
    });

    it('clicks confirm subscription', async () => {
        await mailConfirmSubscription.click('confirmLink');
    });

    it('sees web-subscribed-notice', async () => {
        webSubscribedNotice.waitUntilVisible();
        expect(await page.containsText('Subscription Confirmed')).to.be.true;
    });

    it('receives mail-subscription-confirmed', async () => {
        mailSubscriptionConfirmed.navigate(testuser.email);
        expect(await page.containsText('Subscription Confirmed')).to.be.true;
    });
});

describe('unsubscribe (list one)', function() {
    this.timeout(10000);

    it('clicks unsubscribe', async () => {
        await mailSubscriptionConfirmed.click('unsubscribeLink');
    });

    it('sees web-unsubscribe', async () => {
        webUnsubscribe.waitUntilVisible();
        expect(await page.containsText('Unsubscribe')).to.be.true;
    });

    it('clicks confirm unsubscription', async () => {
        await webUnsubscribe.submit();
    });

    it('sees web-unsubscribed-notice', async () => {
        webUnsubscribedNotice.waitUntilVisible();
        expect(await page.containsText('Unsubscribe Successful')).to.be.true;
    });

    it('receives mail-unsubscription-confirmed', async () => {
        mailUnsubscriptionConfirmed.navigate(testuser.email);
        expect(await page.containsText('You Are Now Unsubscribed')).to.be.true;
    });

    after(() => driver.quit());
});
