'use strict';

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
