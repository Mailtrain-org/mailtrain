'use strict';

const config = require('../helpers/config');
const webBase = require('./web');
const mailBase = require('./mail');

module.exports = list => {

    const web = params => webBase(params);
    const mail = params => mailBase(params);

    return {
        webSubscribe: web({
            url: `/subscription/${list.cid}`,
            elementToWaitFor: 'form',
            elements: {
                form: `form[action="/subscription/${list.cid}/subscribe"]`,
                emailInput: '#main-form input[name="email"]',
                firstNameInput: '#main-form input[name="first-name"]',
                lastNameInput: '#main-form input[name="last-name"]',
                submitButton: 'a[href="#submit"]'
            }
        }),

        webConfirmSubscriptionNotice: web({
            url: `/subscription/${list.cid}/confirm-subscription-notice`,
            elementToWaitFor: 'homepageButton',
            elements: {
                homepageButton: `a[href="${config.settings['default-homepage']}"]`
            }
        }),

        mailConfirmSubscription: mail({
            elementToWaitFor: 'confirmLink',
            elements: {
                confirmLink: `a[href^="${config.settings['service-url']}subscription/confirm/subscribe/"]`
            }
        }),

        webSubscribedNotice: web({
            url: `/subscription/${list.cid}/subscribed-notice`,
            elementToWaitFor: 'homepageButton',
            elements: {
                homepageButton: `a[href="${config.settings['default-homepage']}"]`
            }
        }),

        mailSubscriptionConfirmed: mail({
            elementToWaitFor: 'unsubscribeLink',
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
            elementToWaitFor: 'form',
            elements: {
                form: `form[action="/subscription/${list.cid}/manage"]`,
                emailInput: '#main-form input[name="email"]',
                firstNameInput: '#main-form input[name="first-name"]',
                lastNameInput: '#main-form input[name="last-name"]',
                submitButton: 'a[href="#submit"]'
            }
        }),

        webUpdatedNotice: web({
            url: `/subscription/${list.cid}/updated-notice`,
            elementToWaitFor: 'homepageButton',
            elements: {
                homepageButton: `a[href="${config.settings['default-homepage']}"]`
            }
        }),

        /*
        webUnsubscribe: web({ // FIXME
            elementToWaitFor: 'submitButton',
            elements: {
                submitButton: 'a[href="#submit"]'
            }
        }),

        webUnsubscribedNotice: web({
            url: `/subscription/${list.cid}/unsubscribed-notice`,
            elementToWaitFor: 'homepageButton',
            elements: {
                homepageButton: `a[href="${config.settings['default-homepage']}"]`
            }
        }),

        mailUnsubscriptionConfirmed: mail({
            elementToWaitFor: 'resubscribeLink',
            elements: {
                resubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}"]`
            }
        }),
 */


    };
};
