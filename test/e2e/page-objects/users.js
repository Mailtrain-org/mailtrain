'use strict';

const page = require('./page');

module.exports = driver => ({

    login: Object.assign(page(driver), {
        url: '/users/login',
        elementToWaitFor: 'submitButton',
        elements: {
            usernameInput: 'form[action="/users/login"] input[name="username"]',
            passwordInput: 'form[action="/users/login"] input[name="password"]',
            submitButton: 'form[action="/users/login"] [type=submit]'
        },
        enterUsername(value) {
            // this.element('usernameInput').clear();
            return this.element('usernameInput').sendKeys(value);
        },
        enterPassword(value) {
            return this.element('passwordInput').sendKeys(value);
        }
    }),

    account: Object.assign(page(driver), {
        url: '/users/account',
        elementToWaitFor: 'emailInput',
        elements: {
            emailInput: 'form[action="/users/account"] input[name="email"]'
        }
    })

});
