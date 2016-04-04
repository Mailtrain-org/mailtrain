'use strict';

let tools = require('../tools');
let db = require('../db');

module.exports = {
    list: listValues,
    get: getValue,
    set: setValue
};

function listValues(filter, callback) {
    if (!callback && typeof filter === 'function') {
        callback = filter;
        filter = false;
    }

    filter = [].concat(filter || []).map(key => tools.toDbKey(key));

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query;

        if (filter.length) {
            query = 'SELECT * FROM settings WHERE `key` IN (' + filter.map(() => '?').join(',') + ')';
        } else {
            query = 'SELECT * FROM settings';
        }

        connection.query(query, filter, (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            let settings = {};
            (rows || []).forEach(row => {
                settings[row.key] = row.value;
            });
            return callback(null, tools.convertKeys(settings));
        });
    });
}

function getValue(key, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT `value` FROM settings WHERE `key`=?', [tools.toDbKey(key)], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, rows && rows[0] && rows[0].value || false);
        });
    });
}

function setValue(key, value, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('INSERT INTO settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `key`=?, `value`=?', [key, value, key, value], (err, response) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, response && response.insertId || 0);
        });
    });
}
