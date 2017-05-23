'use strict';

const page = require('./web');

module.exports = driver => Object.assign(page(driver), {
    url: '/',
    elementToWaitFor: 'body',
    elements: {
        body: 'body.page--home'
    }
});
