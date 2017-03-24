'use strict';

let db = require('../db');
let shortid = require('shortid');
let util = require('util');
let _ = require('../translate')._;

let geoip = require('geoip-ultralight');
let campaigns = require('./campaigns');
let subscriptions = require('./subscriptions');
let lists = require('./lists');

let log = require('npmlog');
let urllib = require('url');
let he = require('he');
let ua_parser = require('device');

module.exports.resolve = (linkCid, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'SELECT id, url FROM links WHERE `cid`=? LIMIT 1';
        connection.query(query, [linkCid], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (rows && rows.length) {
                return callback(null, rows[0].id, rows[0].url);
            }

            return callback(null, false);
        });
    });
};

module.exports.countClick = (remoteIp, useragent, campaignCid, listCid, subscriptionCid, linkId, callback) => {
    getSubscriptionData(campaignCid, listCid, subscriptionCid, (err, data) => {
        if (err) {
            return callback(err);
        }

        if (!data || data.campaign.trackingDisabled) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                let country = geoip.lookupCountry(remoteIp) || null;
                let device = ua_parser(useragent, { unknownUserAgentDeviceType: 'desktop', emptyUserAgentDeviceType: 'desktop' });
                let query = 'INSERT INTO `campaign_tracker__' + data.campaign.id + '` (`list`, `subscriber`, `link`, `ip`, `device_type`, `country`) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `count`=`count`+1';
                connection.query(query, [data.list.id, data.subscription.id, linkId, remoteIp, device.type, country], (err, result) => {
                    if (err && err.code !== 'ER_DUP_ENTRY') {
                        return connection.rollback(() => {
                            connection.release();
                            return callback(err);
                        });
                    }

                    if (err && err.code === 'ER_DUP_ENTRY' || result.affectedRows > 1) {
                        return connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, false);
                        });
                    }

                    let query = 'UPDATE `subscription__' + data.list.id + '` SET `latest_click`=NOW(), `latest_open`=NOW() WHERE id=?';
                    connection.query(query, [data.subscription.id], err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                return callback(err);
                            });
                        }

                        let query = 'UPDATE links SET clicks = clicks + 1 WHERE id=?';
                        connection.query(query, [linkId], err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }

                            let query = 'INSERT INTO `campaign_tracker__' + data.campaign.id + '` (`list`, `subscriber`, `link`, `ip`, `device_type`, `country`) VALUES (?,?,?,?,?,?)';
                            connection.query(query, [data.list.id, data.subscription.id, 0, remoteIp, device.type, country], err => {
                                if (err && err.code !== 'ER_DUP_ENTRY') {
                                    return connection.rollback(() => {
                                        connection.release();
                                        return callback(err);
                                    });
                                }

                                if (err && err.code === 'ER_DUP_ENTRY') {
                                    return connection.commit(err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                return callback(err);
                                            });
                                        }
                                        connection.release();
                                        return callback(null, false);
                                    });
                                }

                                let query = 'UPDATE campaigns SET clicks = clicks + 1 WHERE id=?';
                                connection.query(query, [data.campaign.id], err => {
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
                                        return callback(null, false);
                                    });
                                });

                                // also count clicks as open events in case beacon image was blocked
                                module.exports.countOpen(remoteIp, useragent, campaignCid, listCid, subscriptionCid, () => false);
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.countOpen = (remoteIp, useragent, campaignCid, listCid, subscriptionCid, callback) => {
    getSubscriptionData(campaignCid, listCid, subscriptionCid, (err, data) => {
        if (err) {
            return callback(err);
        }

        if (!data || data.campaign.trackingDisabled) {
            return callback(null, false);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                let country = geoip.lookupCountry(remoteIp) || null;
                let device = ua_parser(useragent, { unknownUserAgentDeviceType: 'desktop', emptyUserAgentDeviceType: 'desktop' });
                let query = 'INSERT INTO `campaign_tracker__' + data.campaign.id + '` (`list`, `subscriber`, `link`, `ip`, `device_type`, `country`) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `count`=`count`+1';
                connection.query(query, [data.list.id, data.subscription.id, -1, remoteIp, device.type, country], (err, result) => {
                    if (err && err.code !== 'ER_DUP_ENTRY') {
                        return connection.rollback(() => {
                            connection.release();
                            return callback(err);
                        });
                    }
                    if (err && err.code === 'ER_DUP_ENTRY' || result.affectedRows > 1) {
                        return connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return callback(err);
                                });
                            }
                            connection.release();
                            return callback(null, false);
                        });
                    }

                    let query = 'UPDATE `subscription__' + data.list.id + '` SET `latest_open`=NOW() WHERE id=?';
                    connection.query(query, [data.subscription.id], err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                return callback(err);
                            });
                        }

                        let query = 'UPDATE campaigns SET opened = opened + 1 WHERE id=?';
                        connection.query(query, [data.campaign.id], err => {
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
                                return callback(null, false);
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.add = (url, campaignId, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let cid = shortid.generate();
        let query = 'INSERT INTO links (`cid`, `campaign`, `url`) VALUES (?,?,?)';
        connection.query(query, [cid, campaignId, url], (err, result) => {
            if (err && err.code !== 'ER_DUP_ENTRY') {
                connection.release();
                return callback(err);
            }

            if (!err && result && result.insertId) {
                connection.release();
                return callback(null, result.insertId, cid);
            }

            let query = 'SELECT id, cid FROM links WHERE `campaign`=? AND `url`=? LIMIT 1';
            connection.query(query, [campaignId, url], (err, rows) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                if (rows && rows.length) {
                    return callback(null, rows[0].id, rows[0].cid);
                }

                return callback(null, false);
            });
        });
    });
};

module.exports.updateLinks = (campaign, list, subscription, serviceUrl, message, callback) => {
    if (campaign.trackingDisabled || !message || !message.trim()) {
        // tracking is disabled, do not modify the message
        return setImmediate(() => callback(null, message));
    }
    let re = /(<a[^>]* href\s*=[\s"']*)(http[^"'>\s]+)/gi;
    let urls = new Set();
    (message || '').replace(re, (match, prefix, url) => {
        urls.add(url);
    });

    let map = new Map();
    let vals = urls.values();

    // insert tracking image
    let inserted = false;
    let imgUrl = urllib.resolve(serviceUrl, util.format('/links/%s/%s/%s', campaign.cid, list.cid, encodeURIComponent(subscription.cid)));
    let img = '<img src="' + imgUrl + '" width="1" height="1" alt="mt">';
    message = message.replace(/<\/body\b/i, match => {
        inserted = true;
        return img + match;
    });
    if (!inserted) {
        message = message + img;
    }

    let replaceUrls = () => {
        callback(null,
            message.replace(re, (match, prefix, url) =>
                prefix + (map.has(url) ? urllib.resolve(serviceUrl, util.format('/links/%s/%s/%s/%s', campaign.cid, list.cid, encodeURIComponent(subscription.cid), encodeURIComponent(map.get(url)))) : url)));
    };

    let storeNext = () => {
        let urlItem = vals.next();
        if (urlItem.done) {
            return replaceUrls();
        }

        module.exports.add(he.decode(urlItem.value, {
            isAttributeValue: true
        }), campaign.id, (err, linkId, cid) => {
            if (err) {
                log.error('Link', err);
                return storeNext();
            }
            map.set(urlItem.value, cid);
            return storeNext();
        });
    };

    storeNext();
};

function getSubscriptionData(campaignCid, listCid, subscriptionCid, callback) {
    campaigns.getByCid(campaignCid, (err, campaign) => {
        if (err) {
            return callback(err);
        }
        if (!campaign) {
            return callback(new Error(_('Campaign not found')));
        }

        lists.getByCid(listCid, (err, list) => {
            if (err) {
                return callback(err);
            }
            if (!list) {
                return callback(new Error(_('List not found')));
            }

            subscriptions.get(list.id, subscriptionCid, (err, subscription) => {
                if (err) {
                    return callback(err);
                }
                if (!subscription) {
                    return callback(new Error(_('Subscription not found')));
                }

                return callback(null, {
                    campaign,
                    list,
                    subscription
                });
            });
        });
    });
}
