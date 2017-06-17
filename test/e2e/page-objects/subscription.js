'use strict';

const config = require('../lib/config');
const web = require('../lib/web');
const mail = require('../lib/mail');
const expect = require('chai').expect;

const fieldHelpers = list => ({
    async fillFields(subscription) {
        if (subscription.EMAIL && this.url === `/subscription/${list.cid}`) {
            await this.setValue('emailInput', subscription.EMAIL);
        }

        if (subscription.FIRST_NAME) {
            await this.setValue('firstNameInput', subscription.FIRST_NAME);
        }

        if (subscription.LAST_NAME) {
            await this.setValue('lastNameInput', subscription.LAST_NAME);
        }

        for (const field of list.customFields) {
            if (field.key in subscription) {
                await this.setValue(`[name="${field.column}"]`, subscription[field.key]);
            }
        }
    },

    async assertFields(subscription) {
        if (subscription.EMAIL) {
            expect(await this.getValue('emailInput')).to.equal(subscription.EMAIL);
        }

        if (subscription.FIRST_NAME) {
            expect(await this.getValue('firstNameInput')).to.equal(subscription.FIRST_NAME);
        }

        if (subscription.LAST_NAME) {
            expect(await this.getValue('lastNameInput')).to.equal(subscription.LAST_NAME);
        }

        for (const field of list.customFields) {
            if (field.key in subscription) {
                expect(await this.getValue(`[name="${field.column}"]`)).to.equal(subscription[field.key]);
            }
        }
    }
});

module.exports = list => ({

    webSubscribe: web({
        url: `/subscription/${list.cid}`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Subscribe to list'],
        elements: {
            form: `form[action="/subscription/${list.cid}/subscribe"]`,
            emailInput: '#main-form input[name="email"]',
            firstNameInput: '#main-form input[name="first-name"]',
            lastNameInput: '#main-form input[name="last-name"]',
            submitButton: 'a[href="#submit"]'
        }
    }, fieldHelpers(list)),

    webSubscribeNonPublic: web({
        url: `/subscription/${list.cid}`,
        textsToWaitFor: ['The list does not allow public subscriptions'],
    }),

    webConfirmSubscriptionNotice: web({
        url: `/subscription/${list.cid}/confirm-subscription-notice`,
        textsToWaitFor: ['We need to confirm your email address']
    }),

    mailConfirmSubscription: mail({
        elementsToWaitFor: ['confirmLink'],
        textsToWaitFor: ['Please Confirm Subscription'],
        elements: {
            confirmLink: `a[href^="${config.settings['service-url']}subscription/confirm/subscribe/"]`
        }
    }),

    mailAlreadySubscribed: mail({
        elementsToWaitFor: ['unsubscribeLink'],
        textsToWaitFor: ['Email address already registered'],
        elements: {
            unsubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}/unsubscribe/"]`,
            manageLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}/manage/"]`
        },
        links: {
            unsubscribeLink: `/subscription/${list.cid}/unsubscribe/:ucid`,
            manageLink: `/subscription/${list.cid}/manage/:ucid`
        }
    }),

    webSubscribedNotice: web({
        url: `/subscription/${list.cid}/subscribed-notice`,
        textsToWaitFor: ['Subscription Confirmed']
    }),

    mailSubscriptionConfirmed: mail({
        elementsToWaitFor: ['unsubscribeLink'],
        textsToWaitFor: ['Subscription Confirmed'],
        elements: {
            unsubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}/unsubscribe/"]`,
            manageLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}/manage/"]`
        },
        links: {
            unsubscribeLink: `/subscription/${list.cid}/unsubscribe/:ucid`,
            manageLink: `/subscription/${list.cid}/manage/:ucid`
        }
    }),

    webManage: web({
        url: `/subscription/${list.cid}/manage/:ucid`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Update Your Preferences'],
        elements: {
            form: `form[action="/subscription/${list.cid}/manage"]`,
            emailInput: '#main-form input[name="email"]',
            firstNameInput: '#main-form input[name="first-name"]',
            lastNameInput: '#main-form input[name="last-name"]',
            submitButton: 'a[href="#submit"]',
            manageAddressLink: `a[href^="/subscription/${list.cid}/manage-address/"]`
        },
        links: {
            manageAddressLink: `/subscription/${list.cid}/manage-address/:ucid`
        }
    }, fieldHelpers(list)),

    webManageAddress: web({
        url: `/subscription/${list.cid}/manage-address/:ucid`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Update Your Email Address'],
        elements: {
            form: `form[action="/subscription/${list.cid}/manage-address"]`,
            emailInput: '#main-form input[name="email"]',
            emailNewInput: '#main-form input[name="email-new"]',
            submitButton: 'a[href="#submit"]'
        }
    }),

    mailConfirmAddressChange: mail({
        elementsToWaitFor: ['confirmLink'],
        textsToWaitFor: ['Please Confirm Subscription Address Change'],
        elements: {
            confirmLink: `a[href^="${config.settings['service-url']}subscription/confirm/change-address/"]`
        }
    }),

    webUpdatedNotice: web({
        url: `/subscription/${list.cid}/updated-notice`,
        textsToWaitFor: ['Profile Updated']
    }),

    webUnsubscribedNotice: web({
        url: `/subscription/${list.cid}/unsubscribed-notice`,
        textsToWaitFor: ['Unsubscribe Successful']
    }),

    mailUnsubscriptionConfirmed: mail({
        elementsToWaitFor: ['resubscribeLink'],
        textsToWaitFor: ['You Are Now Unsubscribed'],
        elements: {
            resubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}"]`
        }
    }),

    webUnsubscribe: web({
        elementsToWaitFor: ['submitButton'],
        textsToWaitFor: ['Unsubscribe'],
        elements: {
            submitButton: 'a[href="#submit"]'
        }
    }),

    webConfirmUnsubscriptionNotice: web({
        url: `/subscription/${list.cid}/confirm-unsubscription-notice`,
        textsToWaitFor: ['We need to confirm your email address']
    }),

    mailConfirmUnsubscription: mail({
        elementsToWaitFor: ['confirmLink'],
        textsToWaitFor: ['Please Confirm Unsubscription'],
        elements: {
            confirmLink: `a[href^="${config.settings['service-url']}subscription/confirm/unsubscribe/"]`
        }
    }),

    webManualUnsubscribeNotice: web({
        url: `/subscription/${list.cid}/manual-unsubscribe-notice`,
        elementsToWaitFor: ['contactLink'],
        textsToWaitFor: ['Online Unsubscription Is Not Possible', config.settings['admin-email']],
        elements: {
            contactLink: `a[href^="mailto:${config.settings['admin-email']}"]`
        }
    }),

});
