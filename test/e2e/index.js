'use strict';

require('./helpers/exit-unless-test');

global.USE_SHARED_DRIVER = true;

const driver = require('./helpers/driver');
const only = 'only';
const skip = 'skip';



let tests = [
    ['tests/login'],
    ['tests/subscription']
];



tests = tests.filter(t => t[1] !== skip);

if (tests.some(t => t[1] === only)) {
    tests = tests.filter(t => t[1] === only);
}

describe('e2e', function() {
    this.timeout(10000);

    tests.forEach(t => {
        describe(t[0], () => {
            require('./' + t[0]); // eslint-disable-line global-require
        });
    });

    after(() => driver.originalQuit());
});
