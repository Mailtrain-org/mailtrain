'use strict';

const db = require('../db');
const tableHelpers = require('../table-helpers');
const tools = require('../tools');
const _ = require('../translate')._;

const allowedKeys = ['name', 'description', 'mime_type', 'user_fields', 'js', 'hbs'];

module.exports.list = (start, limit, callback) => {
    tableHelpers.list('report_templates', ['*'], 'name', null, start, limit, callback);
};

module.exports.quicklist = callback => {
    tableHelpers.quicklist('report_templates', ['id', 'name'], 'name', callback);
};

module.exports.filter = (request, callback) => {
    tableHelpers.filter('report_templates', ['*'], request, ['#', 'name', 'description', 'created'], ['name'], 'created DESC', null, callback);
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing report template ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM report_templates WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            const template = tools.convertKeys(rows[0]);

            const userFields = template.userFields.trim();
            if (userFields !== '') {
                try {
                    template.userFieldsObject = JSON.parse(userFields);
                } catch (err) {
                    // This is to handle situation when for some reason we get corrupted JSON in the DB.
                    template.userFieldsObject = {};
                    template.userFields = '{}';
                }
            } else {
                template.userFieldsObject = {};
            }

            return callback(null, template);
        });
    });
};

module.exports.createOrUpdate = (createMode, data, callback) => {
    data = data || {};

    const id = 'id' in data ? Number(data.id) : 0;

    if (!createMode && id < 1) {
        return callback(new Error(_('Missing report template ID')));
    }

    const template = tools.convertKeys(data);
    const name = (template.name || '').toString().trim();

    if (!name) {
        return callback(new Error(_('Report template name must be set')));
    }

    const keys = ['name'];
    const values = [name];

    Object.keys(template).forEach(key => {
        let value = typeof template[key] === 'number' ? template[key] : (template[key] || '').toString().trim();
        key = tools.toDbKey(key);

        if (key === 'description') {
            value = tools.purifyHTML(value);
        }

        if (key === 'user_fields') {
            value = value.trim();

            if (value !== '') {
                try {
                    JSON.parse(value);
                } catch (err) {
                    return callback(err);
                }
            }
        }

        if (allowedKeys.indexOf(key) >= 0 && keys.indexOf(key) < 0) {
            keys.push(key);
            values.push(value);
        }
    });

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query;

        if (createMode) {
            query = 'INSERT INTO report_templates (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
        } else {
            query = 'UPDATE report_templates SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1';
            values.push(id);
        }

        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (createMode) {
                return callback(null, result && result.insertId || false);
            } else {
                return callback(null, result && result.affectedRows || false);
            }
        });
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing report template ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM report_templates WHERE id=? LIMIT 1', [id], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            const affected = result && result.affectedRows || 0;
            return callback(err, affected);
        });
    });
};

