'use strict';

if (process.env.NODE_ENV === 'production') {
    console.log('This script does not run in production'); // eslint-disable-line no-console
    process.exit(1);
}

let config = require('config');
let spawn = require('child_process').spawn;
let log = require('npmlog');

log.level = 'verbose';

function createDump(callback) {
    let cmd = spawn('mysqldump', ['-h', config.mysql.host || 'localhost', '-P', config.mysql.port || 3306, '-u', config.mysql.user, '-p' + config.mysql.password, '--skip-opt', '--quick', '--compact', '--complete-insert', '--create-options', '--tz-utc', '--no-set-names', '--skip-set-charset', '--skip-comments', config.mysql.database]);

    process.stdout.write('SET UNIQUE_CHECKS=0;\nSET FOREIGN_KEY_CHECKS=0;\n\n');

    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);

    cmd.on('close', code => {
        if (code) {
            return callback(new Error('mysqldump command exited with code ' + code));
        }

        process.stdout.write('\nSET UNIQUE_CHECKS=1;\nSET FOREIGN_KEY_CHECKS=1;\n');

        return callback(null, true);
    });
}

createDump(err => {
    if (err) {
        log.error('sqldump', err);
        process.exit(1);
    }
    log.info('sqldump', 'MySQL Dump Completed');
    process.exit(0);
});
