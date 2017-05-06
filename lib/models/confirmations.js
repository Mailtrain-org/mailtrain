'use strict';

let db = require('../db');
let shortid = require('shortid');
let helpers = require('../helpers');
let _ = require('../translate')._;

/*
    Adds new entry to the confirmations tables. Generates confirmation cid, which it returns.
 */
module.exports.addConfirmation = (listId, action, ip, data, callback) => {
    let cid = shortid.generate();

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'INSERT INTO confirmations (cid, list, action, ip, data) VALUES (?,?,?,?,?)';
        connection.query(query, [cid, listId, action, ip, JSON.stringify(data || {})], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!result || !result.affectedRows) {
                return callback(new Error(_('Could not store confirmation data')));
            }

            return callback(null, cid);
        });
    });
};

/*
    Atomically retrieves confirmation from the database, removes it from the database and returns it.
 */
module.exports.takeConfirmation = (cid, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let query = 'SELECT cid, list, action, ip, data FROM confirmations WHERE cid=? LIMIT 1';
            connection.query(query, [cid], (err, rows) => {
                if (err) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                }

                if (!rows || !rows.length) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(null, false));
                }

                connection.query('DELETE FROM confirmations WHERE `cid`=? LIMIT 1', [cid], () => {
                    if (err) {
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                    }

                    connection.commit(err => {
                        if (err) {
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                        }
                        connection.release();

                        let data;
                        try {
                            data = JSON.parse(rows[0].data);
                        } catch (E) {
                            data = {};
                        }

                        const result = {
                            listId: rows[0].list,
                            action: rows[0].action,
                            ip: rows[0].ip,
                            data
                        };

                        return callback(null, result);
                    });
                });
            });
        });
    });
};
