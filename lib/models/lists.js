'use strict';

let db = require('../db');
let tools = require('../tools');
let shortid = require('shortid');
let segments = require('./segments');
let _ = require('../translate')._;
let tableHelpers = require('../table-helpers');

let allowedKeys = ['description', 'default_form', 'public_subscribe'];

module.exports.list = (start, limit, callback) => {
    tableHelpers.list('lists', ['*'], 'name', null, start, limit, callback);
};

module.exports.filter = (request, parent, callback) => {
    tableHelpers.filter('lists', ['*'], request, ['#', 'name', 'cid', 'subscribers', 'description'], ['name'], 'name ASC', null, callback);
};

module.exports.filterQuicklist = (request, callback) => {
    tableHelpers.filter('lists', ['id', 'name', 'subscribers'], request, ['#', 'name', 'subscribers'], ['name'], 'name ASC', null, callback);
};

module.exports.quicklist = callback => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT id, name, subscribers FROM lists ORDER BY name LIMIT 1000', (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let lists = (rows || []).map(tools.convertKeys);

            connection.query('SELECT id, list, name FROM segments ORDER BY list, name LIMIT 1000', (err, rows) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                let segments = (rows || []).map(tools.convertKeys);

                lists.forEach(list => {
                    list.segments = segments.filter(segment => segment.list === list.id);
                });

                return callback(null, lists);
            });
        });
    });
};

module.exports.getByCid = (cid, callback) => {
    resolveCid(cid, (err, id) => {
        if (err) {
            return callback(err);
        }
        if (!id) {
            return callback(null, false);
        }
        module.exports.get(id, callback);
    });
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM lists WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let list = tools.convertKeys(rows[0]);
            segments.list(list.id, (err, segmentList) => {
                if (err || !segmentList) {
                    segmentList = [];
                }
                list.segments = segmentList;
                return callback(null, list);
            });
        });
    });
};

module.exports.create = (list, callback) => {

    let data = tools.convertKeys(list);
    data.publicSubscribe = data.publicSubscribe ? 1 : 0;

    let name = (data.name || '').toString().trim();

    if (!data) {
        return callback(new Error(_('List Name must be set')));
    }

    let keys = ['name'];
    let values = [name];

    Object.keys(data).forEach(key => {
        let value = data[key].toString().trim();
        key = tools.toDbKey(key);
        if (key === 'description') {
            value = tools.purifyHTML(value);
        }
        if (allowedKeys.indexOf(key) >= 0) {
            keys.push(key);
            values.push(value);
        }
    });

    let cid = shortid.generate();
    keys.push('cid');
    values.push(cid);

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'INSERT INTO lists (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let listId = result && result.insertId || false;
            if (!listId) {
                return callback(null, false);
            }

            createSubscriptionTable(listId, err => {
                if (err) {
                    // FIXME: rollback
                    return callback(err);
                }
                return callback(null, listId);
            });
        });
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    let data = tools.convertKeys(updates);
    data.publicSubscribe = data.publicSubscribe ? 1 : 0;

    let name = (data.name || '').toString().trim();
    let keys = ['name'];
    let values = [name];

    if (id < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    if (!name) {
        return callback(new Error(_('List Name must be set')));
    }

    Object.keys(data).forEach(key => {
        let value = data[key].toString().trim();
        key = tools.toDbKey(key);
        if (key === 'description') {
            value = tools.purifyHTML(value);
        }
        if (allowedKeys.indexOf(key) >= 0) {
            keys.push(key);
            values.push(value);
        }
    });

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        values.push(id);

        connection.query('UPDATE lists SET ' + keys.map(key => key + '=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result && result.affectedRows || false);
        });
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM lists WHERE id=? LIMIT 1', id, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let affected = result && result.affectedRows || 0;

            removeSubscriptionTable(id, err => {
                if (err) {
                    return callback(err);
                }
                return callback(null, affected);
            });
        });
    });
};

function resolveCid(cid, callback) {
    cid = (cid || '').toString().trim();
    if (!cid) {
        return callback(new Error(_('Missing List CID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT id FROM lists WHERE cid=?', [cid], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, rows && rows[0] && rows[0].id || false);
        });
    });
}

function createSubscriptionTable(id, callback) {
    let query = 'CREATE TABLE `subscription__' + id + '` LIKE subscription';
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query(query, err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}

function removeSubscriptionTable(id, callback) {
    let query = 'DROP TABLE IF EXISTS `subscription__' + id + '`';
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query(query, err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}
