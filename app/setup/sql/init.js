'use strict';

if (process.env.NODE_ENV === 'production') {
    console.log('This script does not run in production'); // eslint-disable-line no-console
    process.exit(1);
}

let dbcheck = require('../../lib/dbcheck');
let log = require('npmlog');

log.level = 'verbose';

dbcheck(err => {
    if (err) {
        log.error('DB', err);
        return process.exit(1);
    }
    return process.exit(0);
});
