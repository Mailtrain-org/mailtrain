'use strict';

let db = require('../db');
let tools = require('../tools');
let _ = require('../translate')._;
let tableHelpers = require('../table-helpers');

let allowedKeys = ['description', 'editor_name', 'editor_data', 'html', 'text'];

module.exports.list = (start, limit, callback) => {
    tableHelpers.list('templates', ['*'], 'name', null, start, limit, callback);
};

module.exports.filter = (request, parent, callback) => {
    tableHelpers.filter('templates', ['*'], request, ['#', 'name', 'description'], ['name'], 'name ASC', null, callback);
};

module.exports.quicklist = callback => {
    tableHelpers.quicklist('templates', ['id', 'name'], 'name', callback);
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Template ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM templates WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let template = tools.convertKeys(rows[0]);
            return callback(null, template);
        });
    });
};

module.exports.create = (template, callback) => {

    let data = tools.convertKeys(template);

    if (!(data.name || '').toString().trim()) {
        return callback(new Error(_('Template Name must be set')));
    }

    let name = (template.name || '').toString().trim();

    let keys = ['name'];
    let values = [name];

    Object.keys(template).forEach(key => {
        let value = template[key].trim();
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

        let query = 'INSERT INTO templates (' + keys.join(', ') + ') VALUES (' + values.map(() => '?').join(',') + ')';
        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let templateId = result && result.insertId || false;
            return callback(null, templateId);
        });
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    let data = tools.convertKeys(updates);

    if (id < 1) {
        return callback(new Error(_('Missing Template ID')));
    }

    if (!(data.name || '').toString().trim()) {
        return callback(new Error(_('Template Name must be set')));
    }

    let name = (updates.name || '').toString().trim();
    let keys = ['name'];
    let values = [name];

    Object.keys(updates).forEach(key => {
        let value = updates[key].trim();
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

        connection.query('UPDATE templates SET ' + keys.map(key => key + '=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
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
        return callback(new Error(_('Missing Template ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM templates WHERE id=? LIMIT 1', id, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let affected = result && result.affectedRows || 0;

            return callback(null, affected);
        });
    });
};
