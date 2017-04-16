'use strict';

let db = require('./db');
let tools = require('./tools');
let log = require('npmlog');

module.exports.list = (source, fields, orderBy, start, limit, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT SQL_CALC_FOUND_ROWS ' + fields.join(', ') + ' FROM ' + source + ' ORDER BY ' + orderBy + ' DESC LIMIT ? OFFSET ?', [limit, start], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            connection.query('SELECT FOUND_ROWS() AS total', (err, total) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, rows, total && total[0] && total[0].total);
            });
        });
    });
};

module.exports.quicklist = (source, fields, orderBy, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT ' + fields.join(', ') + ' FROM ' + source + ' ORDER BY ' + orderBy + ' LIMIT 1000', (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, (rows || []).map(tools.convertKeys));
        });
    });
};

module.exports.filter = (source, fields, request, columns, searchFields, defaultOrdering, queryData, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT COUNT(*) AS total FROM ' + source;
        let values = [];

        if (queryData) {
            query += ' WHERE ' + queryData.where;
            values = values.concat(queryData.values || []);
        }

        log.info("tableHelpers", query);

        connection.query(query, values, (err, total) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            total = total && total[0] && total[0].total || 0;

            let ordering = [];

            if (request.order && request.order.length) {

                request.order.forEach(order => {
                    let orderField = columns[Number(order.column)];
                    let orderDirection = (order.dir || '').toString().toLowerCase() === 'desc' ? 'DESC' : 'ASC';
                    if (orderField) {
                        ordering.push(orderField + ' ' + orderDirection);
                    }
                });
            }

            if (!ordering.length) {
                ordering.push(defaultOrdering);
            }

            let searchWhere = '';
            let searchArgs = [];

            if (request.search && request.search.value) {
                let searchVal = '%' + request.search.value.replace(/\\/g, '\\\\').replace(/([%_])/g, '\\$1') + '%';

                searchWhere = searchFields.map(field => field + ' LIKE ?').join(' OR ');
                searchArgs = searchFields.map(field => searchVal)
            }

            let query = 'SELECT SQL_CALC_FOUND_ROWS ' + fields.join(', ') + ' FROM ' + source +' WHERE ' + (searchWhere ? '(' + searchWhere + ')': '1') + (queryData ? ' AND (' + queryData.where + ')' : '') + ' ORDER BY ' + ordering.join(', ') + ' LIMIT ? OFFSET ?';
            let args = searchArgs.concat(queryData ? queryData.values : []).concat([Number(request.length) || 50, Number(request.start) || 0]);

            log.info("tableHelpers", query);

            connection.query(query, args, (err, rows) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                connection.query('SELECT FOUND_ROWS() AS total', (err, filteredTotal) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }

                    rows = rows.map(row => tools.convertKeys(row));

                    filteredTotal = filteredTotal && filteredTotal[0] && filteredTotal[0].total || 0;
                    return callback(null, rows, total, filteredTotal);
                });
            });
        });
    });
};
