'use strict';

const config = require('../helpers/config');
const { useCase, step, driver } = require('../helpers/mocha-e2e');
const shortid = require('shortid');
const expect = require('chai').expect;

const page = require('../page-objects/subscription')(config.lists.one);

function generateEmail() {
    return 'keep.' + shortid.generate() + '@mailtrain.org';
}

async function subscribe(subscription) {
    await step('User navigates to list subscription page.', async () => {
        await page.webSubscribe.navigate();
    });

    await step('User submits a valid email and other subscription info.', async () => {
        await page.webSubscribe.setValue('emailInput', subscription.email);

        if (subscription.firstName) {
            await page.webSubscribe.setValue('firstNameInput', subscription.firstName);
        }

        if (subscription.lastName) {
            await page.webSubscribe.setValue('lastNameInput', subscription.lastName);
        }

        await page.webSubscribe.submit();
    });

    await step('System shows a notice that further instructions are in the email.', async () => {
        await page.webConfirmSubscriptionNotice.waitUntilVisible();
    });

    await step('System sends an email with a link to confirm the subscription.', async () => {
        await page.mailConfirmSubscription.fetchMail(subscription.email);
    });

    await step('User clicks confirm subscription in the email', async () => {
        await page.mailConfirmSubscription.click('confirmLink');
    });

    await step('System shows a notice that subscription has been confirmed.', async () => {
        await page.webSubscribedNotice.waitUntilVisible();
    });

    await step('System sends an email with subscription confirmation.', async () => {
        await page.mailSubscriptionConfirmed.fetchMail(subscription.email);
        subscription.unsubscribeLink = await page.mailSubscriptionConfirmed.getHref('unsubscribeLink');
        subscription.manageLink = await page.mailSubscriptionConfirmed.getHref('manageLink');

        const unsubscribeParams = await page.mailSubscriptionConfirmed.getLinkParams('unsubscribeLink');
        const manageParams = await page.mailSubscriptionConfirmed.getLinkParams('manageLink');
        console.log(unsubscribeParams);
        console.log(manageParams);
        expect(unsubscribeParams.ucid).to.equal(manageParams.ucid);
        subscription.ucid = unsubscribeParams.ucid;
    });

    return subscription;
}

suite('Subscription use-cases', function() {
    before(() => driver.manage().deleteAllCookies());

    useCase('Subscription to a public list (main scenario)', async () => {
        await subscribe({
            email: generateEmail()
        });
    });

    useCase('Subscription to a public list (invalid email)', async () => {
        await step('User navigates to list subscribe page', async () => {
            await page.webSubscribe.navigate();
        });

        await step('User submits an invalid email.', async () => {
            await page.webSubscribe.setValue('emailInput', 'foo@bar.nope');
            await page.webSubscribe.submit();
        });

        await step('System shows a flash notice that email is invalid.', async () => {
            await page.webSubscribe.waitForFlash();
            expect(await page.webSubscribe.getFlash()).to.contain('Invalid email address');
        });
    });

    useCase('Unsubscription from list #1 (one-step, no form).', async () => {
        const subscription = await subscribe({
            email: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System show a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisible();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.email);
        });
    });

    useCase.only('Change email in list #1 (one-step, no form)', async () => {
        const subscription = await subscribe({
            email: generateEmail(),
            firstName: 'John',
            lastName: 'Doe'
        });

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('Systems shows a form to change subscription details. The form contains data entered during subscription.', async () => {
            await page.webManage.waitUntilVisible();
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.email);
            expect(await page.webManage.getValue('firstNameInput')).to.equal(subscription.firstName);
            expect(await page.webManage.getValue('lastNameInput')).to.equal(subscription.lastName);
        });

        await step('User enters another name and submits the form.', async () => {
            subscription.firstName = 'Adam';
            subscription.lastName = 'B';
            await page.webManage.setValue('firstNameInput', subscription.firstName);
            await page.webManage.setValue('lastNameInput', subscription.lastName);
            await page.webManage.submit();
        });

        await step('Systems shows a notice that profile has been updated.', async () => {
            await page.webUpdatedNotice.waitUntilVisible();
        });

        await step('User navigates to manage subscription again.', async () => {
            await page.webManage.navigate(subscription.manageLink);
            // await page.webManage.navigate({ ucid: subscription.ucid });
        });

        await step('Systems shows a form with the changes made previously.', async () => {
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.email);
            expect(await page.webManage.getValue('firstNameInput')).to.equal(subscription.firstName);
            expect(await page.webManage.getValue('lastNameInput')).to.equal(subscription.lastName);
        });

    });
});
