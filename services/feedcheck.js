'use strict';

let log = require('npmlog');

let db = require('../lib/db');
let tools = require('../lib/tools');
let feed = require('../lib/feed');
let campaigns = require('../lib/models/campaigns');
let _ = require('../lib/translate')._;
let util = require('util');

const feed_timeout = 15 * 1000;
const rss_timeout = 1 * 1000;

function feedLoop() {

    db.getConnection((err, connection) => {
        if (err) {
            log.error('Feed', err.stack);
            return setTimeout(feedLoop, feed_timeout);
        }

        let query = 'SELECT `id`, `source_url`, `from`, `address`, `subject`, `list`, `segment`, `html` FROM `campaigns` WHERE `type`=2 AND `status`=6 AND (`last_check` IS NULL OR `last_check`< NOW() - INTERVAL 10 MINUTE) LIMIT 1';

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                log.error('Feed', err);
                return setTimeout(feedLoop, feed_timeout);
            }

            if (!rows || !rows.length) {
                return setTimeout(feedLoop, feed_timeout);
            }

            let parent = tools.convertKeys(rows[0]);

            updateRssInfo(parent.id, true, false, () => {
                log.verbose('Feed', 'Checking feed %s (%s)', parent.sourceUrl, parent.id);
                feed.fetch(parent.sourceUrl, (err, entries) => {
                    if (err) {
                        log.error('Feed', err);
                        return updateRssInfo(parent.id, false, 'Feed error: ' + err.message, () => {
                            setTimeout(feedLoop, rss_timeout);
                        });
                    }
                    checkEntries(parent, entries, (err, result) => {
                        let message;
                        if (err) {
                            log.error('Feed', err);
                            message = util.format(_('Feed error: %s'), err.message);
                        } else if (result) {
                            log.verbose('Feed', 'Added %s new campaigns for %s', result, parent.id);
                            message = util.format(_('Found %s new campaign messages from feed'), result);
                        } else {
                            message = _('Found nothing new from the feed');
                        }
                        return updateRssInfo(parent.id, false, message, () => {
                            setTimeout(feedLoop, rss_timeout);
                        });
                    });
                });
            });
        });
    });
}

function updateRssInfo(id, updateCheck, status, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            log.error('Feed', err.stack);
            return callback(err);
        }
        let query;
        let values;
        if (updateCheck) {
            if (status) {
                query = 'UPDATE `campaigns` SET `last_check`=NOW(), `check_status`=? WHERE id=? LIMIT 1';
                values = [status, id];
            } else {
                query = 'UPDATE `campaigns` SET `last_check`=NOW() WHERE id=? LIMIT 1';
                values = [id];
            }
        } else {
            query = 'UPDATE `campaigns` SET `check_status`=? WHERE id=? LIMIT 1';
            values = [status, id];
        }

        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                log.error('Feed', err);
                return callback(err);
            }
            return callback(null, result.affectedRows);
        });
    });
}

function checkEntries(parent, entries, callback) {
    let pos = 0;
    let added = 0;
    let checkNextEntry = () => {
        if (pos >= entries.length) {
            return callback(null, added);
        }

        let entry = entries[pos++];
        if (!entry || !entry.guid) {
            return checkNextEntry();
        }

        db.getConnection((err, connection) => {
            if (err) {
                log.error('Feed', err.stack);
                return setTimeout(checkNextEntry, 15 * 1000);
            }

            // parent+guid is unique, so the query should fail for existing entries
            let query = 'INSERT IGNORE INTO `rss` (`parent`, `guid`, `pubdate`) VALUES (?,?,?)';

            connection.query(query, [parent.id, entry.guid, entry.date], (err, result) => {
                connection.release();
                if (err) {
                    log.error('Feed', err);
                    return setTimeout(checkNextEntry, 15 * 1000);
                }
                if (!result.insertId) {
                    return setImmediate(checkNextEntry);
                }

                let entryId = result.insertId;
                let html = (parent.html || '').toString().trim();

                if (/\[RSS_ENTRY[\w]*\]/i.test(html)) {
                    html = html.replace(/\[RSS_ENTRY\]/, entry.content); //for backward compatibility
                    Object.keys(entry).forEach(key => {
                        html = html.replace('\[RSS_ENTRY_'+key.toUpperCase()+'\]', entry[key])
                    });
                } else {
                    html = entry.content + html;
                }

                let campaign = {
                    type: 'entry',
                    name: entry.title || util.format(_('RSS entry %s'), entry.guid.substr(0, 67)),
                    from: parent.from,
                    address: parent.address,
                    subject: entry.title || parent.subject,
                    list: parent.segment ? parent.list + ':' + parent.segment : parent.list,
                    html
                };

                campaigns.create(campaign, {
                    parent: parent.id
                }, (err, campaignId) => {
                    if (err) {
                        log.error('Campaign', err);
                        return setTimeout(checkNextEntry, 15 * 1000);
                    }
                    added++;
                    db.getConnection((err, connection) => {
                        if (err) {
                            log.error('Feed', err.stack);
                            return setTimeout(checkNextEntry, 15 * 1000);
                        }
                        let query = 'UPDATE `rss` SET `campaign`=? WHERE id=? LIMIT 1';
                        connection.query(query, [campaignId, entryId], err => {
                            connection.release();
                            if (err) {
                                log.error('Feed', err.stack);
                                return setTimeout(checkNextEntry, 15 * 1000);
                            }
                            return setImmediate(checkNextEntry);
                        });
                    });
                });
            });
        });
    };

    checkNextEntry();
}

module.exports = callback => {
    feedLoop();
    setImmediate(callback);
};
