'use strict';

const Page = require('./page');

module.exports = driver => new Page(driver, {
    url: '/',
    elementToWaitFor: 'body',
    elements: {
        body: 'body.page--home'
    }
});
