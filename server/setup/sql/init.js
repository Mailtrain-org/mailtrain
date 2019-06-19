'use strict';

let dbcheck = require('../../lib/dbcheck');
let log = require('npmlog');
let path = require('path');
let fs = require('fs');

log.level = 'verbose';

if (process.env.NODE_ENV === 'production') {
    log.error('sqlinit', 'This script does not run in production');
    process.exit(1);
}

if (process.env.NODE_ENV === 'test' && !fs.existsSync(path.join(__dirname, '..', '..', 'config', 'test.toml'))) {
    log.error('sqlinit', 'This script only runs in test if config/test.toml (i.e. a dedicated test database) is present');
    process.exit(1);
}

dbcheck(err => {
    if (err) {
        log.error('DB', err);
        return process.exit(1);
    }
    return process.exit(0);
});
