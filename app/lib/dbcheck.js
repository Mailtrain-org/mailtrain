'use strict';

/*
This module handles Mailtrain database initialization and upgrades
*/

let config = require('config');
let mysql = require('mysql');
let log = require('npmlog');
let fs = require('fs');
let pathlib = require('path');
let Handlebars = require('handlebars');
let meta = require('../meta.json');

let mysqlConfig = {
    multipleStatements: true
};
Object.keys(config.mysql).forEach(key => mysqlConfig[key] = config.mysql[key]);
let db = mysql.createPool(mysqlConfig);

function listTables(callback) {
    db.getConnection((err, connection) => {
        if (err) {
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                err = new Error('Could not access the database. Check MySQL config and authentication credentials');
            }
            if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                err = new Error('Could not connect to the database. Check MySQL host and port configuration');
            }
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
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT `value` FROM `settings` WHERE `key`=?', ['db_schema_version'], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let dbSchemaVersion = rows && rows[0] && Number(rows[0].value) || 0;
            callback(null, dbSchemaVersion);
        });
    });
}

function listUpdates(current, callback) {
    current = current || 0;
    fs.readdir(pathlib.join(__dirname, '..', 'setup', 'sql'), (err, list) => {
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
                        path: pathlib.join(__dirname, '..', 'setup', 'sql', row)
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
    let fname = process.env.DB_FROM_START ? 'base.sql' : 'mailtrain.sql';
    let path = pathlib.join(__dirname, '..', 'setup', 'sql', fname);
    log.info('sql', 'Loading tables from %s', fname);
    applyUpdate({
        path
    }, callback);
}

function runUpdates(callback, runCount) {
    runCount = Number(runCount) || 0;
    listTables((err, tables) => {
        if (err) {
            return callback(err);
        }

        if (!tables.settings) {
            if (runCount) {
                return callback(new Error('Settings table not found from database'));
            }
            log.info('sql', 'SQL not set up, initializing');
            return runInitial(runUpdates.bind(null, callback, ++runCount));
        }

        getSchemaVersion((err, schemaVersion) => {
            if (err) {
                return callback(err);
            }

            if (schemaVersion >= meta.schemaVersion) {
                // nothing to do here, already updated
                return callback(null, false);
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

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            connection.query(sql, err => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                return callback(null, true);
            });
        });
    });
}

module.exports = callback => {
    runUpdates(err => {
        if (err) {
            return callback(err);
        }
        db.end(() => {
            log.info('sql', 'Database check completed');
            return callback(null, true);
        });
    });
};
