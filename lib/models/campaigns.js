'use strict';

let tools = require('../tools');
let db = require('../db');
let lists = require('./lists');
let templates = require('./templates');
let segments = require('./segments');
let subscriptions = require('./subscriptions');
let shortid = require('shortid');
let isUrl = require('is-url');
let feed = require('../feed');
let log = require('npmlog');
let mailer = require('../mailer');
let humanize = require('humanize');
let _ = require('../translate')._;
let util = require('util');
let tableHelpers = require('../table-helpers');

let allowedKeys = ['description', 'from', 'address', 'reply_to', 'subject', 'editor_name', 'editor_data', 'template', 'source_url', 'list', 'segment', 'html', 'text', 'tracking_disabled'];

module.exports.list = (start, limit, callback) => {
    tableHelpers.list('campaigns', ['*'], 'scheduled', null, start, limit, callback);
};

module.exports.filter = (request, parent, callback) => {
    let queryData;
    if (parent) {
        queryData = {
            // only find normal and RSS parent campaigns at this point
            where: '`parent`=?',
            values: [parent]
        };
    } else {
        queryData = {
            // only find normal and RSS parent campaigns at this point
            where: '`type` IN (?,?,?)',
            values: [1, 2, 4]
        };
    }

    tableHelpers.filter('campaigns', ['*'], request, ['#', 'name', 'description', 'status', 'created'], ['name'], 'created DESC', queryData, callback);
};

module.exports.filterQuicklist = (request, callback) => {
    tableHelpers.filter('campaigns', ['id', 'name', 'description', 'created'], request, ['#', 'name', 'description', 'created'], ['name'], 'name ASC', null, callback);
};

module.exports.filterClickedSubscribers = (campaign, linkId, request, columns, callback) => {
    let queryData = {
        where: 'campaign_tracker__' + campaign.id + '.list=? AND campaign_tracker__' + campaign.id + '.link=?',
        values: [campaign.list, linkId]
    };

    tableHelpers.filter('subscription__' + campaign.list + ' JOIN campaign_tracker__' + campaign.id + ' ON campaign_tracker__' + campaign.id + '.subscriber=subscription__' + campaign.list + '.id', ['*'], request, columns, ['email', 'first_name', 'last_name'], 'email ASC', queryData, callback);
};

module.exports.statsClickedSubscribersByColumn = (campaign, linkId, request, column, limit, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query_template = 'SELECT %s AS data, COUNT(*) AS cnt FROM `subscription__%d` JOIN `campaign_tracker__%d` ON `campaign_tracker__%d`.`list`=%d AND `campaign_tracker__%d`.`subscriber`=`subscription__%d`.`id` AND `campaign_tracker__%d`.`link`=%d  GROUP BY `%s` ORDER BY COUNT(`%s`) DESC, `%s`';
        let query = util.format(query_template, column, campaign.list, campaign.id, campaign.id, campaign.list, campaign.id, campaign.list, campaign.id, linkId, column, column, column);

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let data = {};
            let dataList = [];
            let total = 0;

            rows.forEach((row, index) => {
                if (index < limit) {
                    data[row.data] = row.cnt;
                } else {
                    data.other = (data.other ? data.other : 0) + row.cnt;
                }
                total += row.cnt;
            });
            Object.keys(data).forEach(key => {
                let name = key + ': ' + data[key];
                dataList.push([name, data[key]]);
            });
            return callback(null, dataList, total);
        });
    });
};

module.exports.filterStatusSubscribers = (campaign, status, request, columns, callback) => {
    let queryData = {
        where: 'campaign__' + campaign.id + '.list=? AND campaign__' + campaign.id + '.segment=? AND campaign__' + campaign.id + '.status=?',
        values: [campaign.list, campaign.segment && campaign.segment.id || 0, status]
    };

    tableHelpers.filter('subscription__' + campaign.list + ' JOIN campaign__' + campaign.id + ' ON campaign__' + campaign.id + '.subscription=subscription__' + campaign.list + '.id', ['*'], request, columns, ['email', 'first_name', 'last_name'], 'email ASC', queryData, callback);
};

module.exports.getByCid = (cid, callback) => {
    cid = (cid || '').toString().trim();
    if (!cid) {
        return callback(new Error(_('Missing Campaign ID')));
    }
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM campaigns WHERE cid=?', [cid], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let campaign = tools.convertKeys(rows[0]);
            return callback(null, campaign);
        });
    });
};

module.exports.get = (id, withSegment, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Campaign ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM campaigns WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let campaign = tools.convertKeys(rows[0]);

            let handleSegment = () => {

                if (!campaign.segment || !withSegment) {
                    return callback(null, campaign);
                } else {
                    segments.get(campaign.segment, (err, segment) => {
                        if (err || !segment) {
                            // ignore
                            return callback(null, campaign);
                        }
                        segments.subscribers(segment.id, true, (err, subscribers) => {
                            if (err || !subscribers) {
                                segment.subscribers = 0;
                            } else {
                                segment.subscribers = subscribers;
                            }
                            campaign.segment = segment;
                            return callback(null, campaign);
                        });
                    });
                }
            };

            if (!campaign.parent) {
                return handleSegment();
            }

            db.getConnection((err, connection) => {
                if (err) {
                    return callback(err);
                }
                connection.query('SELECT `id`, `cid`, `name` FROM campaigns WHERE id=?', [campaign.parent], (err, rows) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }

                    if (!rows || !rows.length) {
                        return handleSegment();
                    }

                    campaign.parent = tools.convertKeys(rows[0]);
                    return handleSegment();
                });
            });
        });
    });
};

module.exports.getAttachments = (campaign, callback) => {
    campaign = Number(campaign) || 0;

    if (campaign < 1) {
        return callback(new Error(_('Missing Campaign ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let keys = ['id', 'filename', 'content_type', 'size', 'created'];

        connection.query('SELECT `' + keys.join('`, `') + '` FROM `attachments` WHERE `campaign`=?', [campaign], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, []);
            }

            let attachments = rows.map((row, i) => {
                row = tools.convertKeys(row);
                row.index = i + 1;
                row.size = humanize.filesize(Number(row.size) || 0);
                return row;
            });
            return callback(null, attachments);
        });
    });
};

module.exports.addAttachment = (id, attachment, callback) => {

    let size = attachment.content ? attachment.content.length : 0;

    if (!size) {
        return callback(new Error(_('Emtpy or too large attahcment')));
    }
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let keys = ['campaign', 'size'];
        let values = [id, size];

        Object.keys(attachment).forEach(key => {
            let value;
            if (Buffer.isBuffer(attachment[key])) {
                value = attachment[key];
            } else {
                value = typeof attachment[key] === 'number' ? attachment[key] : (attachment[key] || '').toString().trim();
            }

            key = tools.toDbKey(key);
            keys.push(key);
            values.push(value);
        });

        let query = 'INSERT INTO `attachments` (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let attachmentId = result && result.insertId || false;
            return callback(null, attachmentId);
        });
    });
};

module.exports.deleteAttachment = (id, attachment, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'DELETE FROM `attachments` WHERE `id`=? AND `campaign`=? LIMIT 1';
        connection.query(query, [attachment, id], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let deleted = result && result.affectedRows || false;
            return callback(null, deleted);
        });
    });
};

module.exports.getAttachment = (campaign, attachment, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM `attachments` WHERE `id`=? AND `campaign`=? LIMIT 1';
        connection.query(query, [attachment, campaign], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let attachment = tools.convertKeys(rows[0]);
            return callback(null, attachment);
        });
    });
};

module.exports.getLinks = (id, linkId, callback) => {
    if (!callback && typeof linkId === 'function') {
        callback = linkId;
        linkId = false;
    }

    id = Number(id) || 0;
    linkId = Number(linkId) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Campaign ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query;
        let values;

        if (!linkId) {
            query = 'SELECT `id`, `url`, `clicks` FROM links WHERE `campaign`=? LIMIT 1000';
            values = [id];
        } else {
            query = 'SELECT `id`, `url`, `clicks` FROM links WHERE `id`=? AND `campaign`=? LIMIT 1';
            values = [linkId, id];
        }

        connection.query(query, values, (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, []);
            }

            let links = rows.map(
                row => tools.convertKeys(row)
            ).sort((a, b) => (
                a.url.replace(/^https?:\/\/(www.)?/, '').toLowerCase()).localeCompare(b.url.replace(/^https?:\/\/(www.)?/, '').toLowerCase()));

            return callback(null, links);
        });

    });
};

module.exports.create = (campaign, opts, callback) => {

    campaign = tools.convertKeys(campaign);
    let name = (campaign.name || '').toString().trim();

    campaign.trackingDisabled = campaign.trackingDisabled ? 1 : 0;

    opts = opts || {};

    if (/^\d+:\d+$/.test(campaign.list)) {
        campaign.segment = Number(campaign.list.split(':').pop());
        campaign.list = Number(campaign.list.split(':').shift());
    } else {
        campaign.list = Number(campaign.list) || 0;
        campaign.segment = 0;
    }

    switch ((campaign.type || '').toString().trim().toLowerCase()) {
        case 'triggered':
            campaign.type = 4;
            break;
        case 'rss':
            campaign.type = 2;
            break;
        case 'entry':
            if (opts.parent) {
                campaign.type = 3;
            } else {
                campaign.type = 1;
            }
            break;
        case 'normal':
        default:
            campaign.type = 1;
    }

    campaign.template = Number(campaign.template) || 0;

    if (!name) {
        return callback(new Error(_('Campaign Name must be set')));
    }

    if (campaign.type === 2 && (!campaign.sourceUrl || !isUrl(campaign.sourceUrl))) {
        return callback(new Error(_('RSS URL must be set and needs to be a valid URL')));
    }

    let getList = (listId, callback) => {
        if (campaign.type === 4) {
            return callback(null, false);
        }

        lists.get(listId, (err, list) => {
            if (err) {
                return callback(err);
            }
            return callback(null, list || {
                id: listId
            });
        });
    };

    getList(campaign.list, err => {
        if (err) {
            return callback(err);
        }

        let keys = ['name', 'type'];
        let values = [name, campaign.type];

        if (campaign.type === 2) {
            keys.push('status');
            values.push(5); // inactive
        }

        if (campaign.type === 3) {
            keys.push('status', 'parent');
            values.push(2, opts.parent);
        }

        if (campaign.type === 4) {
            keys.push('status');
            values.push(6); // active
        }

        let create = next => {
            Object.keys(campaign).forEach(key => {
                let value = typeof campaign[key] === 'number' ? campaign[key] : (campaign[key] || '').toString().trim();
                key = tools.toDbKey(key);
                if (key === 'description') {
                    value = tools.purifyHTML(value);
                }
                if (allowedKeys.indexOf(key) >= 0 && keys.indexOf(key) < 0) {
                    keys.push(key);
                    values.push(value);
                }
            });

            let cid = shortid.generate();
            keys.push('cid');
            values.push(cid);

            tools.prepareHtml(campaign.html, (err, preparedHtml) => {
                if (err) {
                    log.error('jsdom', err);
                }

                if (!preparedHtml) {
                    preparedHtml = campaign.html;
                }

                keys.push('html_prepared');
                values.push(preparedHtml);

                db.getConnection((err, connection) => {
                    if (err) {
                        return next(err);
                    }

                    let query = 'INSERT INTO campaigns (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
                    connection.query(query, values, (err, result) => {
                        connection.release();
                        if (err) {
                            return next(err);
                        }

                        let campaignId = result && result.insertId || false;
                        if (!campaignId) {
                            return next(null, false);
                        }

                        // we are going to aqcuire a lot of log info, so we are putting
                        // sending logs into separate tables
                        createCampaignTables(campaignId, err => {
                            if (err) {
                                // FIXME: rollback
                                return next(err);
                            }
                            return next(null, campaignId);
                        });
                    });
                });
            });
        };

        if (campaign.type === 2) {
            feed.fetch(campaign.sourceUrl, (err, entries) => {
                if (err) {
                    return callback(err);
                }

                mailer.getTemplate('emails/rss-html.hbs', (err, rendererHtml) => {
                    if (err) {
                        return callback(err);
                    }

                    campaign.html = rendererHtml();

                    create((err, campaignId) => {
                        if (err) {
                            return callback(err);
                        }
                        if (!campaignId || !entries.length) {
                            return callback(null, campaignId);
                        }

                        db.getConnection((err, connection) => {
                            if (err) {
                                return callback(err);
                            }

                            // store references to already existing feed entries
                            // this is needed to detect new entries
                            let query = 'INSERT IGNORE INTO `rss` (`parent`,`guid`,`pubdate`) VALUES ' + entries.map(() => '(?,?,?)').join(',');

                            values = [];
                            entries.forEach(entry => {
                                values.push(campaignId, entry.guid, entry.date);
                            });

                            connection.query(query, values, err => {
                                connection.release();
                                if (err) {
                                    // too late to report as failed
                                    log.error('RSS', err);
                                }

                                return callback(null, campaignId);
                            });
                        });
                    });
                });
            });
            return;
        } else if (campaign.template) {
            templates.get(campaign.template, (err, template) => {
                if (err) {
                    return callback(err);
                }
                if (!template) {
                    return callback(new Error(_('Selected template not found')));
                }

                campaign.editorName = template.editorName;
                campaign.editorData = template.editorData;
                campaign.html = template.html;
                campaign.text = template.text;

                create(callback);
            });
            return;
        } else {
            return create(callback);
        }
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Campaign ID')));
    }

    let campaign = tools.convertKeys(updates);
    let name = (campaign.name || '').toString().trim();

    campaign.trackingDisabled = campaign.trackingDisabled ? 1 : 0;

    if (!name) {
        return callback(new Error(_('Campaign Name must be set')));
    }

    if (/^\d+:\d+$/.test(campaign.list)) {
        campaign.segment = Number(campaign.list.split(':').pop());
        campaign.list = Number(campaign.list.split(':').shift());
    } else {
        campaign.list = Number(campaign.list) || 0;
        campaign.segment = 0;
    }

    let getList = (listId, callback) => {
        lists.get(listId, (err, list) => {
            if (err) {
                return callback(err);
            }
            return callback(null, list || {
                id: listId
            });
        });
    };

    getList(campaign.list, err => {
        if (err) {
            return callback(err);
        }

        let keys = ['name'];
        let values = [name];

        Object.keys(campaign).forEach(key => {
            let value = typeof campaign[key] === 'number' ? campaign[key] : (campaign[key] || '').toString().trim();
            key = tools.toDbKey(key);
            if (key === 'description') {
                value = tools.purifyHTML(value);
            }
            if (allowedKeys.indexOf(key) >= 0 && keys.indexOf(key) < 0) {
                keys.push(key);
                values.push(value);
            }
        });

        tools.prepareHtml(campaign.html, (err, preparedHtml) => {
            if (err) {
                log.error('jsdom', err);
            }

            if (!preparedHtml) {
                preparedHtml = campaign.html;
            }

            keys.push('html_prepared');
            values.push(preparedHtml);

            db.getConnection((err, connection) => {
                if (err) {
                    return callback(err);
                }

                values.push(id);

                connection.query('UPDATE campaigns SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
                    if (err) {
                        connection.release();
                        return callback(err);
                    }
                    let affected = result && result.affectedRows || false;

                    if (!affected) {
                        connection.release();
                        return callback(null, affected);
                    }

                    connection.query('SELECT `type`, `source_url` FROM campaigns WHERE id=? LIMIT 1', [id], (err, rows) => {
                        connection.release();
                        if (err) {
                            return callback(err);
                        }

                        if (!rows || !rows[0] || rows[0].type !== 2) {
                            // if not RSS, then nothing to do here
                            return callback(null, affected);
                        }

                        // update seen rss entries to avoid sending old entries to subscribers
                        feed.fetch(rows[0].source_url, (err, entries) => {
                            if (err) {
                                return callback(err);
                            }

                            db.getConnection((err, connection) => {
                                if (err) {
                                    return callback(err);
                                }

                                let query = 'INSERT IGNORE INTO `rss` (`parent`,`guid`,`pubdate`) VALUES ' + entries.map(() => '(?,?,?)').join(',');

                                values = [];
                                entries.forEach(entry => {
                                    values.push(id, entry.guid, entry.date);
                                });

                                connection.query(query, values, err => {
                                    connection.release();
                                    if (err) {
                                        // too late to report as failed
                                        log.error('RSS', err);
                                    }
                                    return callback(null, affected);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Campaign ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM campaigns WHERE id=? LIMIT 1', [id], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let affected = result && result.affectedRows || 0;
            removeCampaignTables(id, err => {
                if (err) {
                    return callback(err);
                }

                db.clearCache('sender', () => {
                    callback(null, affected);
                });
            });
        });
    });
};

module.exports.send = (id, scheduled, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status === 2) { // already sending
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let query;
            let values;
            if (scheduled) {
                query = 'UPDATE campaigns SET `status`=2, `scheduled`=?, `status_change`=NOW() WHERE id=? LIMIT 1';
                values = [scheduled, id];
            } else {
                query = 'UPDATE campaigns SET `status`=2, `status_change`=NOW() WHERE id=? LIMIT 1';
                values = [id];
            }

            // campaigns marked as status=2 should be picked up by the sending processes
            connection.query(query, values, err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
};

module.exports.pause = (id, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status !== 2) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            // campaigns marked as status=4 are paused
            connection.query('UPDATE campaigns SET `status`=4, `status_change`=NOW() WHERE id=? LIMIT 1', [id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                db.clearCache('sender', () => {
                    callback(null, true);
                });
            });
        });
    });
};

module.exports.reset = (id, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status !== 3 && campaign.status !== 4 && !(campaign.status === 2 && campaign.scheduled > new Date())) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            connection.query('UPDATE campaigns SET `status`=1, `status_change`=NULL, `delivered`=0, `opened`=0, `clicks`=0, `bounced`=0, `complained`=0, `unsubscribed`=0 WHERE id=? LIMIT 1', [id], err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                db.clearCache('sender', () => {
                    connection.query('UPDATE links SET `clicks`=0 WHERE campaign=?', [id], err => {
                        if (err) {
                            connection.release();
                            return callback(err);
                        }
                        connection.query('TRUNCATE TABLE `campaign__' + id + '`', [id], err => {
                            if (err) {
                                connection.release();
                                return callback(err);
                            }
                            connection.query('TRUNCATE TABLE `campaign_tracker__' + id + '`', [id], err => {
                                connection.release();
                                if (err) {
                                    return callback(err);
                                }
                                return callback(null, true);
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.activate = (id, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status !== 5) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            // campaigns marked as status=5 are paused
            connection.query('UPDATE campaigns SET `status`=6, `status_change`=NOW() WHERE id=? LIMIT 1', [id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
};

module.exports.inactivate = (id, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status !== 6) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            // campaigns marked as status=6 are paused
            connection.query('UPDATE campaigns SET `status`=5, `status_change`=NOW() WHERE id=? LIMIT 1', [id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
};

module.exports.getMail = (campaignId, listId, subscriptionId, callback) => {
    campaignId = Number(campaignId) || 0;
    listId = Number(listId) || 0;
    subscriptionId = Number(subscriptionId) || 0;

    if (campaignId < 1 || listId < 1 || subscriptionId < 1) {
        return callback(new Error(_('Invalid or missing message ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM `campaign__' + campaignId + '` WHERE list=? AND subscription=?', [listId, subscriptionId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let campaign = tools.convertKeys(rows[0]);
            return callback(null, campaign);
        });
    });
};

module.exports.findMailByResponse = (responseId, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT id FROM campaigns', [], (err, campaignList) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            if (!campaignList || !campaignList.length) {
                connection.release();
                return callback(null, false);
            }

            let pos = 0;
            let checkNext = () => {
                if (pos >= campaignList.length) {
                    // all campaigns checked, result not found
                    connection.release();
                    return callback(null, false);
                }
                let campaign = campaignList[pos++];

                connection.query('SELECT id, list, segment, subscription FROM `campaign__' + campaign.id + '` WHERE `response_id`=? LIMIT 1', [responseId], (err, rows) => {
                    if (err || !rows || !rows.length) {
                        return checkNext();
                    }
                    connection.release();

                    let message = rows[0];
                    message.campaign = campaign.id;
                    return callback(null, message);
                });
            };

            checkNext();
        });
    });
};

module.exports.findMailByCampaign = (campaignHeader, callback) => {
    if (!campaignHeader) {
        return callback(null, false);
    }

    let parts = campaignHeader.split('.');
    let cCid = parts.shift();
    let sCid = parts.pop();

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT `id`, `list`, `segment` FROM `campaigns` WHERE `cid`=? LIMIT 1';
        connection.query(query, [cCid], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }
            if (!rows || !rows.length) {
                connection.release();
                return callback(null, false);
            }

            let campaignId = rows[0].id;
            let listId = rows[0].list;
            let segmentId = rows[0].segment;

            let query = 'SELECT id FROM `subscription__' + listId + '` WHERE cid=? LIMIT 1';
            connection.query(query, [sCid], (err, rows) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                if (!rows || !rows.length) {
                    connection.release();
                    return callback(null, false);
                }

                let subscriptionId = rows[0].id;

                let query = 'SELECT `id`, `list`, `segment`, `subscription` FROM `campaign__' + campaignId + '` WHERE `list`=? AND `segment`=? AND `subscription`=? LIMIT 1';
                connection.query(query, [listId, segmentId, subscriptionId], (err, rows) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }
                    if (!rows || !rows.length) {
                        return callback(null, false);
                    }

                    let message = rows[0];
                    message.campaign = campaignId;

                    return callback(null, message);
                });
            });
        });
    });
};

module.exports.updateMessage = (message, status, updateSubscription, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let statusCode;
        if (status === 'unsubscribed') {
            statusCode = 2;
        }
        if (status === 'bounced') {
            statusCode = 3;
        }
        if (status === 'complained') {
            statusCode = 4;
        }

        let query = 'UPDATE `campaigns` SET `' + status + '`=`' + status + '`+1 WHERE id=? LIMIT 1';
        connection.query(query, [message.campaign], () => {

            let query = 'UPDATE `campaign__' + message.campaign + '` SET status=?, updated=NOW() WHERE id=? LIMIT 1';
            connection.query(query, [statusCode, message.id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                if (updateSubscription) {
                    subscriptions.changeStatus(message.subscription, message.list, statusCode === 2 ? message.campaign : false, statusCode, callback);
                } else {
                    return callback(null, true);
                }
            });
        });

    });
};

function createCampaignTables(id, callback) {
    let query = 'CREATE TABLE `campaign__' + id + '` LIKE campaign';
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query(query, err => {
            if (err) {
                connection.release();
                return callback(err);
            }
            let query = 'CREATE TABLE `campaign_tracker__' + id + '` LIKE campaign_tracker';
            connection.query(query, err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
}

function removeCampaignTables(id, callback) {
    let query = 'DROP TABLE IF EXISTS `campaign__' + id + '`';
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query(query, err => {
            if (err) {
                connection.release();
                return callback(err);
            }
            let query = 'DROP TABLE IF EXISTS `campaign_tracker__' + id + '`';
            connection.query(query, err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
}
