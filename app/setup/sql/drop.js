'use strict';

if (process.env.NODE_ENV === 'production') {
    console.log('This script does not run in production'); // eslint-disable-line no-console
    process.exit(1);
}

let config = require('config');
let spawn = require('child_process').spawn;
let log = require('npmlog');
let path = require('path');

log.level = 'verbose';

function createDump(callback) {
    let cmd = spawn(path.join(__dirname, 'drop.sh'), [], {
        env: {
            MYSQL_HOST: config.mysql.host || 'localhost',
            MYSQL_DB: config.mysql.database,
            MYSQL_PORT: config.mysql.port || 3306,
            MYSQL_USER: config.mysql.user,
            MYSQL_PASSWORD: config.mysql.password
        }
    });

    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);

    cmd.on('close', code => {
        if (code) {
            return callback(new Error('drop command exited with code ' + code));
        }
        return callback(null, true);
    });
}

createDump(err => {
    if (err) {
        log.error('sqldrop', err);
        process.exit(1);
    }
    log.info('sqldrop', 'Command completed, all tables dropped from "%s"', config.mysql.database);
    process.exit(0);
});
