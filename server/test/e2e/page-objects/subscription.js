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
                await this.setValue(`[name="${field.key}"]`, subscription[field.key]);
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
                expect(await this.getValue(`[name="${field.key}"]`)).to.equal(subscription[field.key]);
            }
        }
    }
});

module.exports = list => ({

    webSubscribe: web({
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Subscribe to list'],
        elements: {
            form: `form[action="/subscription/${list.cid}/subscribe"]`,
            emailInput: '#main-form input[name="EMAIL"]',
            firstNameInput: '#main-form input[name="FIRST_NAME"]',
            lastNameInput: '#main-form input[name="LAST_NAME"]',
            submitButton: 'a[href="#submit"]'
        }
    }, fieldHelpers(list)),

    webSubscribeAfterPost: web({
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/subscribe`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Subscribe to list'],
        elements: {
            form: `form[action="/subscription/${list.cid}/subscribe"]`,
            emailInput: '#main-form input[name="EMAIL"]',
            firstNameInput: '#main-form input[name="FIRST_NAME"]',
            lastNameInput: '#main-form input[name="LAST_NAME"]',
            submitButton: 'a[href="#submit"]'
        }
    }, fieldHelpers(list)),

    webSubscribeNonPublic: web({
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}`,
        textsToWaitFor: ['Permission denied'],
    }),

    webConfirmSubscriptionNotice: web({
        baseUrl: config.basePublicUrl,
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
        baseUrl: config.basePublicUrl,
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
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/manage/:ucid`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Update Your Preferences'],
        elements: {
            form: `form[action="/subscription/${list.cid}/manage"]`,
            emailInput: '#main-form input[name="EMAIL"]',
            firstNameInput: '#main-form input[name="FIRST_NAME"]',
            lastNameInput: '#main-form input[name="LAST_NAME"]',
            submitButton: 'a[href="#submit"]',
            manageAddressLink: `a[href^="/subscription/${list.cid}/manage-address/"]`
        },
        links: {
            manageAddressLink: `/subscription/${list.cid}/manage-address/:ucid`
        }
    }, fieldHelpers(list)),

    webManageAddress: web({
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/manage-address/:ucid`,
        elementsToWaitFor: ['form'],
        textsToWaitFor: ['Update Your Email Address'],
        elements: {
            form: `form[action="/subscription/${list.cid}/manage-address"]`,
            emailInput: '#main-form input[name="EMAIL"]',
            emailNewInput: '#main-form input[name="EMAIL_NEW"]',
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
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/updated-notice`,
        textsToWaitFor: ['Profile Updated']
    }),

    webUnsubscribedNotice: web({
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/unsubscribed-notice`,
        textsToWaitFor: ['Unsubscription Confirmed']
    }),

    mailUnsubscriptionConfirmed: mail({
        elementsToWaitFor: ['resubscribeLink'],
        textsToWaitFor: ['You Are Now Unsubscribed'],
        elements: {
            resubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}"]`
        }
    }),

    webUnsubscribe: web({
        baseUrl: config.basePublicUrl,
        elementsToWaitFor: ['submitButton'],
        textsToWaitFor: ['Unsubscribe'],
        elements: {
            submitButton: 'a[href="#submit"]'
        }
    }),

    webConfirmUnsubscriptionNotice: web({
        baseUrl: config.basePublicUrl,
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
        baseUrl: config.basePublicUrl,
        url: `/subscription/${list.cid}/manual-unsubscribe-notice`,
        elementsToWaitFor: ['contactLink'],
        textsToWaitFor: ['Online Unsubscription Is Not Possible', config.settings['admin-email']],
        elements: {
            contactLink: `a[href^="mailto:${config.settings['admin-email']}"]`
        }
    }),

});
