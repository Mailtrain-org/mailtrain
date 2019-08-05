'use strict';

const config = require('../lib/config');
const web = require('../lib/web');

module.exports = {
    login: web({
        baseUrl: config.baseTrustedUrl,
        url: '/users/login',
        elementsToWaitFor: ['submitButton'],
        elements: {
            usernameInput: 'form[action="/login"] input[name="username"]',
            passwordInput: 'form[action="/login"] input[name="password"]',
            submitButton: 'form[action="/login"] [type=submit]'
        }
    }),

    logout: web({
        baseUrl: config.baseTrustedUrl,
        requestUrl: '/users/logout',
        url: '/'
    }),

    account: web({
        baseUrl: config.baseTrustedUrl,
        url: '/users/account',
        elementsToWaitFor: ['form'],
        elements: {
            form: 'form[action="/users/account"]',
            emailInput: 'form[action="/users/account"] input[name="email"]'
        }
    })
};
