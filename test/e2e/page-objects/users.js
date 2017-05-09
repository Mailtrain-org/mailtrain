'use strict';

const Page = require('./page');

class Login extends Page {
    enterUsername(value) {
        // this.element('usernameInput').clear();
        return this.element('usernameInput').sendKeys(value);
    }
    enterPassword(value) {
        return this.element('passwordInput').sendKeys(value);
    }
}

module.exports = driver => ({

    login: new Login(driver, {
        url: '/users/login',
        elementToWaitFor: 'submitButton',
        elements: {
            usernameInput: 'form[action="/users/login"] input[name="username"]',
            passwordInput: 'form[action="/users/login"] input[name="password"]',
            submitButton: 'form[action="/users/login"] [type=submit]'
        }
    }),

    account: new Page(driver, {
        url: '/users/account',
        elementToWaitFor: 'emailInput',
        elements: {
            emailInput: 'form[action="/users/account"] input[name="email"]'
        }
    })

});
