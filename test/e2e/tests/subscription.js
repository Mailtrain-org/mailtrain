'use strict';

/* eslint-disable prefer-arrow-callback */

const config = require('../lib/config');
const { useCase, step, precondition, driver } = require('../lib/mocha-e2e');
const shortid = require('shortid');
const expect = require('chai').expect;
const createPage = require('../page-objects/subscription');
const faker = require('faker');
const request = require('request-promise');

function getPage(listConf) {
    return createPage(listConf);
}

function generateEmail() {
    return 'keep.' + shortid.generate() + '@gmail.com';
}

function generateCustomFieldValue(field) {
    // https://github.com/marak/Faker.js/#api-methods
    switch (field.type) {
        case 'text':
            return faker.lorem.words();
        case 'website':
            return faker.internet.url();
        case 'gpg':
            return '';
        case 'longtext':
            return faker.lorem.lines();
        case 'json':
            return `{"say":"${faker.lorem.word()}"}`;
        case 'number':
            return faker.random.number().toString();
        case 'option':
            return Math.round(Math.random());
        case 'date-us':
            return '10/20/2017';
        case 'date-eur':
            return '20/10/2017';
        case 'birthday-us':
            return '10/20';
        case 'birthday-eur':
            return '20/10';
        default:
            return '';
    }
}

function generateSubscriptionData(listConf) {
    const data = {
        EMAIL: generateEmail(),
        FIRST_NAME: faker.name.firstName(),
        LAST_NAME: faker.name.lastName(),
        TIMEZONE: 'Europe/Tallinn',
    };

    listConf.customFields.forEach(field => {
        data[field.key] = generateCustomFieldValue(field);
    });

    return data;
}

function changeSubscriptionData(listConf, subscription) {
    const data = generateSubscriptionData(listConf);
    delete data.EMAIL;
    const changedSubscription = Object.assign({}, subscription, data);
    // TODO: Make sure values have actually changed.
    return changedSubscription;
}

async function subscribe(listConf, subscription) {
    const page = getPage(listConf);

    await step('User navigates to list subscription page.', async () => {
        await page.webSubscribe.navigate();
    });

    await step('User submits a valid email and other subscription info.', async () => {
        await page.webSubscribe.fillFields(subscription);
        await page.webSubscribe.submit();
    });

    await step('System shows a notice that further instructions are in the email.', async () => {
        await page.webConfirmSubscriptionNotice.waitUntilVisibleAfterRefresh();
    });

    await step('System sends an email with a link to confirm the subscription.', async () => {
        await page.mailConfirmSubscription.fetchMail(subscription.EMAIL);
    });

    await step('User clicks confirm subscription in the email', async () => {
        await page.mailConfirmSubscription.click('confirmLink');
    });

    await step('System shows a notice that subscription has been confirmed.', async () => {
        await page.webSubscribedNotice.waitUntilVisibleAfterRefresh();
    });

    await step('System sends an email with subscription confirmation.', async () => {
        await page.mailSubscriptionConfirmed.fetchMail(subscription.EMAIL);
        subscription.unsubscribeLink = await page.mailSubscriptionConfirmed.getHref('unsubscribeLink');
        subscription.manageLink = await page.mailSubscriptionConfirmed.getHref('manageLink');

        const unsubscribeParams = await page.mailSubscriptionConfirmed.getLinkParams('unsubscribeLink');
        const manageParams = await page.mailSubscriptionConfirmed.getLinkParams('manageLink');
        expect(unsubscribeParams.ucid).to.equal(manageParams.ucid);
        subscription.ucid = unsubscribeParams.ucid;
    });

    return subscription;
}

async function subscriptionExistsPrecondition(listConf, subscription) {
    await precondition('Subscription exists', 'Subscription to a public list (main scenario)', async () => {
        await subscribe(listConf, subscription);
    });
    return subscription;
}

suite('Subscription use-cases', () => {
    before(() => driver.manage().deleteAllCookies());

    useCase('Subscription to a public list (main scenario)', async () => {
        await subscribe(config.lists.l1, {
            EMAIL: generateEmail()
        });
    });

    useCase('Subscription to a public list (invalid email)', async () => {
        const page = getPage(config.lists.l1);

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
        const page = getPage(config.lists.l1);

        const subscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail()
        });

        await step('User navigates to list subscribe page', async () => {
            await page.webSubscribe.navigate();
        });

        await step('User submits the email which has been already registered.', async () => {
            await page.webSubscribe.setValue('emailInput', subscription.EMAIL);
            await page.webSubscribe.submit();
        });

        await step('System shows a notice that further instructions are in the email.', async () => {
            await page.webConfirmSubscriptionNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email informing that the address has been already registered.', async () => {
            await page.mailAlreadySubscribed.fetchMail(subscription.EMAIL);
        });

    });

    useCase('Subscription to a non-public list', async () => {
        const page = getPage(config.lists.l6);

        await step('User navigates to list subscription page and sees message that this list does not allow public subscriptions.', async () => {
            await page.webSubscribeNonPublic.navigate();
        });
    });

    useCase('Change profile info', async () => {
        const page = getPage(config.lists.l1);

        let subscription = await subscriptionExistsPrecondition(config.lists.l1, generateSubscriptionData(config.lists.l1));

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('Systems shows a form to change subscription details. The form contains data entered during subscription.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.assertFields(subscription);
        });

        await step('User enters other values and submits the form.', async () => {
            subscription = changeSubscriptionData(config.lists.l1, subscription);
            await page.webManage.fillFields(subscription);
            await page.webManage.submit();
        });

        await step('Systems shows a notice that profile has been updated.', async () => {
            await page.webUpdatedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('User navigates to manage subscription again.', async () => {
            await page.webManage.navigate({ ucid: subscription.ucid });
        });

        await step('Systems shows a form with the changes made previously.', async () => {
            await page.webManage.assertFields(subscription);
        });
    });

    useCase('Change email', async () => {
        const page = getPage(config.lists.l1);

        const subscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail(),
            FIRST_NAME: 'John',
            LAST_NAME: 'Doe'
        });

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('Systems shows a form to change subscription details. The form contains data entered during subscription.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.fillFields(subscription);
        });

        await step('User clicks the change address button.', async () => {
            await page.webManage.click('manageAddressLink');
        });

        await step('Systems shows a form to change email.', async () => {
            await page.webManageAddress.waitUntilVisibleAfterRefresh();
        });

        await step('User fills in a new email address and submits the form.', async () => {
            subscription.EMAIL = generateEmail();
            await page.webManageAddress.setValue('emailNewInput', subscription.EMAIL);
            await page.webManageAddress.submit();
        });

        await step('System goes back to the profile form and shows a flash notice that further instructions are in the email.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('An email with further instructions has been sent to the provided address');
        });

        await step('System sends an email with a link to confirm the address change.', async () => {
            await page.mailConfirmAddressChange.fetchMail(subscription.EMAIL);
        });

        await step('User clicks confirm subscription in the email', async () => {
            await page.mailConfirmAddressChange.click('confirmLink');
        });

        await step('System shows the profile form with a flash notice that address has been changed.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('Email address changed');
            expect(await page.webManage.getValue('emailInput')).to.equal(subscription.EMAIL);
        });

        await step('System sends an email with subscription confirmation.', async () => {
            await page.mailSubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });
    });

    useCase('Unsubscription from list #1 (one-step, no form).', async () => {
        const page = getPage(config.lists.l1);

        const subscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });
    });

    useCase('Unsubscription from list #2 (one-step, with form).', async () => {
        const page = getPage(config.lists.l2);

        const subscription = await subscriptionExistsPrecondition(config.lists.l2, {
            EMAIL: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('Systems shows a form to unsubscribe.', async () => {
            await page.webUnsubscribe.waitUntilVisibleAfterRefresh();
        });

        await step('User confirms unsubscribe and clicks the unsubscribe button.', async () => {
            await page.webUnsubscribe.submit();
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });
    });

    useCase('Unsubscription from list #3 (two-step, no form).', async () => {
        const page = getPage(config.lists.l3);

        const subscription = await subscriptionExistsPrecondition(config.lists.l3, {
            EMAIL: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System shows a notice that further instructions are in the email.', async () => {
            await page.webConfirmUnsubscriptionNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email with a link to confirm unsubscription.', async () => {
            await page.mailConfirmUnsubscription.fetchMail(subscription.EMAIL);
        });

        await step('User clicks the confirm unsubscribe button in the email.', async () => {
            await page.mailConfirmUnsubscription.click('confirmLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });
    });

    useCase('Unsubscription from list #4 (two-step, with form).', async () => {
        const page = getPage(config.lists.l4);

        const subscription = await subscriptionExistsPrecondition(config.lists.l4, {
            EMAIL: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('Systems shows a form to unsubscribe.', async () => {
            await page.webUnsubscribe.waitUntilVisibleAfterRefresh();
        });

        await step('User confirms unsubscribe and clicks the unsubscribe button.', async () => {
            await page.webUnsubscribe.submit();
        });

        await step('System shows a notice that further instructions are in the email.', async () => {
            await page.webConfirmUnsubscriptionNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email with a link to confirm unsubscription.', async () => {
            await page.mailConfirmUnsubscription.fetchMail(subscription.EMAIL);
        });

        await step('User clicks the confirm unsubscribe button in the email.', async () => {
            await page.mailConfirmUnsubscription.click('confirmLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });
    });

    useCase('Unsubscription from list #5 (manual unsubscribe).', async () => {
        const page = getPage(config.lists.l5);

        await subscriptionExistsPrecondition(config.lists.l5, {
            EMAIL: generateEmail()
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('Systems shows a notice that online unsubscription is not possible.', async () => {
            await page.webManualUnsubscribeNotice.waitUntilVisibleAfterRefresh();
        });
    });

    useCase('Resubscription.', async () => {
        const page = getPage(config.lists.l1);

        const subscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail(),
            FIRST_NAME: 'John',
            LAST_NAME: 'Doe'
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });

        await step('User clicks the resubscribe button.', async () => {
            await page.mailUnsubscriptionConfirmed.click('resubscribeLink');
        });

        await step('Systems shows the subscription form. The form contains data entered during initial subscription.', async () => {
            await page.webSubscribe.waitUntilVisibleAfterRefresh();
            expect(await page.webSubscribe.getValue('emailInput')).to.equal(subscription.EMAIL);
            expect(await page.webSubscribe.getValue('firstNameInput')).to.equal(subscription.FIRST_NAME);
            expect(await page.webSubscribe.getValue('lastNameInput')).to.equal(subscription.LAST_NAME);
        });

        await step('User submits the subscription form.', async () => {
            await page.webSubscribe.submit();
        });

        await step('System shows a notice that further instructions are in the email.', async () => {
            await page.webConfirmSubscriptionNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email with a link to confirm the subscription.', async () => {
            await page.mailConfirmSubscription.fetchMail(subscription.EMAIL);
        });

        await step('User clicks confirm subscription in the email', async () => {
            await page.mailConfirmSubscription.click('confirmLink');
        });

        await step('System shows a notice that subscription has been confirmed.', async () => {
            await page.webSubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email with subscription confirmation. The manage and unsubscribe links are identical with the initial subscription.', async () => {
            await page.mailSubscriptionConfirmed.fetchMail(subscription.EMAIL);
            const unsubscribeLink = await page.mailSubscriptionConfirmed.getHref('unsubscribeLink');
            const manageLink = await page.mailSubscriptionConfirmed.getHref('manageLink');
            expect(subscription.unsubscribeLink).to.equal(unsubscribeLink);
            expect(subscription.manageLink).to.equal(manageLink);
        });
    });

    useCase('A subscriber address can be changed to an address which has been previously unsubscribed. #222', async () => {
        const page = getPage(config.lists.l1);

        const oldSubscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail(),
            FIRST_NAME: 'old first name',
            LAST_NAME: 'old last name'
        });

        await step('User clicks the unsubscribe button.', async () => {
            await page.mailSubscriptionConfirmed.click('unsubscribeLink');
        });

        await step('System shows a notice that confirms unsubscription.', async () => {
            await page.webUnsubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email that confirms unsubscription.', async () => {
            await page.mailUnsubscriptionConfirmed.fetchMail(oldSubscription.EMAIL);
        });

        const newSubscription = await subscriptionExistsPrecondition(config.lists.l1, {
            EMAIL: generateEmail(),
            FIRST_NAME: 'new first name'
        });

        await step('User clicks the manage subscription button.', async () => {
            await page.mailSubscriptionConfirmed.click('manageLink');
        });

        await step('User clicks the change address button.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.click('manageAddressLink');
        });

        await step('Systems shows a form to change email.', async () => {
            await page.webManageAddress.waitUntilVisibleAfterRefresh();
        });

        await step('User fills in the email address of the original subscription and submits the form.', async () => {
            await page.webManageAddress.setValue('emailNewInput', oldSubscription.EMAIL);
            await page.webManageAddress.submit();
        });

        await step('System goes back to the profile form and shows a flash notice that further instructions are in the email.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('An email with further instructions has been sent to the provided address');
        });

        await step('System sends an email with a link to confirm the address change.', async () => {
            await page.mailConfirmAddressChange.fetchMail(oldSubscription.EMAIL);
        });

        await step('User clicks confirm subscription in the email', async () => {
            await page.mailConfirmAddressChange.click('confirmLink');
        });

        await step('System shows the profile form with a flash notice that address has been changed. The form does not contain data from the old subscription.', async () => {
            await page.webManage.waitUntilVisibleAfterRefresh();
            await page.webManage.waitForFlash();
            expect(await page.webManage.getFlash()).to.contain('Email address changed');
            expect(await page.webManage.getValue('emailInput')).to.equal(oldSubscription.EMAIL);
            expect(await page.webManage.getValue('firstNameInput')).to.equal(newSubscription.FIRST_NAME);
            expect(await page.webManage.getValue('lastNameInput')).to.equal('');
        });

        await step('System sends an email with subscription confirmation.', async () => {
            await page.mailSubscriptionConfirmed.fetchMail(oldSubscription.EMAIL);
        });
    });

});


async function apiSubscribe(listConf, subscription) {
    await step('Add subscription via API call.', async () => {
        const response = await request({
            uri: `${config.baseUrl}/api/subscribe/${listConf.cid}?access_token=${config.users.admin.accessToken}`,
            method: 'POST',
            json: subscription
        });
        expect(response.error).to.be.a('undefined');
        expect(response.data.id).to.be.a('string');
        subscription.ucid = response.data.id;
    });
    return subscription;
}

suite('API Subscription use-cases', () => {

    useCase('Subscription to list #1, without confirmation.', async () => {
        const page = getPage(config.lists.l1);
        const subscription = await apiSubscribe(config.lists.l1, generateSubscriptionData(config.lists.l1));

        await step('User navigates to manage subscription.', async () => {
            await page.webManage.navigate({ ucid: subscription.ucid });
        });

        await step('Systems shows a form containing the data submitted with the API call.', async () => {
            await page.webManage.assertFields(subscription);
        });
    });

    useCase('Subscription to list #1, with confirmation.', async () => {
        const page = getPage(config.lists.l1);

        const subscription = await apiSubscribe(config.lists.l1, Object.assign(generateSubscriptionData(config.lists.l1), {
            REQUIRE_CONFIRMATION: 'yes'
        }));

        await step('System sends an email with a link to confirm the subscription.', async () => {
            await page.mailConfirmSubscription.fetchMail(subscription.EMAIL);
        });

        await step('User clicks confirm subscription in the email', async () => {
            await page.mailConfirmSubscription.click('confirmLink');
        });

        await step('System shows a notice that subscription has been confirmed.', async () => {
            await page.webSubscribedNotice.waitUntilVisibleAfterRefresh();
        });

        await step('System sends an email with subscription confirmation.', async () => {
            await page.mailSubscriptionConfirmed.fetchMail(subscription.EMAIL);
        });

        await step('User navigates to manage subscription.', async () => {
            await page.webManage.navigate({ ucid: subscription.ucid });
        });

        await step('Systems shows a form containing the data submitted with the API call.', async () => {
            await page.webManage.assertFields(subscription);
        });
    });

    useCase('Change profile info', async () => {
        const page = getPage(config.lists.l1);

        const initialSubscription = await apiSubscribe(config.lists.l1, generateSubscriptionData(config.lists.l1));

        const update = changeSubscriptionData(config.lists.l1, initialSubscription);
        delete update.FIRST_NAME;

        const changedSubscription = await apiSubscribe(config.lists.l1, update);
        changedSubscription.FIRST_NAME = initialSubscription.FIRST_NAME;

        expect(changedSubscription.ucid).to.equal(initialSubscription.ucid);

        await step('User navigates to manage subscription.', async () => {
            await page.webManage.navigate({ ucid: changedSubscription.ucid });
        });

        await step('Systems shows a form containing the updated subscription data.', async () => {
            await page.webManage.assertFields(changedSubscription);
        });
    });

    useCase('Unsubscribe', async () => {
        const subscription = await apiSubscribe(config.lists.l1, generateSubscriptionData(config.lists.l1));

        await step('Unsubsribe via API call.', async () => {
            const response = await request({
                uri: `${config.baseUrl}/api/unsubscribe/${config.lists.l1.cid}?access_token=${config.users.admin.accessToken}`,
                method: 'POST',
                json: {
                    EMAIL: subscription.EMAIL
                }
            });

            expect(response.error).to.be.a('undefined');
            expect(response.data.id).to.be.a('number'); // FIXME Shouldn't data.id be the cid instead of the DB id?
            expect(response.data.unsubscribed).to.equal(true);
        });
    });

});
