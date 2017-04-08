'use strict';

let db = require('../db');
let tools = require('../tools');
let slugify = require('slugify');
let lists = require('./lists');
let shortid = require('shortid');
let Handlebars = require('handlebars');
let _ = require('../translate')._;
let util = require('util');

let allowedKeys = ['name', 'key', 'default_value', 'group', 'group_template', 'visible'];
let allowedTypes;

module.exports.grouped = ['radio', 'checkbox', 'dropdown'];
module.exports.types = {
    text: _('Text'),
    website: _('Website'),
    longtext: _('Multi-line text'),
    gpg: _('GPG Public Key'),
    number: _('Number'),
    radio: _('Radio Buttons'),
    checkbox: _('Checkboxes'),
    dropdown: _('Drop Down'),
    'date-us': _('Date (MM/DD/YYY)'),
    'date-eur': _('Date (DD/MM/YYYY)'),
    'birthday-us': _('Birthday (MM/DD)'),
    'birthday-eur': _('Birthday (DD/MM)'),
    json: _('JSON value for custom rendering'),
    option: _('Option')
};

module.exports.allowedTypes = allowedTypes = Object.keys(module.exports.types);

module.exports.genericTypes = {
    text: 'string',
    website: 'string',
    longtext: 'textarea',
    gpg: 'textarea',
    json: 'textarea',
    number: 'number',
    'date-us': 'date',
    'date-eur': 'date',
    'birthday-us': 'birthday',
    'birthday-eur': 'birthday',
    option: 'boolean'
};

module.exports.list = (listId, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM custom_fields WHERE list=? ORDER BY id';
        connection.query(query, [listId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let fieldList = rows && rows.map(row => tools.convertKeys(row)) || [];
            let groups = new Map();

            // remove grouped rows
            for (let i = fieldList.length - 1; i >= 0; i--) {
                let field = fieldList[i];
                if (module.exports.grouped.indexOf(field.type) >= 0) {
                    if (!groups.has(field.id)) {
                        groups.set(field.id, []);
                    }
                    field.options = groups.get(field.id);
                } else if (field.group && field.type === 'option') {
                    if (!groups.has(field.group)) {
                        groups.set(field.group, [field]);
                    } else {
                        groups.get(field.group).unshift(field);
                    }
                    fieldList.splice(i, 1);
                }
            }

            return callback(null, fieldList);
        });
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

        let query = 'SELECT * FROM custom_fields WHERE id=? LIMIT 1';
        connection.query(query, [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            let field = rows && rows[0] && tools.convertKeys(rows[0]) || false;
            field.isGroup = module.exports.grouped.indexOf(field.type) >= 0 || field.type === 'json';
            return callback(null, field);
        });
    });
};

module.exports.create = (listId, field, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    field = tools.convertKeys(field);

    if (field.type === 'option' && !field.group) {
        return callback(new Error(_('Option field requires a group to be selected')));
    }

    if (field.type !== 'option') {
        field.group = null;
    }

    field.defaultValue = (field.defaultValue || '').toString().trim() || null;
    field.groupTemplate = (field.groupTemplate || '').toString().trim() || null;

    addCustomField(listId, field.name, field.defaultValue, field.type, field.group, field.groupTemplate, field.visible, callback);
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    updates = tools.convertKeys(updates);

    if (id < 1) {
        return callback(new Error(_('Missing Field ID')));
    }

    if (!(updates.name || '').toString().trim()) {
        return callback(new Error(_('Field Name must be set')));
    }

    if (updates.key) {
        updates.key = slugify(updates.key, '_').toUpperCase();
    }

    updates.defaultValue = (updates.defaultValue || '').toString().trim() || null;
    updates.groupTemplate = (updates.groupTemplate || '').toString().trim() || null;

    updates.visible = updates.visible ? 1 : 0;

    let name = (updates.name || '').toString().trim();
    let keys = ['name'];
    let values = [name];

    Object.keys(updates).forEach(key => {
        let value = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
        key = tools.toDbKey(key);
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

        connection.query('UPDATE custom_fields SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result && result.affectedRows || false);
        });
    });
};

module.exports.delete = (fieldId, callback) => {
    fieldId = Number(fieldId) || 0;

    if (fieldId < 1) {
        return callback(new Error(_('Missing Field ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM custom_fields WHERE id=? LIMIT 1';
        connection.query(query, [fieldId], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            if (!rows || !rows.length) {
                connection.release();
                return callback(new Error(_('Custom field not found')));
            }

            let field = tools.convertKeys(rows[0]);
            if (field.column) {
                connection.query('ALTER TABLE `subscription__' + field.list + '` DROP COLUMN `' + field.column + '`', err => {
                    if (err && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                        connection.release();
                        return callback(err);
                    }
                    connection.query('DELETE FROM custom_fields WHERE id=? LIMIT 1', [fieldId], err => {
                        if (err) {
                            connection.release();
                            return callback(err);
                        }
                        connection.query('DELETE FROM segment_rules WHERE column=? LIMIT 1', [field.column], err => {
                            connection.release();
                            if (err) {
                                // ignore
                            }
                            return callback(null, true);
                        });
                    });
                });
            } else {
                // delete all subfields in this group
                let query = 'SELECT id FROM custom_fields WHERE `group`=?';
                connection.query(query, [fieldId], (err, rows) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }

                    if (!rows || !rows.length) {
                        rows = [];
                    }

                    let pos = 0;
                    let deleteNext = () => {
                        if (pos >= rows.length) {
                            db.getConnection((err, connection) => {
                                if (err) {
                                    return callback(err);
                                }
                                connection.query('DELETE FROM custom_fields WHERE id=? LIMIT 1', [fieldId], err => {
                                    connection.release();
                                    if (err) {
                                        return callback(err);
                                    }
                                    return callback(null, true);
                                });
                            });
                            return;
                        }
                        module.exports.delete(rows[pos++].id, deleteNext);
                    };

                    deleteNext();
                });
            }
        });
    });
};

function addCustomField(listId, name, defaultValue, type, group, groupTemplate, visible, callback) {
    type = (type || '').toString().trim().toLowerCase();
    group = Number(group) || null;
    listId = Number(listId) || 0;

    let column = null;
    let key = slugify('merge ' + name, '_').toUpperCase();

    if (allowedTypes.indexOf(type) < 0) {
        return callback(new Error(util.format(_('Unknown column type %s'), type)));
    }

    if (!name) {
        return callback(new Error(_('Missing column name')));
    }

    if (listId <= 0) {
        return callback(new Error(_('Missing list ID')));
    }

    lists.get(listId, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            return callback(_('Provided List ID not found'));
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            if (module.exports.grouped.indexOf(type) < 0) {
                column = ('custom_' + slugify(name, '_') + '_' + shortid.generate()).toLowerCase().replace(/[^a-z0-9\_]/g, '');
            }

            let query = 'INSERT INTO custom_fields (`list`, `name`, `key`,`default_value`, `type`, `group`, `group_template`, `column`, `visible`) VALUES(?,?,?,?,?,?,?,?,?)';
            connection.query(query, [listId, name, key, defaultValue, type, group, groupTemplate, column, visible ? 1 : 0], (err, result) => {

                if (err) {
                    connection.release();
                    return callback(err);
                }

                let fieldId = result && result.insertId;
                let indexQuery;

                switch (type) {
                    case 'text':
                    case 'website':
                        query = 'ALTER TABLE `subscription__' + listId + '` ADD COLUMN `' + column + '` VARCHAR(255) DEFAULT NULL';
                        indexQuery = 'CREATE INDEX ' + column + '_index ON `subscription__' + listId + '` (`column`);';
                        break;
                    case 'gpg':
                    case 'longtext':
                    case 'json':
                        query = 'ALTER TABLE `subscription__' + listId + '` ADD COLUMN `' + column + '` TEXT DEFAULT NULL';
                        break;
                    case 'number':
                        query = 'ALTER TABLE `subscription__' + listId + '` ADD COLUMN `' + column + '` INT(11) DEFAULT NULL';
                        indexQuery = 'CREATE INDEX ' + column + '_index ON `subscription__' + listId + '` (`column`);';
                        break;
                    case 'option':
                        query = 'ALTER TABLE `subscription__' + listId + '` ADD COLUMN `' + column + '` TINYINT(4) UNSIGNED NOT NULL DEFAULT \'0\'';
                        indexQuery = 'CREATE INDEX ' + column + '_index ON `subscription__' + listId + '` (`column`);';
                        break;
                    case 'date-us':
                    case 'date-eur':
                    case 'birthday-us':
                    case 'birthday-eur':
                        query = 'ALTER TABLE `subscription__' + listId + '` ADD COLUMN `' + column + '` TIMESTAMP NULL DEFAULT NULL';
                        indexQuery = 'CREATE INDEX ' + column + '_index ON `subscription__' + listId + '` (`column`);';
                        break;
                    default:
                        connection.release();
                        return callback(null, fieldId, key);
                }

                connection.query(query, err => {
                    if (err) {
                        connection.query('DELETE FROM custom_fields WHERE id=? LIMIT 1', [fieldId], () => connection.release());
                        return callback(err);
                    }
                    if (!indexQuery) {
                        connection.release();
                        return callback(null, fieldId, key);
                    } else {
                        connection.query(query, err => {
                            if (err) {
                                // ignore index errors
                            }
                            connection.release();
                            return callback(null, fieldId, key);
                        });
                    }
                });
            });
        });
    });
}

module.exports.getRow = (fieldList, values, useDate, showAll, onlyExisting) => {
    let valueList = {};
    let row = [];

    Object.keys(values || {}).forEach(key => {
        let value = values[key];
        key = tools.toDbKey(key);
        if (key.indexOf('custom_') === 0) {
            valueList[key] = value;
        } else if (key.indexOf('group_g') === 0 && value.indexOf('custom_') === 0) {
            valueList[tools.toDbKey(value)] = 1;
        }
    });

    fieldList.filter(field => showAll || field.visible).forEach(field => {
        if (onlyExisting && field.column && !valueList.hasOwnProperty(field.column)) {
            // ignore missing values
            return;
        }
        switch (field.type) {
            case 'text':
            case 'website':
            case 'gpg':
            case 'longtext':
                {
                    let item = {
                        id: field.id,
                        type: field.type,
                        name: field.name,
                        column: field.column,
                        value: (valueList[field.column] || '').toString().trim(),
                        visible: !!field.visible,
                        mergeTag: field.key,
                        mergeValue: (valueList[field.column] || '').toString().trim() || field.defaultValue,
                        ['type' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())]: true
                    };
                    row.push(item);
                    break;
                }
            case 'json':
                {
                    let value;
                    let json = (valueList[field.column] || '').toString().trim();
                    try {
                        let parsed = JSON.parse(json);
                        if (Array.isArray(parsed)) {
                            parsed = {
                                values: parsed
                            };
                        }
                        value = json ? render(field.groupTemplate, parsed) : '';
                    } catch (E) {
                        value = E.message;
                    }

                    let item = {
                        id: field.id,
                        type: field.type,
                        name: field.name,
                        column: field.column,
                        value: (valueList[field.column] || '').toString().trim(),
                        visible: !!field.visible,
                        mergeTag: field.key,
                        mergeValue: value || field.defaultValue,
                        ['type' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())]: true
                    };
                    row.push(item);
                    break;
                }
            case 'number':
                {
                    let item = {
                        id: field.id,
                        type: field.type,
                        name: field.name,
                        column: field.column,
                        value: Number(valueList[field.column]) || 0,
                        visible: !!field.visible,
                        mergeTag: field.key,
                        mergeValue: Number(valueList[field.column]) || Number(field.defaultValue) || 0,
                        ['type' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())]: true
                    };
                    row.push(item);
                    break;
                }
            case 'dropdown':
            case 'radio':
            case 'checkbox':
                {
                    let item = {
                        id: field.id,
                        type: field.type,
                        name: field.name,
                        visible: !!field.visible,
                        key: 'group-g' + field.id,
                        mergeTag: field.key,
                        mergeValue: field.defaultValue,
                        ['type' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())]: true,
                        groupTemplate: field.groupTemplate,
                        options: (field.options || []).map(subField => {
                            if (onlyExisting && subField.column && !valueList.hasOwnProperty(subField.column)) {
                                // ignore missing values
                                return false;
                            }
                            return {
                                type: subField.type,
                                name: subField.name,
                                column: subField.column,
                                value: valueList[subField.column] ? 1 : 0,
                                visible: !!subField.visible,
                                mergeTag: subField.key,
                                mergeValue: valueList[subField.column] ? subField.name : subField.defaultValue
                            };
                        }).filter(subField => subField)
                    };
                    let subItems = item.options.filter(subField => (showAll || subField.visible) && subField.value).map(subField => subField.name);
                    item.value = field.groupTemplate ? render(field.groupTemplate, {
                        values: subItems
                    }) : subItems.join(', ');
                    item.mergeValue = item.value || field.defaultValue;
                    row.push(item);
                    break;
                }
            case 'date-eur':
            case 'birthday-eur':
            case 'date-us':
            case 'birthday-us':
                {
                    let isUs = /\-us$/.test(field.type);
                    let isYear = field.type.indexOf('date-') === 0;
                    let value = valueList[field.column];
                    let day, month, year;
                    let formatted;

                    if (value && typeof value.getUTCFullYear === 'function') {
                        day = value.getUTCDate();
                        month = value.getUTCMonth() + 1;
                        year = value.getUTCFullYear();
                    } else {
                        value = (value || '').toString().trim();

                        // try international format first YYYY-MM-DD
                        let parts = value.match(/(\d{4})\D+(\d{2})(?:\D+(\d{2})\b)?/);
                        if (parts) {
                            year = Number(parts[1]) || 2000;
                            month = Number(parts[2]) || 0;
                            day = Number(parts[3]) || 0;
                            value = new Date(Date.UTC(year, month - 1, day));
                        } else {
                            parts = value.match(/(\d+)\D+(\d+)(?:\D+(\d+)\b)?/);
                            if (!parts) {
                                value = null;
                            } else {
                                day = Number(parts[isUs ? 2 : 1]) || 0;
                                month = Number(parts[isUs ? 1 : 2]) || 0;
                                year = Number(parts[3]) || 2000;

                                if (!day || !month) {
                                    value = null;
                                } else {
                                    value = new Date(Date.UTC(year, month - 1, day));
                                }
                            }
                        }
                    }

                    if (day && month) {
                        if (isUs) {
                            formatted = (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day;
                        } else {
                            formatted = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month;
                        }

                        if (isYear) {
                            formatted += '/' + year;
                        }
                    } else {
                        formatted = null;
                    }

                    let item = {
                        id: field.id,
                        type: field.type,
                        name: field.name,
                        column: field.column,
                        value: useDate ? value : formatted,
                        visible: !!field.visible,
                        mergeTag: field.key,
                        mergeValue: (useDate ? value : formatted) || field.defaultValue,
                        ['type' + (field.type || '').toString().trim().replace(/(?:^|\-)([a-z])/g, (m, c) => c.toUpperCase())]: true
                    };
                    row.push(item);
                    break;
                }
        }
    });

    return row;
};

module.exports.getValues = (row, showAll) => {
    let result = [];
    row.filter(field => showAll || field.visible).forEach(field => {
        if (field.column) {
            result.push({
                key: field.column,
                value: field.value
            });
        } else if (field.options) {
            field.options.filter(field => showAll || field.visible).forEach(subField => {
                result.push({
                    key: subField.column,
                    value: subField.value
                });
            });
        }
    });

    return result;
};


function render(template, options) {
    let renderer = Handlebars.compile(template);
    return renderer(options);
}
