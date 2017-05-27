'use strict';

const config = require('./config');
const log = require('npmlog');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'test' || !fs.existsSync(path.join(__dirname, '..', '..', '..', 'config', 'test.toml'))) {
    log.error('e2e', 'This script only runs in test and config/test.toml (i.e. a dedicated test database) is present');
    process.exit(1);
}

if (config.app.testserver.enabled !== true) {
    log.error('e2e', 'This script only runs if the testserver is enabled. Check config/test.toml');
    process.exit(1);
}

if (config.app.www.port !== 3000) {
    log.error('e2e', 'This script requires Mailtrain to be running on port 3000. Check config/test.toml');
    process.exit(1);
}
