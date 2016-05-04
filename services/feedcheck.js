'use strict';

let log = require('npmlog');

let db = require('../lib/db');
let tools = require('../lib/tools');
let feed = require('../lib/feed');
let campaigns = require('../lib/models/campaigns');

function feedLoop() {

    db.getConnection((err, connection) => {
        if (err) {
            log.error('Feed', err.stack);
            return setTimeout(feedLoop, 15 * 1000);
        }

        let query = 'SELECT `id`, `source_url`, `from`, `address`, `subject`, `list`, `segment` FROM `campaigns` WHERE `type`=2 AND `status`=6 AND (`last_check` IS NULL OR `last_check`< NOW() - INTERVAL 10 MINUTE) LIMIT 1';

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                log.error('Feed', err);
                return setTimeout(feedLoop, 15 * 1000);
            }

            if (!rows || !rows.length) {
                return setTimeout(feedLoop, 15 * 1000);
            }

            let parent = tools.convertKeys(rows[0]);

            updateRssInfo(parent.id, true, false, () => {
                log.verbose('Feed', 'Checking feed %s (%s)', parent.sourceUrl, parent.id);
                feed.fetch(parent.sourceUrl, (err, entries) => {
                    if (err) {
                        log.error('Feed', err);
                        return updateRssInfo(parent.id, false, 'Feed error: ' + err.message, () => {
                            setTimeout(feedLoop, 1 * 1000);
                        });
                    }
                    checkEntries(parent, entries, (err, result) => {
                        let message;
                        if (err) {
                            log.error('Feed', err);
                            message = 'Feed error: ' + err.message;
                        } else if (result) {
                            log.verbose('Feed', 'Added %s new campaigns for %s', result, parent.id);
                            message = 'Found ' + result + ' new campaign messages from feed';
                        } else {
                            message = 'Found nothing new from the feed';
                        }
                        return updateRssInfo(parent.id, false, message, () => {
                            setTimeout(feedLoop, 1 * 1000);
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

                let campaign = {
                    type: 'entry',
                    name: entry.title || 'RSS entry ' + (entry.guid.substr(0, 67)),
                    from: parent.from,
                    address: parent.address,
                    subject: entry.title || parent.subject,
                    list: parent.list,
                    segment: parent.segment,
                    html: entry.content
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
