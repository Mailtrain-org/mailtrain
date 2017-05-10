'use strict';

const page = require('./page');

module.exports = driver => Object.assign(page(driver), {
    url: '/',
    elementToWaitFor: 'body',
    elements: {
        body: 'body.page--home'
    }
});
