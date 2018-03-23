'use strict';

let db = require('../db');
let shortid = require('shortid');
let striptags = require('striptags');
let tools = require('../tools');
let helpers = require('../helpers');
let fields = require('./fields');
let segments = require('./segments');
let _ = require('../translate')._;
let tableHelpers = require('../table-helpers');

const Status = {
    SUBSCRIBED: 1,
    UNSUBSCRIBED: 2,
    BOUNCED: 3,
    COMPLAINED: 4,
    MAX: 5
};

module.exports.Status = Status;

module.exports.list = (listId, start, limit, callback) => {
    listId = Number(listId) || 0;
    if (!listId) {
        return callback(new Error('Missing List ID'));
    }

    tableHelpers.list('subscription__' + listId, ['*'], 'email', null, start, limit, (err, rows, total) => {
        if (!err) {
            rows = rows.map(row => tools.convertKeys(row));
        }
        return callback(err, rows, total);
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
        return callback(new Error(_('Missing List ID')));
    }

    if (segmentId) {
        segments.getQuery(segmentId, false, (err, queryData) => {
            if (err) {
                return callback(err);
            }

            tableHelpers.filter('subscription__' + listId, ['*'], request, columns, ['email', 'first_name', 'last_name'], 'email ASC', queryData, callback);
        });
    } else {
        tableHelpers.filter('subscription__' + listId, ['*'], request, columns, ['email', 'first_name', 'last_name'], 'email ASC', null, callback);
    }

};


/*
    Adds a new subscription. Returns error if a subscription with the same email address is already present and is not unsubscribed.
    If it is unsubscribed, the existing subscription is changed based on the provided data.
    If meta.partial is true, it updates even an active subscription.
 */
module.exports.insert = (listId, meta, subscriptionData, callback) => {
    meta = tools.convertKeys(meta);
    subscriptionData = tools.convertKeys(subscriptionData);

    meta.email = meta.email || subscriptionData.email;
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
        Object.keys(subscriptionData).forEach(key => {
            let value = subscriptionData[key];
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

        fields.getValues(fields.getRow(fieldList, subscriptionData, true, true, !!meta.partial), true).forEach(field => {
            keys.push(field.key);
            values.push(field.value);
        });

        values = values.map(v => typeof v === 'string' ? striptags(v) : v);

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
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                    }

                    let query;
                    let queryArgs;
                    let existing = rows && rows[0] || false;
                    let entryId = existing ? existing.id : false;

                    meta.cid = existing ? rows[0].cid : meta.cid;

                    // meta.status may be 'undefined' or '0' when adding a subscription via API call or CSV import. In both cases meta.partial is 'true'.
                    // This must either update an existing subscription without changing its status or insert a new subscription with status SUBSCRIBED.
                    meta.status = meta.status || (existing ? existing.status : Status.SUBSCRIBED);

                    let statusChange = !existing || existing.status !== meta.status;
                    let statusDirection;

                    if (existing && existing.status === Status.SUBSCRIBED && !meta.partial) {
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(new Error(_('Email address already registered'))));
                    }

                    if (statusChange) {
                        keys.push('status', 'status_change');
                        values.push(meta.status, new Date());
                        statusDirection = !existing ? (meta.status === Status.SUBSCRIBED ? '+' : false) : (existing.status === Status.SUBSCRIBED ? '-' : '+');
                    }

                    if (!keys.length) {
                        // nothing to update
                        return connection.commit(err => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
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
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                        }

                        entryId = result.insertId || entryId;

                        if (statusChange && statusDirection) {
                            connection.query('UPDATE lists SET `subscribers`=`subscribers`' + statusDirection + '1 WHERE id=?', [listId], err => {
                                if (err) {
                                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                                }
                                connection.commit(err => {
                                    if (err) {
                                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
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
                                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
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
        return callback(new Error(_('Missing Subscription ID')));
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
        return callback(new Error(_('Missing Subscription ID')));
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
        return callback(new Error(_('Missing Subscription email address')));
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

            fields.getRow(fieldList, subscription, false, true).forEach(field => {
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
        return callback(new Error(_('Missing List ID')));
    }

    if (!cid) {
        return callback(new Error(_('Missing Subscription ID')));
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

        fields.getValues(fields.getRow(fieldList, updates, true, true, true), true).forEach(field => {
            keys.push(field.key);
            values.push(field.value);
        });

        if (!values.length) {
            return callback(null, false);
        }

        values = values.map(v => typeof v === 'string' ? striptags(v) : v);

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

module.exports.changeStatus = (listId, id, campaignId, status, callback) => {
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
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                }

                if (!rows || !rows.length) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(null, false));
                }

                let oldStatus = rows[0].status;
                let statusChange = oldStatus !== status;
                let statusDirection;

                if (!statusChange) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(null, true));
                }

                if (statusChange && oldStatus === Status.SUBSCRIBED || status === Status.SUBSCRIBED) {
                    statusDirection = status === Status.SUBSCRIBED ? '+' : '-';
                }

                connection.query('UPDATE `subscription__' + listId + '` SET `status`=?, `status_change`=NOW() WHERE id=? LIMIT 1', [status, id], err => {
                    if (err) {
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                    }

                    if (!statusDirection) {
                        return connection.commit(err => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                            }
                            connection.release();
                            return callback(null, true);
                        });
                    }

                    connection.query('UPDATE `lists` SET `subscribers`=`subscribers`' + statusDirection + '1 WHERE id=? LIMIT 1', [listId], err => {
                        if (err) {
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                        }

                        // status change is not related to a campaign or it marks message as bounced etc.
                        if (!campaignId || status !== Status.SUBSCRIBED && status !== Status.UNSUBSCRIBED) {
                            return connection.commit(err => {
                                if (err) {
                                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                                }
                                connection.release();
                                return callback(null, true);
                            });
                        }

                        connection.query('SELECT `id` FROM `campaigns` WHERE `cid`=? LIMIT 1', [campaignId], (err, rows) => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                            }

                            let campaign = rows && rows[0] || false;

                            if (!campaign) {
                                // should not happend
                                return connection.commit(err => {
                                    if (err) {
                                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                                    }
                                    connection.release();
                                    return callback(null, true);
                                });
                            }

                            // we should see only unsubscribe events here but you never know
                            connection.query('UPDATE `campaigns` SET `unsubscribed`=`unsubscribed`' + (status === Status.UNSUBSCRIBED ? '+' : '-') + '1 WHERE `cid`=? LIMIT 1', [campaignId], err => {
                                if (err) {
                                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                                }

                                let query = 'UPDATE `campaign__' + campaign.id + '` SET `status`=? WHERE `list`=? AND `subscription`=? LIMIT 1';
                                let values = [status, listId, id];

                                // Updated tracker status
                                connection.query(query, values, err => {
                                    if (err) {
                                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                                    }

                                    return connection.commit(err => {
                                        if (err) {
                                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
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
        return callback(new Error(_('Missing List ID')));
    }

    if (!cid) {
        return callback(new Error(_('Missing subscription ID')));
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
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                    }

                    if (subscription.status !== Status.SUBSCRIBED) {
                        return connection.commit(err => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                            }
                            connection.release();
                            return callback(null, subscription.email);
                        });
                    }

                    connection.query('UPDATE lists SET subscribers=subscribers-1 WHERE id=? LIMIT 1', [listId], err => {
                        if (err) {
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                        }
                        connection.commit(err => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
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

module.exports.createImport = (listId, type, path, size, delimiter, emailcheck, mapping, callback) => {
    listId = Number(listId) || 0;
    type = Number(type) || 0;

    if (listId < 1) {
        return callback(new Error('Missing List ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'INSERT INTO importer (`list`, `type`, `path`, `size`, `delimiter`, `emailcheck`, `mapping`) VALUES(?,?,?,?,?,?,?)';
        connection.query(query, [listId, type, path, size, delimiter, emailcheck,  JSON.stringify(mapping)], (err, result) => {
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
        return callback(new Error(_('Missing List ID')));
    }

    if (importId < 1) {
        return callback(new Error(_('Missing Import ID')));
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
            } else {
                connection.release();
                return callback(null, affected);
            }
        });
    });
};

module.exports.getImport = (listId, importId, callback) => {
    listId = Number(listId) || 0;
    importId = Number(importId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    if (importId < 1) {
        return callback(new Error(_('Missing Import ID')));
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
        return callback(new Error(_('Missing Import ID')));
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
        return callback(new Error(_('Missing List ID')));
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

/*
Performs checks before update of an address. This includes finding the existing subscriber, validating the new email
and checking whether the new email does not conflict with other subscribers.
 */
module.exports.updateAddressCheck = (list, cid, emailNew, ip, callback) => {
    cid = (cid || '').toString().trim();

    if (!list || !list.id) {
        return callback(new Error(_('Missing List ID')));
    }

    if (!cid) {
        return callback(new Error(_('Missing subscription ID')));
    }

    tools.validateEmail(emailNew, false, err => {
        if (err) {
            return callback(err);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let query = 'SELECT * FROM `subscription__' + list.id + '` WHERE `cid`=? AND `status`=' + Status.SUBSCRIBED + ' LIMIT 1';
            let args = [cid];
            connection.query(query, args, (err, rows) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                if (!rows || !rows.length) {
                    connection.release();
                    return callback(new Error(_('Unknown subscription ID')));
                }

                if (rows[0].email === emailNew) {
                    connection.release();
                    return callback(new Error(_('Nothing seems to be changed')));
                }

                let old = rows[0];

                let query = 'SELECT `id` FROM `subscription__' + list.id + '` WHERE `email`=? AND `cid`<>? AND `status`=' + Status.SUBSCRIBED + ' LIMIT 1';
                let args = [emailNew, cid];
                connection.query(query, args, (err, rows) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }

                    if (rows && rows.length > 0) {
                        return callback(null, old, false);
                    } else {
                        return callback(null, old, true);
                    }
                });
            });
        });
    });
};


/*
    Updates address in subscription__xxx
 */
module.exports.updateAddress = (listId, subscriptionId, emailNew, callback) => {
    // update email address instead of adding new
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let query = 'SELECT `id` FROM `subscription__' + listId + '` WHERE `email`=? AND `id`<>? AND `status`=' + Status.SUBSCRIBED + ' LIMIT 1';
            let args = [emailNew, subscriptionId];
            connection.query(query, args, (err, rows) => {
                if (err) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                }

                if (rows && rows.length > 0) {
                    return helpers.rollbackAndReleaseConnection(connection, () => callback(new Error(_('Email address already registered'))));
                }

                let query = 'DELETE FROM `subscription__' + listId + '` WHERE `email`=? AND `id`<>?';
                let args = [emailNew, subscriptionId];
                connection.query(query, args, err => {
                    if (err) {
                        return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                    }

                    let query = 'UPDATE `subscription__' + listId + '` SET `email`=? WHERE `id`=? AND `status`=' + Status.SUBSCRIBED + ' LIMIT 1';
                    let args = [emailNew, subscriptionId];
                    connection.query(query, args, (err, result) => {
                        if (err) {
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                        }

                        if (!result || !result.affectedRows) {
                            return helpers.rollbackAndReleaseConnection(connection, () => callback(new Error(_('Subscription not found in this list'))));
                        }

                        return connection.commit(err => {
                            if (err) {
                                return helpers.rollbackAndReleaseConnection(connection, () => callback(err));
                            }
                            connection.release();

                            return callback();
                        });
                    });
                });
            });
        });
    });

};

module.exports.getUnsubscriptionMode = (list, subscriptionId) => list.unsubscriptionMode; // eslint-disable-line no-unused-vars
// TODO: Once the unsubscription mode is customizable per segment, then this will be a good place to process it.
