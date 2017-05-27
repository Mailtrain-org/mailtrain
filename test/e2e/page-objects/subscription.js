'use strict';

const config = require('../helpers/config');
const page = require('./page');

const web = {
    enterEmail(value) {
        this.element('emailInput').clear();
        return this.element('emailInput').sendKeys(value);
    }
};

const mail = {
    navigate(address) {
        this.driver.sleep(100);
        this.driver.navigate().to(`http://localhost:${config.app.testserver.mailboxserverport}/${address}`);
        return this.waitUntilVisible();
    }
};

module.exports = (driver, list) => ({

    webSubscribe: Object.assign(page(driver), web, {
        url: `/subscription/${list.cid}`,
        elementToWaitFor: 'form',
        elements: {
            form: `form[action="/subscription/${list.cid}/subscribe"]`,
            emailInput: '#main-form input[name="email"]',
            submitButton: 'a[href="#submit"]'
        }
    }),

    webConfirmSubscriptionNotice: Object.assign(page(driver), web, {
        url: `/subscription/${list.cid}/confirm-notice`,
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: `a[href="${config.settings['default-homepage']}"]`
        }
    }),

    mailConfirmSubscription: Object.assign(page(driver), mail, {
        elementToWaitFor: 'confirmLink',
        elements: {
            confirmLink: `a[href^="${config.settings['service-url']}subscription/subscribe/"]`
        }
    }),

    webSubscribedNotice: Object.assign(page(driver), web, {
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: 'a[href^="https://mailtrain.org"]'
        }
    }),

    mailSubscriptionConfirmed: Object.assign(page(driver), mail, {
        elementToWaitFor: 'unsubscribeLink',
        elements: {
            unsubscribeLink: 'a[href*="/unsubscribe/"]',
            manageLink: 'a[href*="/manage/"]'
        }
    }),

    webUnsubscribe: Object.assign(page(driver), web, {
        elementToWaitFor: 'submitButton',
        elements: {
            submitButton: 'a[href="#submit"]'
        }
    }),

    webUnsubscribedNotice: Object.assign(page(driver), web, {
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: 'a[href^="https://mailtrain.org"]'
        }
    }),

    mailUnsubscriptionConfirmed: Object.assign(page(driver), mail, {
        elementToWaitFor: 'resubscribeLink',
        elements: {
            resubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}"]`
        }
    })

});
