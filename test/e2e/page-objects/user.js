'use strict';

const web = require('../lib/web');

module.exports = {
    login: web({
        url: '/users/login',
        elementsToWaitFor: ['submitButton'],
        elements: {
            usernameInput: 'form[action="/users/login"] input[name="username"]',
            passwordInput: 'form[action="/users/login"] input[name="password"]',
            submitButton: 'form[action="/users/login"] [type=submit]'
        }
    }),

    logout: web({
        requestUrl: '/users/logout',
        url: '/'
    }),

    account: web({
        url: '/users/account',
        elementsToWaitFor: ['form'],
        elements: {
            form: 'form[action="/users/account"]',
            emailInput: 'form[action="/users/account"] input[name="email"]'
        }
    })
};
