'use strict';

let log = require('npmlog');
let db = require('../lib/db');
let tools = require('../lib/tools');
let triggers = require('../lib/models/triggers');
let _ = require('../lib/translate')._;
let util = require('util');

function triggerLoop() {
    checkTrigger((err, triggerId) => {
        if (err) {
            log.error('Triggers', err);
        }
        if (triggerId) {
            return setImmediate(triggerLoop);
        } else {
            return setTimeout(triggerLoop, 15 * 1000);
        }
    });
}

function checkTrigger(callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT * FROM `triggers` WHERE `enabled`=1 AND `last_check`<=NOW()-INTERVAL 1 MINUTE ORDER BY `last_check` ASC LIMIT 1';
        connection.query(query, (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            if (!rows || !rows.length) {
                connection.release();
                return callback(null, false);
            }
            let trigger = tools.convertKeys(rows[0]);
            let query = 'UPDATE `triggers` SET `last_check`=NOW() WHERE id=? LIMIT 1';
            connection.query(query, [trigger.id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                triggers.getQuery(trigger.id, (err, query) => {
                    if (err) {
                        return callback(err);
                    }
                    if (!query) {
                        return callback(new Error(util.format(_('Unknown trigger type %s'), trigger.id)));
                    }
                    trigger.query = query;
                    fireTrigger(trigger, callback);
                });
            });
        });
    });
}

function fireTrigger(trigger, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query(trigger.query, (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            if (!rows || !rows.length) {
                connection.release();
                return callback(null, trigger.id);
            }

            let pos = 0;
            let insertNext = () => {
                if (pos >= rows.length) {
                    connection.release();
                    return callback(null, trigger.id);
                }
                let subscriber = rows[pos++].id;

                let query = 'INSERT INTO `trigger__' + trigger.id + '` (`list`, `subscription`) VALUES (?,?)';
                let values = [trigger.list, subscriber];

                connection.query(query, values, (err, result) => {
                    if (err && err.code !== 'ER_DUP_ENTRY') {
                        connection.release();
                        return callback(err);
                    }
                    if (!result.affectedRows) {
                        return setImmediate(insertNext);
                    }
                    log.verbose('Triggers', 'Triggered %s (%s) for subscriber %s', trigger.name, trigger.id, subscriber);
                    let query = 'INSERT INTO `queued` (`campaign`, `list`, `subscriber`, `source`) VALUES (?,?,?,?)';
                    let values = [trigger.destCampaign, trigger.list, subscriber, 'trigger ' + trigger.id];
                    connection.query(query, values, err => {
                        if (err && err.code !== 'ER_DUP_ENTRY') {
                            connection.release();
                            return callback(err);
                        }
                        // update counter
                        let query = 'UPDATE `triggers` SET `count`=`count`+1 WHERE id=?';
                        let values = [trigger.id];
                        connection.query(query, values, () => setImmediate(insertNext));
                    });
                });
            };
            insertNext();
        });
    });
}

module.exports = callback => {
    triggerLoop();
    setImmediate(callback);
};
