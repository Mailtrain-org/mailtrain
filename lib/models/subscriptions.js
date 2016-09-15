'use strict';

let db = require('../db');
let shortid = require('shortid');
let tools = require('../tools');
let fields = require('./fields');
let geoip = require('geoip-ultralight');
let segments = require('./segments');
let settings = require('./settings');
let mailer = require('../mailer');
let urllib = require('url');
let log = require('npmlog');
let csvGenerate = require('csv-generate');

module.exports.list = (listId, start, limit, callback) => {
    listId = Number(listId) || 0;
    if (!listId) {
        return callback(new Error('Missing List ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM `subscription__' + listId + '` ORDER BY email LIMIT ? OFFSET ?', [limit, start], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            connection.query('SELECT FOUND_ROWS() AS total', (err, total) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                let subscriptions = rows.map(row => tools.convertKeys(row));
                return callback(null, subscriptions, total && total[0] && total[0].total);
            });
        });
    });
};

module.exports.listTestUsers = (listId, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT id, cid, email, first_name, last_name FROM `subscription__' + listId + '` WHERE is_test=1 LIMIT 100', (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, []);
            }

            let subscribers = rows.map(subscriber => {
                subscriber = tools.convertKeys(subscriber);
                let fullName = [].concat(subscriber.firstName || []).concat(subscriber.lastName || []).join(' ');
                if (fullName) {
                    subscriber.displayName = fullName + ' <' + subscriber.email + '>';
                } else {
                    subscriber.displayName = subscriber.email;
                }
                return subscriber;
            });
            return callback(null, subscribers);
        });
    });
};


module.exports.filter = (listId, request, columns, segmentId, callback) => {
    listId = Number(listId) || 0;
    segmentId = Number(segmentId) || 0;

    if (!listId) {
        return callback(new Error('Missing List ID'));
    }

    let processQuery = queryData => {

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let query = 'SELECT COUNT(id) AS total FROM `subscription__' + listId + '`';
            let values = [];

            if (queryData.where) {
                query += ' WHERE ' + queryData.where;
                values = values.concat(queryData.values || []);
            }

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
                            ordering.push('`' + orderField + '` ' + orderDirection);
                        }
                    });
                }

                if (!ordering.length) {
                    ordering.push('`email` ASC');
                }

                let args = [Number(request.length) || 50, Number(request.start) || 0];
                let query;

                if (request.search && request.search.value) {
                    query = 'SELECT SQL_CALC_FOUND_ROWS * FROM `subscription__' + listId + '` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? ' + (queryData.where ? ' AND (' + queryData.where + ')' : '') + ' ORDER BY ' + ordering.join(', ') + ' LIMIT ? OFFSET ?';

                    let searchVal = '%' + request.search.value.replace(/\\/g, '\\\\').replace(/([%_])/g, '\\$1') + '%';
                    args = [searchVal, searchVal, searchVal].concat(queryData.values || []).concat(args);
                } else {
                    query = 'SELECT SQL_CALC_FOUND_ROWS * FROM `subscription__' + listId + '` WHERE 1 ' + (queryData.where ? ' AND (' + queryData.where + ')' : '') + ' ORDER BY ' + ordering.join(', ') + ' LIMIT ? OFFSET ?';
                    args = [].concat(queryData.values || []).concat(args);
                }

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

                        let subscriptions = rows.map(row => tools.convertKeys(row));

                        filteredTotal = filteredTotal && filteredTotal[0] && filteredTotal[0].total || 0;
                        return callback(null, subscriptions, total, filteredTotal);
                    });
                });
            });
        });
    };

    if (segmentId) {
        segments.getQuery(segmentId, false, (err, queryData) => {
            if (err) {
                return callback(err);
            }
            processQuery(queryData);
        });
    } else {
        processQuery(false);
    }

};

module.exports.addConfirmation = (list, email, optInIp, data, callback) => {
    let cid = shortid.generate();

    tools.validateEmail(email, false, err => {
        if (err) {
            return callback(err);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let query = 'INSERT INTO confirmations (cid, list, email, opt_in_ip, data) VALUES (?,?,?,?,?)';
            connection.query(query, [cid, list.id, email, optInIp, JSON.stringify(data || {})], (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                if (!result || !result.affectedRows) {
                    return callback(null, false);
                }

                fields.list(list.id, (err, fieldList) => {
                    if (err) {
                        return callback(err);
                    }

                    let encryptionKeys = [];
                    fields.getRow(fieldList, data).forEach(field => {
                        if (field.type === 'gpg' && field.value) {
                            encryptionKeys.push(field.value.trim());
                        }
                    });

                    settings.list(['defaultHomepage', 'defaultFrom', 'defaultAddress', 'serviceUrl'], (err, configItems) => {
                        if (err) {
                            return callback(err);
                        }

                        setImmediate(() => {
                            if (data._skip) {
                                log.info('Subscription', 'Confirmation message for %s marked to be skipped (%s)', email, JSON.stringify(data));
                                return;
                            }

                            mailer.sendMail({
                                from: {
                                    name: configItems.defaultFrom,
                                    address: configItems.defaultAddress
                                },
                                to: {
                                    name: [].concat(data.firstName || []).concat(data.lastName || []).join(' '),
                                    address: email
                                },
                                subject: list.name + ': Please Confirm Subscription',
                                encryptionKeys
                            }, {
                                html: 'emails/confirm-html.hbs',
                                text: 'emails/confirm-text.hbs',
                                data: {
                                    title: list.name,
                                    contactAddress: configItems.defaultAddress,
                                    confirmUrl: urllib.resolve(configItems.serviceUrl, '/subscription/subscribe/' + cid)
                                }
                            }, err => {
                                if (err) {
                                    log.error('Subscription', err.stack);
                                }
                            });
                        });
                        return callback(null, cid);
                    });
                });

            });
        });
    });
};

module.exports.subscribe = (cid, optInIp, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM confirmations WHERE cid=? LIMIT 1';
        connection.query(query, [cid], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let subscription;
            let listId = rows[0].list;
            let email = rows[0].email;
            try {
                subscription = JSON.parse(rows[0].data);
            } catch (E) {
                subscription = {};
            }

            subscription.cid = cid;
            subscription.list = listId;
            subscription.email = email;

            let optInCountry = geoip.lookupCountry(optInIp) || null;
            module.exports.insert(listId, {
                email,
                cid,
                optInIp,
                optInCountry,
                status: 1
            }, subscription, (err, result) => {
                if (err) {
                    return callback(err);
                }

                if (!result.entryId) {
                    return callback(new Error('Could not save subscription'));
                }

                db.getConnection((err, connection) => {
                    if (err) {
                        return callback(err);
                    }
                    connection.query('DELETE FROM confirmations WHERE `cid`=? LIMIT 1', [cid], () => {
                        connection.release();
                        // reload full data from db in case it was an update, not insert
                        return module.exports.getById(listId, result.entryId, callback);
                    });
                });
            });
        });
    });
};

module.exports.insert = (listId, meta, subscription, callback) => {

    meta = tools.convertKeys(meta);
    subscription = tools.convertKeys(subscription);

    meta.email = meta.email || subscription.email;
    meta.cid = meta.cid || shortid.generate();

    fields.list(listId, (err, fieldList) => {
        if (err) {
            return callback(err);
        }

        let insertKeys = ['email', 'cid', 'opt_in_ip', 'opt_in_country', 'imported'];
        let insertValues = [meta.email, meta.cid, meta.optInIp || null, meta.optInCountry || null, meta.imported || null];
        let keys = [];
        let values = [];

        let allowedKeys = ['first_name', 'last_name', 'tz', 'is_test'];
        Object.keys(subscription).forEach(key => {
            let value = subscription[key];
            key = tools.toDbKey(key);
            if (key === 'tz') {
                value = (value || '').toString().toLowerCase().trim();
            }
            if (key === 'is_test') {
                value = value ? '1' : '0';
            }
            if (allowedKeys.indexOf(key) >= 0) {
                keys.push(key);
                values.push(value);
            }
        });

        fields.getValues(fields.getRow(fieldList, subscription, true, true, !!meta.partial), true).forEach(field => {
            keys.push(field.key);
            values.push(field.value);
        });

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                let query = 'SELECT `id`, `status`, `cid` FROM `subscription__' + listId + '` WHERE `email`=? OR `cid`=? LIMIT 1';
                connection.query(query, [meta.email, meta.cid], (err, rows) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            return callback(err);
                        });
                    }

                    let query;
                    let queryArgs;
                    let existing = rows && rows[0] || false;
                    let entryId = existing ? existing.id : false;

                    meta.cid = existing ? rows[0].cid : meta.cid;
                    meta.status = meta.status || (existing ? existing.status : 1);

                    let statusChange = !existing || existing.status !== meta.status;
                    let statusDirection;

                    if (statusChange) {
                        keys.push('status', 'status_change');
                        values.push(meta.status, new Date());
                        statusDirection = !existing ? (meta.status === 1 ? '+' : false) : (existing.status === 1 ? '-' : '+');
                    }

                    if (!keys.length) {
                        // nothing to update
                        return connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, {
                                entryId,
                                cid: meta.cid,
                                inserted: !existing
                            });
                        });
                    }

                    if (!existing) {
                        // insert as new
                        keys = insertKeys.concat(keys);
                        queryArgs = values = insertValues.concat(values);
                        query = 'INSERT INTO `subscription__' + listId + '` (`' + keys.join('`, `') + '`) VALUES (' + keys.map(() => '?').join(',') + ')';
                    } else {
                        // update existing
                        queryArgs = values.concat(existing.id);
                        query = 'UPDATE `subscription__' + listId + '` SET ' + keys.map(key => '`' + key + '`=?') + ' WHERE id=? LIMIT 1';
                    }

                    connection.query(query, queryArgs, (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                return callback(err);
                            });
                        }

                        entryId = result.insertId || entryId;

                        if (statusChange && statusDirection) {
                            connection.query('UPDATE lists SET `subscribers`=`subscribers`' + statusDirection + '1 WHERE id=?', [listId], err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        return callback(err);
                                    });
                                }
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            return callback(err);
                                        });
                                    }
                                    connection.release();
                                    return callback(null, {
                                        entryId,
                                        cid: meta.cid,
                                        inserted: !existing
                                    });
                                });
                            });
                        } else {
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        return callback(err);
                                    });
                                }
                                connection.release();
                                return callback(null, {
                                    entryId,
                                    cid: meta.cid,
                                    inserted: !existing
                                });
                            });
                        }
                    });
                });
            });
        });
    });
};

module.exports.get = (listId, cid, callback) => {
    cid = (cid || '').toString().trim();

    if (!cid) {
        return callback(new Error('Missing Subbscription ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM `subscription__' + listId + '` WHERE cid=?', [cid], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let subscription = tools.convertKeys(rows[0]);
            // ensure list id in response
            subscription.list = subscription.list || listId;
            return callback(null, subscription);
        });
    });
};

module.exports.getById = (listId, id, callback) => {
    id = Number(id) || 0;

    if (!id) {
        return callback(new Error('Missing Subbscription ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM `subscription__' + listId + '` WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let subscription = tools.convertKeys(rows[0]);
            // ensure list id in response
            subscription.list = subscription.list || listId;
            return callback(null, subscription);
        });
    });
};

module.exports.getByEmail = (listId, email, callback) => {
    if (!email) {
        return callback(new Error('Missing Subbscription email address'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM `subscription__' + listId + '` WHERE email=?', [email], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let subscription = tools.convertKeys(rows[0]);
            // ensure list id in response
            subscription.list = subscription.list || listId;
            return callback(null, subscription);
        });
    });
};

module.exports.getWithMergeTags = (listId, cid, callback) => {
    module.exports.get(listId, cid, (err, subscription) => {
        if (err) {
            return callback(err);
        }

        if (!subscription) {
            return callback(null, false);
        }

        fields.list(listId, (err, fieldList) => {
            if (err || !fieldList) {
                return fieldList = [];
            }

            subscription.mergeTags = {
                EMAIL: subscription.email,
                FIRST_NAME: subscription.firstName,
                LAST_NAME: subscription.lastName,
                FULL_NAME: [].concat(subscription.firstName || []).concat(subscription.lastName || []).join(' '),
                TIMEZONE: subscription.tz || ''
            };

            fields.getRow(fieldList, subscription, true, true).forEach(field => {
                if (field.mergeTag) {
                    subscription.mergeTags[field.mergeTag] = field.mergeValue || '';
                }
                if (field.options) {
                    field.options.forEach(subField => {
                        if (subField.mergeTag) {
                            subscription.mergeTags[subField.mergeTag] = subField.mergeValue || '';
                        }
                    });
                }
            });
            return callback(null, subscription);
        });
    });
};

module.exports.update = (listId, cid, updates, allowEmail, callback) => {
    updates = tools.convertKeys(updates);
    listId = Number(listId) || 0;
    cid = (cid || '').toString().trim();

    let keys = [];
    let values = [];

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    if (!cid) {
        return callback(new Error('Missing subscription ID'));
    }

    fields.list(listId, (err, fieldList) => {
        if (err) {
            return callback(err);
        }

        let allowedKeys = ['first_name', 'last_name', 'tz', 'is_test'];

        if (allowEmail) {
            allowedKeys.unshift('email');
        }

        Object.keys(updates).forEach(key => {
            let value = updates[key];
            key = tools.toDbKey(key);
            if (key === 'tz') {
                value = (value || '').toString().toLowerCase().trim();
            }
            if (allowedKeys.indexOf(key) >= 0) {
                keys.push(key);
                values.push(value);
            }
        });

        fields.getValues(fields.getRow(fieldList, updates, true, true), true).forEach(field => {
            keys.push(field.key);
            values.push(field.value);
        });

        if (!values.length) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            values.push(cid);
            connection.query('UPDATE `subscription__' + listId + '` SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE `cid`=? LIMIT 1', values, (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, result && result.affectedRows || false);
            });
        });
    });
};

module.exports.unsubscribe = (listId, email, campaignId, callback) => {
    listId = Number(listId) || 0;
    email = (email || '').toString().trim();

    campaignId = (campaignId || '').toString().trim() || false;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    if (!email) {
        return callback(new Error('Missing email address'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM `subscription__' + listId + '` WHERE `email`=?', [email], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            if (!rows || !rows.length || rows[0].status !== 1) {
                return callback(null, false);
            }

            let subscription = tools.convertKeys(rows[0]);
            module.exports.changeStatus(subscription.id, listId, campaignId, 2, err => {
                if (err) {
                    return callback(err);
                }
                return callback(null, subscription);
            });
        });
    });
};

module.exports.changeStatus = (id, listId, campaignId, status, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return callback(err);
            }

            connection.query('SELECT `status` FROM `subscription__' + listId + '` WHERE id=? LIMIT 1', [id], (err, rows) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        return callback(err);
                    });
                }

                if (!rows || !rows.length) {
                    return connection.rollback(() => {
                        connection.release();
                        return callback(null, false);
                    });
                }

                let oldStatus = rows[0].status;
                let statusChange = oldStatus !== status;
                let statusDirection;

                if (!statusChange) {
                    return connection.rollback(() => {
                        connection.release();
                        return callback(null, true);
                    });
                }

                if (statusChange && oldStatus === 1 || status === 1) {
                    statusDirection = status === 1 ? '+' : '-';
                }

                connection.query('UPDATE `subscription__' + listId + '` SET `status`=?, `status_change`=NOW() WHERE id=? LIMIT 1', [status, id], err => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            return callback(err);
                        });
                    }

                    if (!statusDirection) {
                        return connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, true);
                        });
                    }

                    connection.query('UPDATE `lists` SET `subscribers`=`subscribers`' + statusDirection + '1 WHERE id=? LIMIT 1', [listId], err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                return callback(err);
                            });
                        }

                        // status change is not related to a campaign or it marks message as bounced etc.
                        if (!campaignId || status > 2) {
                            return connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        return callback(err);
                                    });
                                }
                                connection.release();
                                return callback(null, true);
                            });
                        }

                        connection.query('SELECT `id` FROM `campaigns` WHERE `cid`=? LIMIT 1', [campaignId], (err, rows) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }

                            let campaign = rows && rows[0] || false;

                            if (!campaign) {
                                // should not happend
                                return connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            return callback(err);
                                        });
                                    }
                                    connection.release();
                                    return callback(null, true);
                                });
                            }

                            // we should see only unsubscribe events here but you never know
                            connection.query('UPDATE `campaigns` SET `unsubscribed`=`unsubscribed`' + (status === 2 ? '+' : '-') + '1 WHERE `cid`=? LIMIT 1', [campaignId], err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        return callback(err);
                                    });
                                }

                                let query = 'UPDATE `campaign__' + campaign.id + '` SET `status`=? WHERE `list`=? AND `subscription`=? LIMIT 1';
                                let values = [status, listId, id];

                                // Updated tracker status
                                connection.query(query, values, err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            return callback(err);
                                        });
                                    }

                                    return connection.commit(err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                return callback(err);
                                            });
                                        }
                                        connection.release();
                                        return callback(null, true);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.delete = (listId, cid, callback) => {
    listId = Number(listId) || 0;
    cid = (cid || '').toString().trim();

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    if (!cid) {
        return callback(new Error('Missing subscription ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT id, email, status FROM `subscription__' + listId + '` WHERE cid=? LIMIT 1', [cid], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let subscription = rows && rows[0];
            if (!subscription) {
                connection.release();
                return callback(null, false);
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                connection.query('DELETE FROM `subscription__' + listId + '` WHERE cid=? LIMIT 1', [cid], err => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            return callback(err);
                        });
                    }

                    if (subscription.status !== 1) {
                        return connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, subscription.email);
                        });
                    }

                    connection.query('UPDATE lists SET subscribers=subscribers-1 WHERE id=? LIMIT 1', [listId], err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                return callback(err);
                            });
                        }
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, subscription.email);
                        });
                    });
                });
            });
        });
    });
};

module.exports.createImport = (listId, type, path, size, delimiter, mapping, callback) => {
    listId = Number(listId) || 0;
    type = Number(type) || 1;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'INSERT INTO importer (`list`, `type`, `path`, `size`, `delimiter`, `mapping`) VALUES(?,?,?,?,?,?)';
        connection.query(query, [listId, type, path, size, delimiter, JSON.stringify(mapping)], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result && result.insertId || false);
        });
    });
};

module.exports.updateImport = (listId, importId, data, callback) => {
    listId = Number(listId) || 0;
    importId = Number(importId) || 0;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    if (importId < 1) {
        return callback(new Error('Missing Import ID'));
    }

    let keys = [];
    let values = [];

    let allowedKeys = ['type', 'path', 'size', 'delimiter', 'status', 'error', 'processed', 'new', 'failed', 'mapping', 'finished'];
    Object.keys(data).forEach(key => {
        let value = data[key];
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
        let query = 'UPDATE importer SET ' + keys.map(key => '`' + key + '`=?') + ' WHERE id=? AND list=? LIMIT 1';
        connection.query(query, values.concat([importId, listId]), (err, result) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let affected = result && result.affectedRows || false;

            if (data.failed === 0) {
                // remove entries from import_failed table
                let query = 'DELETE FROM `import_failed` WHERE `import`=?';
                connection.query(query, [importId], () => {
                    connection.release();
                    return callback(null, affected);
                });
                return;
            }

            connection.release();
            return callback(null, affected);
        });
    });
};

module.exports.getImport = (listId, importId, callback) => {
    listId = Number(listId) || 0;
    importId = Number(importId) || 0;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    if (importId < 1) {
        return callback(new Error('Missing Import ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT * FROM importer WHERE id=? AND list=? LIMIT 1';
        connection.query(query, [importId, listId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let importer = tools.convertKeys(rows[0]);
            try {
                importer.mapping = JSON.parse(importer.mapping);
            } catch (E) {
                importer.mapping = {
                    columns: []
                };
            }

            return callback(null, importer);
        });
    });
};

module.exports.getFailedImports = (importId, callback) => {
    importId = Number(importId) || 0;

    if (importId < 1) {
        return callback(new Error('Missing Import ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT * FROM import_failed WHERE import=? LIMIT 1000';
        connection.query(query, [importId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            return callback(null, (rows || []).map(tools.convertKeys));
        });
    });
};

module.exports.listImports = (listId, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT * FROM importer WHERE list=? AND status > 0 ORDER BY id DESC';
        connection.query(query, [listId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, []);
            }

            let imports = rows.map(row => {
                let importer = tools.convertKeys(row);
                try {
                    importer.mapping = JSON.parse(importer.mapping);
                } catch (E) {
                    importer.mapping = {
                        columns: []
                    };
                }
                return importer;
            });

            return callback(null, imports);
        });
    });
};
