'use strict';

const config = require('../helpers/config');
const { useCase, step } = require('../helpers/mocha-e2e');
const shortid = require('shortid');
const expect = require('chai').expect;
const driver = require('../helpers/driver');

const page = require('../page-objects/subscription')(driver, config.lists.one);

function generateEmail() {
    return 'keep.' + shortid.generate() + '@mailtrain.org';
}

async function subscribe(testUserEmail) {
    const subscription = {
        email: testUserEmail
    };

    await step('User navigates to list subscription page', async () => {
        await page.webSubscribe.navigate();
    });

    await step('User submits a valid email', async () => {
        await page.webSubscribe.enterEmail(testUserEmail);
        await page.webSubscribe.submit();
    });

    await step('System shows a notice that further instructions are in the email', async () => {
        await page.webConfirmSubscriptionNotice.waitUntilVisible();
    });

    await step('System sends an email with a link to confirm the subscription', async () => {
        await page.mailConfirmSubscription.fetchMail(testUserEmail);
    });

    await step('User clicks confirm subscription in the email', async () => {
        await page.mailConfirmSubscription.click('confirmLink');
    });

    await step('System shows a notice that subscription has been confirmed', async () => {
        await page.webSubscribedNotice.waitUntilVisible();
    });

    await step('System sends an email with subscription confirmation', async () => {
        await page.mailSubscriptionConfirmed.fetchMail(testUserEmail);
        subscription.unsubscribeLink = await page.mailSubscriptionConfirmed.link('unsubscribeLink');
        subscription.manageLink = await page.mailSubscriptionConfirmed.link('manageLink');
    });

    return subscription;
}

describe('Subscription use-cases', function() {
    before(() => driver.manage().deleteAllCookies());

    useCase('Subscription to a public list (main scenario)', async () => {
        await subscribe(generateEmail());
    });

    useCase('Subscription to a public list (invalid email)', async () => {
        await step('User navigates to list subscribe page', async () => {
            await page.webSubscribe.navigate();
        });

        await step('User submits an invalid email', async () => {
            await page.webSubscribe.enterEmail('foo@bar.nope');
            await page.webSubscribe.submit();
        });

        await step('System shows a flash notice that email is invalid', async () => {
            await page.webSubscribe.waitForFlash();
            expect(await page.webSubscribe.getFlash()).to.contain('Invalid email address');
        });
    });

    useCase('Unsubscription from list #1 (one-step, no form)', async () => {
        const subscription = await subscribe(generateEmail());

        await step('User clicks the unsubscribe button', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System show a notice that confirms unsubscription', async () => {
            await page.webUnsubscribedNotice.waitUntilVisible();
        });

        await step('System sends an email that confirms unsubscription', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.email);
        });
    });
/*
    useCase('Change email in list #1 (one-step, no form)', async () => {
        const subscription = await subscribe(generateEmail());

        await step('User clicks the manage subscription button', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('System show a notice that confirms unsubscription', async () => {
            await page.webManage.waitUntilVisible();
        });
    });
*/
    after(() => driver.quit());
});
