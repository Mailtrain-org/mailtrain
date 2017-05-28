'use strict';

/* eslint-disable prefer-arrow-callback */

const config = require('../lib/config');
const { useCase, step, precondition, driver } = require('../lib/mocha-e2e');
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
        await page.webConfirmSubscriptionNotice.waitUntilVisibleAfterRefresh();
    });

    await step('System sends an email with a link to confirm the subscription.', async () => {
        await page.mailConfirmSubscription.fetchMail(subscription.email);
    });

    await step('User clicks confirm subscription in the email', async () => {
        await page.mailConfirmSubscription.click('confirmLink');
    });

    await step('System shows a notice that subscription has been confirmed.', async () => {
        await page.webSubscribedNotice.waitUntilVisibleAfterRefresh();
    });

    await step('System sends an email with subscription confirmation.', async () => {
        await page.mailSubscriptionConfirmed.fetchMail(subscription.email);
        subscription.unsubscribeLink = await page.mailSubscriptionConfirmed.getHref('unsubscribeLink');
        subscription.manageLink = await page.mailSubscriptionConfirmed.getHref('manageLink');

        const unsubscribeParams = await page.mailSubscriptionConfirmed.getLinkParams('unsubscribeLink');
        const manageParams = await page.mailSubscriptionConfirmed.getLinkParams('manageLink');
        expect(unsubscribeParams.ucid).to.equal(manageParams.ucid);
        subscription.ucid = unsubscribeParams.ucid;
    });

    return subscription;
}

async function subscriptionExistsPrecondition(subscription) {
    await precondition('Subscription exists', 'Subscription to a public list (main scenario)', async () => {
        await subscribe(subscription);
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

    useCase('Subscription to a public list (email already registered)', async () => {
        const subscription = await subscriptionExistsPrecondition({
            email: generateEmail()
        });

        await step('User navigates to list subscribe page', async () => {
            await page.webSubscribe.navigate();
        });

        await step('User submits the email which has been already registered.', async () => {
            await page.webSubscribe.setValue('emailInput', subscription.email);
            await page.webSubscribe.submit();
        });

        await step('System shows a notice that further instructions are in the email.', async () => {
            await page.webConfirmSubscriptionNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email informing that the address has been already registered.', async () => {
            await page.mailAlreadySubscribed.fetchMail(subscription.email);
        });

    });

    useCase('Subscription to a non-public list');

    useCase('Change profile info', async () => {
        const subscription = await subscriptionExistsPrecondition({
            email: generateEmail(),
            firstName: 'John',
            lastName: 'Doe'
        });

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('Systems shows a form to change subscription details. The form contains data entered during subscription.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
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
            await page.webUpdatedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('User navigates to manage subscription again.', async () => {
            // await page.webManage.navigate(subscription.manageLink);
            await page.webManage.navigate({ ucid: subscription.ucid });
        });

        await step('Systems shows a form with the changes made previously.', async () => {
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.email);
            expect(await page.webManage.getValue('firstNameInput')).to.equal(subscription.firstName);
            expect(await page.webManage.getValue('lastNameInput')).to.equal(subscription.lastName);
        });
    });

    useCase('Change email', async () => {
        const subscription = await subscriptionExistsPrecondition({
            email: generateEmail(),
            firstName: 'John',
            lastName: 'Doe'
        });

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('Systems shows a form to change subscription details. The form contains data entered during subscription.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.email);
            expect(await page.webManage.getValue('firstNameInput')).to.equal(subscription.firstName);
            expect(await page.webManage.getValue('lastNameInput')).to.equal(subscription.lastName);
        });

        await step('User clicks the change address button.', async () => {
            await page.webManage.click('manageAddressLink');
        });

        await step('Systems shows a form to change email.', async () => {
            await page.webManageAddress.waitUntilVisibleAfterRefresh();
        });

        await step('User fills in a new email address and submits the form.', async () => {
            subscription.email = generateEmail();
            await page.webManageAddress.setValue('emailNewInput', subscription.email);
            await page.webManageAddress.submit();
        });

        await step('System goes back to the profile form and shows a flash notice that further instructions are in the email.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('An email with further instructions has been sent to the provided address');
        });

        await step('System sends an email with a link to confirm the address change.', async () => {
            await page.mailConfirmAddressChange.fetchMail(subscription.email);
        });

        await step('User clicks confirm subscription in the email', async () => {
            await page.mailConfirmAddressChange.click('confirmLink');
        });

        await step('System shows the profile form with a flash notice that address has been changed.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('Email address changed');
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.email);
        });

        await step('System sends an email with subscription confirmation.', async () => {
            await page.mailSubscriptionConfirmed.fetchMail(subscription.email);
        });
    });

    useCase('Unsubscription from list #1 (one-step, no form).', async () => {
        const subscription = await subscriptionExistsPrecondition({
            email: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.email);
        });
    });

    useCase('Unsubscription from list #2 (one-step, with form).');

    useCase('Unsubscription from list #3 (two-step, no form).');

    useCase('Unsubscription from list #4 (two-step, with form).');

    useCase('Unsubscription from list #5 (manual unsubscribe).');

    useCase('Resubscription.'); // This one is supposed to check that values pre-filled in resubscription (i.e. the re-subscribe link in unsubscription confirmation) are the same as the ones used before.
});
