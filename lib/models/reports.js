'use strict';

const db = require('../db');
const tableHelpers = require('../table-helpers');
const fields = require('./fields');
const reportTemplates = require('./report-templates');
const tools = require('../tools');
const _ = require('../translate')._;

const allowedKeys = ['name', 'description', 'report_template', 'params'];

const ReportState = {
    SCHEDULED: 0,
    PROCESSING: 1,
    FINISHED: 2,
    FAILED: 3
};

module.exports.ReportState = ReportState;

module.exports.list = (start, limit, callback) => {
    tableHelpers.list('reports', ['*'], 'name', null, start, limit, callback);
};

module.exports.listWithState = (state, start, limit, callback) => {
    tableHelpers.list('reports', ['*'], 'name', { where: 'state=?', values: [state] }, start, limit, callback);
};

module.exports.filter = (request, callback) => {
    tableHelpers.filter('reports JOIN report_templates ON reports.report_template = report_templates.id',
        ['reports.id AS id', 'reports.name AS name', 'reports.description AS description', 'reports.state AS state', 'reports.report_template AS report_template', 'reports.params AS params', 'reports.last_run AS last_run', 'report_templates.name AS report_template_name', 'report_templates.mime_type AS mime_type' ],
        request, ['#', 'name', 'report_templates.name', 'description', 'last_run'], ['name'], 'name ASC', null, callback);
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing report ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM reports WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            const template = tools.convertKeys(rows[0]);

            const params = template.params.trim();
            if (params !== '') {
                try {
                    template.paramsObject = JSON.parse(params);
                } catch (err) {
                    return callback(err);
                }
            } else {
                template.params = {};
            }

            return callback(null, template);
        });
    });
};

// This method is not supposed to be used for unsanitized inputs. It does not do any checks.
module.exports.updateFields = (id, fieldValueMap, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        const clauses = [];
        const values = [];
        for (let key of Object.keys(fieldValueMap)) {
            clauses.push(tools.toDbKey(key) + '=?');
            values.push(fieldValueMap[key]);
        }

        values.push(id);

        const query = 'UPDATE reports SET ' + clauses.join(', ') + ' WHERE id=? LIMIT 1';
        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            return callback(null, result && result.affectedRows || false);
        });
    });
};

module.exports.createOrUpdate = (createMode, report, callback) => {
    report = report || {};

    const id = 'id' in report ? Number(report.id) : 0;

    if (!createMode && id < 1) {
        return callback(new Error(_('Missing report ID')));
    }

    const name = (report.name || '').toString().trim();

    if (!name) {
        return callback(new Error(_('Report name must be set')));
    }

    const reportTemplateId = Number(report.reportTemplate);
    reportTemplates.get(reportTemplateId, (err, reportTemplate) => {
        if (err) {
            return callback(err);
        }

        const params = report.paramsObject;
        for (const spec of reportTemplate.userFieldsObject) {
            if (params[spec.id].length < spec.minOccurences) {
                return callback(new Error(_('At least ' + spec.minOccurences + ' rows in "' + spec.name + '" have to be selected.')));
            }

            if (params[spec.id].length > spec.maxOccurences) {
                return callback(new Error(_('At most ' + spec.minOccurences + ' rows in "' + spec.name + '" can be selected.')));
            }
        }

        const keys = ['name', 'params'];
        const values = [name, JSON.stringify(params)];


        Object.keys(report).forEach(key => {
            let value = typeof report[key] === 'number' ? report[key] : (report[key] || '').toString().trim();
            key = tools.toDbKey(key);

            if (key === 'description') {
                value = tools.purifyHTML(value);
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
                query = 'INSERT INTO reports (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
            } else {
                query = 'UPDATE reports SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1';
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
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing report ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM reports WHERE id=? LIMIT 1', [id], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            const affected = result && result.affectedRows || 0;
            return callback(err, affected);
        });
    });
};

const campaignFieldsMapping = {
    tracker_count: 'tracker.count',
    country: 'tracker.country',
    device_type: 'tracker.device_type',
    status: 'campaign.status',
    first_name: 'subscribers.first_name',
    last_name: 'subscribers.last_name',
    email: 'subscribers.email'
};

module.exports.getCampaignResults = (campaign, select, clause, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        fields.list(campaign.list, (err, fieldList) => {
            if (err) {
                return callback(err);
            }

            const fieldsMapping = fieldList.reduce((map, field) => {
                map[customFieldName(field.key)] = 'subscribers.' + field.column;
                return map;
            }, Object.assign({}, campaignFieldsMapping));

            let selFields = [];
            for (let idx = 0; idx < select.length; idx++) {
                const item = select[idx];
                if (item in fieldsMapping) {
                    selFields.push(fieldsMapping[item] + ' AS ' + item);
                } else if (item === '*') {
                    selFields = selFields.concat(Object.keys(fieldsMapping).map(item => fieldsMapping[item] + ' AS ' + item));
                } else {
                    selFields.push(item);
                }
            }

            const query = 'SELECT ' + selFields.join(', ') + ' FROM `subscription__' + campaign.list + '` subscribers INNER JOIN `campaign__' + campaign.id + '` campaign on subscribers.id=campaign.subscription LEFT JOIN `campaign_tracker__' + campaign.id + '` tracker on subscribers.id=tracker.subscriber ' + clause;

            connection.query(query, (err, results) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                return callback(null, results);
            });
        });
    });
};

function customFieldName(id) {
    return id.replace(/MERGE_/, 'CUSTOM_').toLowerCase();
}
