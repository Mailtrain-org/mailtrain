'use strict';

const Page = require('./page');
let home;

module.exports = driver => home || new Page(driver, {
    url: '/',
    elementToWaitFor: 'body',
    elements: {
        body: 'body.page--home'
    }
});
