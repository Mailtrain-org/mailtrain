'use strict';

let config = require('config');
let db = require('../../lib/db');
let spawn = require('child_process').spawn;
let settings = require('../../lib/models/settings');
let log = require('npmlog');
let fs = require('fs');
let pathlib = require('path');
let Handlebars = require('handlebars');

log.level = 'verbose';

function listTables(callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SHOW TABLES';
        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            let tables = {};
            [].concat(rows || []).forEach(row => {
                let name;
                let table;
                Object.keys(row).forEach(key => {
                    if (/^Tables_in_/i.test(key)) {
                        table = name = row[key];
                    }
                });
                if (/__\d+$/.test(name)) {
                    let parts = name.split('__');
                    parts.pop();
                    table = parts.join('__');
                }
                if (tables.hasOwnProperty(table)) {
                    tables[table].push(name);
                } else {
                    tables[table] = [name];
                }
                return table;
            });
            return callback(null, tables);
        });
    });
}


function getSchemaVersion(callback) {
    settings.list(['db_schema_version'], (err, configItems) => {
        if (err) {
            return callback(err);
        }
        let dbSchemaVersion = Number(configItems.dbSchemaVersion) || 0;

        callback(null, dbSchemaVersion);
    });
}

function listUpdates(current, callback) {
    current = current || 0;
    fs.readdir(__dirname, (err, list) => {
        if (err) {
            return callback(err);
        }

        let updates = [];
        [].concat(list || []).forEach(row => {
            if (/^upgrade-\d+\.sql$/i.test(row)) {
                let seq = row.match(/\d+/)[0];
                if (seq > current) {
                    updates.push({
                        seq: Number(seq),
                        path: pathlib.join(__dirname, row)
                    });
                }
            }
        });

        return callback(null, updates);
    });
}

function getSql(path, data, callback) {
    fs.readFile(path, 'utf-8', (err, source) => {
        if (err) {
            return callback(err);
        }
        let renderer = Handlebars.compile(source);
        return callback(null, renderer(data || {}));
    });
}

function runInitial(callback) {
    let path = pathlib.join(__dirname, process.env.FROM_START ? 'base.sql' : 'mailtrain.sql');
    applyUpdate({
        path
    }, callback);
}

function runUpdates(callback) {
    listTables((err, tables) => {
        if (err) {
            return callback(err);
        }

        if (!tables.settings) {
            log.info('sql', 'SQL not set up, initializing');
            return runInitial(callback);
        }

        getSchemaVersion((err, schemaVersion) => {
            if (err) {
                return callback(err);
            }

            listUpdates(schemaVersion, (err, updates) => {
                if (err) {
                    return callback(err);
                }

                let pos = 0;
                let runNext = () => {
                    if (pos >= updates.length) {
                        return callback(null, pos);
                    }
                    let update = updates[pos++];
                    update.data = {
                        tables
                    };
                    applyUpdate(update, (err, status) => {
                        if (err) {
                            return callback(err);
                        }
                        if (status) {
                            log.info('sql', 'Update %s applied', update.seq);
                        } else {
                            log.info('sql', 'Update %s not applied', update.seq);
                        }

                        runNext();
                    });
                };

                runNext();
            });
        });

    });
}

function applyUpdate(update, callback) {
    getSql(update.path, update.data, (err, sql) => {
        if (err) {
            return callback(err);
        }

        let cmd = spawn(config.mysql.command || 'mysql', ['-h', config.mysql.host || 'localhost', '-P', config.mysql.port || 3306, '-u', config.mysql.user, '-p' + config.mysql.password, '-D', config.mysql.database]);

        cmd.stdout.pipe(process.stdout);
        cmd.stderr.pipe(process.stderr);

        cmd.on('close', code => {
            if (code) {
                return callback(new Error('mysql command exited with code ' + code));
            }
            return callback(null, true);
        });
        cmd.stdin.end(sql);
    });
}

runUpdates(err => {
    if (err) {
        log.error('sql', err);
        process.exit(1);
    }
    log.info('sql', 'Database check completed');
    process.exit(0);
});
