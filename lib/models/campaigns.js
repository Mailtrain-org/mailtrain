'use strict';

let tools = require('../tools');
let db = require('../db');
let lists = require('./lists');
let templates = require('./templates');
let segments = require('./segments');
let subscriptions = require('./subscriptions');
let shortid = require('shortid');

let allowedKeys = ['description', 'from', 'address', 'subject', 'template', 'template_url', 'list', 'segment', 'html', 'text'];

module.exports.list = (start, limit, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM campaigns ORDER BY name LIMIT ? OFFSET ?', [limit, start], (err, rows) => {
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

module.exports.getByCid = (cid, callback) => {
    cid = (cid || '').toString().trim();
    if (!cid) {
        return callback(new Error('Missing Campaign ID'));
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
        return callback(new Error('Missing Campaign ID'));
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
        });
    });
};

module.exports.create = (campaign, callback) => {

    campaign = tools.convertKeys(campaign);
    let name = (campaign.name || '').toString().trim();

    if (/^\d+:\d+$/.test(campaign.list)) {
        campaign.segment = Number(campaign.list.split(':').pop());
        campaign.list = Number(campaign.list.split(':').shift());
    } else {
        campaign.list = Number(campaign.list) || 0;
        campaign.segment = 0;
    }

    campaign.template = Number(campaign.template) || 0;

    if (!name) {
        return callback(new Error('Campaign Name must be set'));
    }

    lists.get(campaign.list, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            return callback(new Error('Selected list not found'));
        }

        let keys = ['name'];
        let values = [name];

        let create = () => {
            Object.keys(campaign).forEach(key => {
                let value = typeof campaign[key] === 'number' ? campaign[key] : (campaign[key] || '').toString().trim();
                key = tools.toDbKey(key);
                if (allowedKeys.indexOf(key) >= 0 && keys.indexOf(key) < 0) {
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

                let query = 'INSERT INTO campaigns (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(',') + ')';
                connection.query(query, values, (err, result) => {
                    connection.release();
                    if (err) {
                        return callback(err);
                    }

                    let campaignId = result && result.insertId || false;
                    if (!campaignId) {
                        return callback(null, false);
                    }

                    // we are going to aqcuire a lot of log info, so we are putting
                    // sending logs into separate tables
                    createCampaignTables(campaignId, err => {
                        if (err) {
                            // FIXME: rollback
                            return callback(err);
                        }
                        return callback(null, campaignId);
                    });
                });
            });
        };

        if (campaign.template) {
            templates.get(campaign.template, (err, template) => {
                if (err) {
                    return callback(err);
                }
                if (!template) {
                    return callback(new Error('Selected template not found'));
                }

                keys = keys.concat(['html', 'text']);
                values = values.concat([template.html, template.text]);

                create();
            });
        } else {
            create();
        }
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error('Missing Campaign ID'));
    }

    let campaign = tools.convertKeys(updates);
    let name = (campaign.name || '').toString().trim();

    if (!name) {
        return callback(new Error('Campaign Name must be set'));
    }

    if (/^\d+:\d+$/.test(campaign.list)) {
        campaign.segment = Number(campaign.list.split(':').pop());
        campaign.list = Number(campaign.list.split(':').shift());
    } else {
        campaign.list = Number(campaign.list) || 0;
        campaign.segment = 0;
    }

    lists.get(campaign.list, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            return callback(new Error('Selected list not found'));
        }

        let keys = ['name'];
        let values = [name];

        Object.keys(campaign).forEach(key => {
            let value = typeof campaign[key] === 'number' ? campaign[key] : (campaign[key] || '').toString().trim();
            key = tools.toDbKey(key);
            if (allowedKeys.indexOf(key) >= 0 && keys.indexOf(key) < 0) {
                keys.push(key);
                values.push(value);
            }
        });

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            values.push(id);

            connection.query('UPDATE campaigns SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, result && result.affectedRows || false);
            });
        });
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error('Missing Campaign ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM campaigns WHERE id=? LIMIT 1', [id], (err, result) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let affected = result && result.affectedRows || 0;

            connection.query('DELETE FROM links WHERE campaign=?', [id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                removeCampaignTables(id, err => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, affected);
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
                if (err) {
                    connection.release();
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
};

module.exports.reset = (id, callback) => {
    module.exports.get(id, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }

        if (campaign.status !== 3 && !(campaign.status === 2 && campaign.scheduled > new Date())) {
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
                connection.query('DELETE FROM links WHERE campaign=?', [id], err => {
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
};

module.exports.getMail = (campaignId, listId, subscriptionId, callback) => {
    campaignId = Number(campaignId) || 0;
    listId = Number(listId) || 0;
    subscriptionId = Number(subscriptionId) || 0;

    if (campaignId < 1 || listId < 1 || subscriptionId < 1) {
        return callback(new Error('Invalid or missing message ID'));
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
