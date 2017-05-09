'use strict';

const config = require('../helpers/config');
const Page = require('./page');

class Web extends Page {
    enterEmail(value) {
        this.element('emailInput').clear();
        return this.element('emailInput').sendKeys(value);
    }
}

class Mail extends Page {
    navigate(address) {
        this.driver.sleep(100);
        this.driver.navigate().to(`http://localhost:${config.app.testserver.mailboxserverport}/${address}`);
        return this.waitUntilVisible();
    }
}

module.exports = (driver, list) => ({

    webSubscribe: new Web(driver, {
        url: `/subscription/${list.cid}`,
        elementToWaitFor: 'form',
        elements: {
            form: `form[action="/subscription/${list.cid}/subscribe"]`,
            emailInput: '#main-form input[name="email"]',
            submitButton: 'a[href="#submit"]'
        }
    }),

    webConfirmSubscriptionNotice: new Web(driver, {
        url: `/subscription/${list.cid}/confirm-notice`,
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: `a[href="${config.settings['default-homepage']}"]`
        }
    }),

    mailConfirmSubscription: new Mail(driver, {
        elementToWaitFor: 'confirmLink',
        elements: {
            confirmLink: `a[href^="${config.settings['service-url']}subscription/subscribe/"]`
        }
    }),

    webSubscribedNotice: new Web(driver, {
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: 'a[href^="https://mailtrain.org"]'
        }
    }),

    mailSubscriptionConfirmed: new Mail(driver, {
        elementToWaitFor: 'unsubscribeLink',
        elements: {
            unsubscribeLink: 'a[href*="/unsubscribe/"]',
            manageLink: 'a[href*="/manage/"]'
        }
    }),

    webUnsubscribe: new Web(driver, {
        elementToWaitFor: 'submitButton',
        elements: {
            submitButton: 'a[href="#submit"]'
        }
    }),

    webUnsubscribedNotice: new Web(driver, {
        elementToWaitFor: 'homepageButton',
        elements: {
            homepageButton: 'a[href^="https://mailtrain.org"]'
        }
    }),

    mailUnsubscriptionConfirmed: new Mail(driver, {
        elementToWaitFor: 'resubscribeLink',
        elements: {
            resubscribeLink: `a[href^="${config.settings['service-url']}subscription/${list.cid}"]`
        }
    })

});
