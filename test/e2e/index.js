'use strict';

require('./lib/exit-unless-test');
const mocha = require('./lib/mocha-e2e').mocha;
const path = require('path');

const only = 'only';
const skip = 'skip';

let tests = [
    'login',
    'subscription'
];

tests = tests.map(testSpec => (testSpec.constructor === Array ? testSpec : [testSpec]));
tests = tests.filter(testSpec => testSpec[1] !== skip);
if (tests.some(testSpec => testSpec[1] === only)) {
    tests = tests.filter(testSpec => testSpec[1] === only);
}

for (const testSpec of tests) {
    const testPath = path.join(__dirname, 'tests', testSpec[0] + '.js');
    mocha.addFile(testPath);
}

mocha.run(failures => {
    process.exit(failures);  // exit with non-zero status if there were failures
});
