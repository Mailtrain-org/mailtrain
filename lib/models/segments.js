'use strict';

let tools = require('../tools');
let db = require('../db');
let fields = require('./fields');
let util = require('util');
let _ = require('../translate')._;

module.exports.defaultColumns = [{
    column: 'email',
    name: _('Email address'),
    type: 'string'
}, {
    column: 'opt_in_country',
    name: _('Signup country'),
    type: 'string'
}, {
    column: 'created',
    name: _('Sign up date'),
    type: 'date'
}, {
    column: 'latest_open',
    name: _('Latest open'),
    type: 'date'
}, {
    column: 'latest_click',
    name: _('Latest click'),
    type: 'date'
}, {
    column: 'first_name',
    name: _('First name'),
    type: 'string'
}, {
    column: 'last_name',
    name: _('Last name'),
    type: 'string'
}];

module.exports.list = (listId, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }


    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM segments WHERE list=? ORDER BY name';
        connection.query(query, [listId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let segments = (rows || []).map(tools.convertKeys);
            return callback(null, segments);
        });
    });
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Segment ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM segments WHERE id=? LIMIT 1';
        connection.query(query, [id], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            if (!rows || !rows.length) {
                connection.release();
                return callback(new Error(_('Segment not found')));
            }

            let segment = tools.convertKeys(rows[0]);

            let query = 'SELECT * FROM segment_rules WHERE segment=? ORDER BY id ASC';
            connection.query(query, [id], (err, rows) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                fields.list(segment.list, (err, fieldList) => {
                    if (err || !fieldList) {
                        fieldList = [];
                    }

                    segment.columns = [].concat(module.exports.defaultColumns);
                    fieldList.forEach(field => {
                        if (fields.genericTypes[field.type] === 'textarea') {
                            return;
                        }
                        if (field.column) {
                            segment.columns.push({
                                column: field.column,
                                name: field.name,
                                type: fields.genericTypes[field.type] || 'string'
                            });
                        }
                        if (field.options) {
                            field.options.forEach(subField => {
                                if (subField.column) {
                                    segment.columns.push({
                                        column: subField.column,
                                        name: field.name + ': ' + subField.name,
                                        type: fields.genericTypes[subField.type] || 'string'
                                    });
                                }
                            });
                        }
                    });

                    segment.rules = (rows || []).map(rule => {
                        rule = tools.convertKeys(rule);
                        if (rule.value) {
                            try {
                                rule.value = JSON.parse(rule.value);
                            } catch (E) {
                                // ignore
                            }
                        }
                        if (!rule.value) {
                            rule.value = {};
                        }
                        rule.columnType = segment.columns.filter(column => rule.column === column.column).pop() || {};
                        rule.name = rule.columnType.name || '';
                        switch (rule.columnType.type) {
                            case 'number':
                            case 'date':
                            case 'birthday':
                                if (rule.value.relativeRange) {
                                    let startString = rule.value.startDirection ? util.format(_('%s days after today'), rule.value.start) : util.format(_('%s days before today'), rule.value.start);
                                    let endString = rule.value.endDirection ? util.format(_('%s days after today'), rule.value.end) : util.format(_('%s days before today'), rule.value.end);
                                    rule.formatted = (rule.value.start ? startString : _('today')) + ' … ' + (rule.value.end ? endString : _('today'));
                                } else if (rule.value.range) {
                                    rule.formatted = (rule.value.start || '') + ' … ' + (rule.value.end || '');
                                } else {
                                    rule.formatted = rule.value.value || '';
                                }
                                break;
                            case 'boolean':
                                rule.formatted = rule.value.value ? _('Selected') : _('Not selected');
                                break;
                            default:
                                rule.formatted = rule.value.value || '';
                        }

                        return rule;
                    });

                    return callback(null, segment);
                });
            });
        });
    });
};

module.exports.create = (listId, segment, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    segment = tools.convertKeys(segment);

    segment.name = (segment.name || '').toString().trim();
    segment.type = Number(segment.type) || 0;

    if (!segment.name) {
        return callback(new Error(_('Field Name must be set')));
    }

    if (segment.type <= 0) {
        return callback(new Error(_('Invalid segment rule type')));
    }

    let keys = ['list', 'name', 'type'];
    let values = [listId, segment.name, segment.type];

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'INSERT INTO segments (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result && result.insertId || false);
        });
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Segment ID')));
    }

    let segment = tools.convertKeys(updates);

    segment.name = (segment.name || '').toString().trim();
    segment.type = Number(segment.type) || 0;

    if (!segment.name) {
        return callback(new Error(_('Field Name must be set')));
    }

    if (segment.type <= 0) {
        return callback(new Error(_('Invalid segment rule type')));
    }

    let keys = ['name', 'type'];
    let values = [segment.name, segment.type];

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        values.push(id);

        connection.query('UPDATE segments SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
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
        return callback(new Error(_('Missing Segment ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM segments WHERE id=? LIMIT 1', [id], err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
};

module.exports.createRule = (segmentId, rule, callback) => {
    segmentId = Number(segmentId) || 0;

    if (segmentId < 1) {
        return callback(new Error(_('Missing Segment ID')));
    }

    rule = tools.convertKeys(rule);

    module.exports.get(segmentId, (err, segment) => {
        if (err) {
            return callback(err);
        }

        if (!segment) {
            return callback(new Error(_('Selected segment not found')));
        }

        let column = segment.columns.filter(column => column.column === rule.column).pop();
        if (!column) {
            return callback(new Error(_('Invalid rule type')));
        }

        let value;

        switch (column.type) {
            case 'date':
            case 'birthday':
            case 'number':
                if (column.type === 'date' && rule.range === 'relative') {
                    value = {
                        relativeRange: true,
                        start: Number(rule.startRelative) || 0,
                        startDirection: Number(rule.startDirection) ? 1 : 0,
                        end: Number(rule.endRelative) || 0,
                        endDirection: Number(rule.endDirection) ? 1 : 0
                    };
                } else if (rule.range === 'yes') {
                    value = {
                        range: true,
                        start: rule.start,
                        end: rule.end
                    };
                } else {
                    value = {
                        value: rule.value
                    };
                }
                break;
            case 'boolean':
                value = {
                    value: rule.value ? 1 : 0
                };
                break;
            default:
                value = {
                    value: rule.value
                };
        }

        let keys = ['segment', 'column', 'value'];
        let values = [segment.id, rule.column, JSON.stringify(value)];

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let query = 'INSERT INTO segment_rules (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
            connection.query(query, values, (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, result && result.insertId || false);
            });
        });
    });
};

module.exports.getRule = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Rule ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM segment_rules WHERE id=? LIMIT 1';
        connection.query(query, [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(new Error(_('Specified rule not found')));
            }

            let rule = tools.convertKeys(rows[0]);

            module.exports.get(rule.segment, (err, segment) => {
                if (err) {
                    return callback(err);
                }

                if (!segment) {
                    return callback(new Error(_('Specified segment not found')));
                }

                if (rule.value) {
                    try {
                        rule.value = JSON.parse(rule.value);
                    } catch (E) {
                        // ignore
                    }
                }
                if (!rule.value) {
                    rule.value = {};
                }

                rule.columnType = segment.columns.filter(column => rule.column === column.column).pop() || {};

                rule.name = rule.columnType.name || '';
                switch (rule.columnType.type) {
                    case 'number':
                    case 'date':
                    case 'birthday':
                        if (rule.value.relativeRange) {

                            let startString = rule.value.startDirection ? util.format(_('%s days after today'), rule.value.start) : util.format(_('%s days before today'), rule.value.start);
                            let endString = rule.value.endDirection ? util.format(_('%s days after today'), rule.value.end) : util.format(_('%s days before today'), rule.value.end);
                            rule.formatted = (rule.value.start ? startString : _('today')) + ' … ' + (rule.value.end ? endString : _('today'));
                        } else if (rule.value.range) {
                            rule.formatted = (rule.value.start || '') + ' … ' + (rule.value.end || '');
                        } else {
                            rule.formatted = rule.value.value || '';
                        }
                        break;
                    case 'boolean':
                        rule.formatted = rule.value.value ? _('Selected') : _('Not selected');
                        break;
                    default:
                        rule.formatted = rule.value.value || '';
                }

                return callback(null, rule);
            });
        });
    });
};

module.exports.updateRule = (id, rule, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Rule ID')));
    }

    rule = tools.convertKeys(rule);

    module.exports.getRule(id, (err, existingRule) => {
        if (err) {
            return callback(err);
        }

        if (!existingRule) {
            return callback(new Error(_('Selected rule not found')));
        }

        module.exports.get(existingRule.segment, (err, segment) => {
            if (err) {
                return callback(err);
            }

            if (!segment) {
                return callback(new Error(_('Selected segment not found')));
            }

            let column = segment.columns.filter(column => column.column === existingRule.column).pop();
            if (!column) {
                return callback(new Error(_('Invalid rule type')));
            }

            let value;
            switch (column.type) {
                case 'date':
                case 'birthday':
                case 'number':
                    if (column.type === 'date' && rule.range === 'relative') {
                        value = {
                            relativeRange: true,
                            start: Number(rule.startRelative) || 0,
                            startDirection: Number(rule.startDirection) ? 1 : 0,
                            end: Number(rule.endRelative) || 0,
                            endDirection: Number(rule.endDirection) ? 1 : 0
                        };
                    } else if (rule.range === 'yes') {
                        value = {
                            range: true,
                            start: rule.start,
                            end: rule.end
                        };
                    } else {
                        value = {
                            value: rule.value
                        };
                    }
                    break;
                case 'boolean':
                    value = {
                        value: rule.value ? 1 : 0
                    };
                    break;
                default:
                    value = {
                        value: rule.value
                    };
            }

            let keys = ['value'];
            let values = [JSON.stringify(value)];

            db.getConnection((err, connection) => {
                if (err) {
                    return callback(err);
                }

                values.push(id);

                connection.query('UPDATE segment_rules SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, result && result.affectedRows || false);
                });
            });
        });
    });
};

module.exports.deleteRule = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Rule ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM segment_rules WHERE id=? LIMIT 1', [id], err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
};

module.exports.getQuery = (id, prefix, callback) => {
    module.exports.get(id, (err, segment) => {
        if (err) {
            return callback(err);
        }

        if (!segment) {
            return callback(new Error(_('Segment not found')));
        }

        prefix = prefix ? prefix + '.' : '';

        let query = [];
        let values = [];

        let getRelativeDate = (days, direction) => {
            let date = new Date(Date.now() + (direction ? 1 : -1) * days * 24 * 3600 * 1000);
            return date.toISOString().substr(0, 10);
        };

        let getDate = (value, nextDay) => {
            let parts = value.trim().split(/\D/);
            let year = Number(parts.shift()) || 0;
            let month = Number(parts.shift()) || 0;
            let day = Number(parts.shift()) || 0;
            if (!year || !month || !day) {
                return false;
            }
            return new Date(Date.UTC(year, month - 1, day + (nextDay ? 1 : 0)));
        };

        segment.rules.forEach(rule => {
            switch (rule.columnType.type) {
                case 'string':
                    query.push(prefix + '`' + rule.columnType.column + '` LIKE ?');
                    values.push(rule.value.value);
                    break;
                case 'boolean':
                    query.push(prefix + '`' + rule.columnType.column + '` = ?');
                    values.push(rule.value.value);
                    break;
                case 'number':
                    if (rule.value.range) {
                        let ruleval = '';
                        if (rule.value.start) {
                            ruleval = prefix + '`' + rule.columnType.column + '` >= ?';
                            values.push(rule.value.start);
                        }
                        if (rule.value.end) {
                            ruleval = (ruleval ? '(' + ruleval + ' AND ' : '') + prefix + '`' + rule.columnType.column + '` < ?' + (ruleval ? ')' : '');
                            values.push(rule.value.end);
                        }
                        if (ruleval) {
                            query.push(ruleval);
                        }
                    } else {
                        query.push(prefix + '`' + rule.columnType.column + '` = ?');
                        values.push(rule.value.value);
                    }
                    break;
                case 'birthday':
                    if (rule.value.range) {
                        let start = rule.value.start || '01-01';
                        let end = rule.value.end || '12-31';
                        query.push('(' + prefix + '`' + rule.columnType.column + '` >= ? AND ' + prefix + '`' + rule.columnType.column + '` < ?)');
                        values.push(getDate('2000-' + start));
                        values.push(getDate('2000-' + end, true));
                    } else {
                        query.push('(' + prefix + '`' + rule.columnType.column + '` >= ? AND ' + prefix + '`' + rule.columnType.column + '` < ?)');
                        values.push(getDate('2000-' + rule.value.value));
                        values.push(getDate('2000-' + rule.value.value, true));
                    }
                    break;
                case 'date':
                    if (rule.value.relativeRange) {
                        query.push('(' + prefix + '`' + rule.columnType.column + '` >= ? AND ' + prefix + '`' + rule.columnType.column + '` < ?)');
                        // start
                        values.push(getDate(getRelativeDate(rule.value.start, rule.value.startDirection)));
                        // end
                        values.push(getDate(getRelativeDate(rule.value.end, rule.value.endDirection), true));
                    } else if (rule.value.range) {
                        let ruleval = '';
                        if (rule.value.start) {
                            ruleval = prefix + '`' + rule.columnType.column + '` >= ?';
                            values.push(getDate(rule.value.start));
                        }
                        if (rule.value.end) {
                            ruleval = (ruleval ? '(' + ruleval + ' AND ' : '') + prefix + '`' + rule.columnType.column + '` < ?' + (ruleval ? ')' : '');
                            values.push(getDate(rule.value.end, true));
                        }
                        if (ruleval) {
                            query.push(ruleval);
                        }
                    } else {
                        query.push('(' + prefix + '`' + rule.columnType.column + '` >= ? AND ' + prefix + '`' + rule.columnType.column + '` < ?)');
                        values.push(getDate(rule.value.value));
                        values.push(getDate(rule.value.value, true));
                    }

                    break;
            }
        });

        return callback(null, {
            where: query.join(segment.type === 1 ? ' AND ' : ' OR ') || '1',
            values
        });
    });
};

module.exports.subscribers = (id, onlySubscribed, callback) => {
    module.exports.get(id, (err, segment) => {
        if (err) {
            return callback(err);
        }
        if (!segment) {
            return callback(new Error(_('Segment not found')));
        }
        module.exports.getQuery(id, false, (err, queryData) => {
            if (err) {
                return callback(err);
            }

            db.getConnection((err, connection) => {
                if (err) {
                    return callback(err);
                }

                let query;
                if (!onlySubscribed) {
                    query = 'SELECT COUNT(id) AS `count` FROM `subscription__' + segment.list + '` WHERE ' + queryData.where + ' LIMIT 1';
                } else {
                    query = 'SELECT COUNT(id) AS `count` FROM `subscription__' + segment.list + '` WHERE `status`=1 ' + (queryData.where ? ' AND (' + queryData.where + ')' : '') + ' LIMIT 1';
                }

                connection.query(query, queryData.values, (err, rows) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }
                    let count = rows && rows[0] && rows[0].count || 0;
                    return callback(null, count);
                });
            });
        });
    });
};
