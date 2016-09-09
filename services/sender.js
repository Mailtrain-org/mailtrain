'use strict';

let log = require('npmlog');
let config = require('config');
let db = require('../lib/db');
let tools = require('../lib/tools');
let mailer = require('../lib/mailer');
let campaigns = require('../lib/models/campaigns');
let segments = require('../lib/models/segments');
let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let settings = require('../lib/models/settings');
let links = require('../lib/models/links');
let shortid = require('shortid');
let url = require('url');
let htmlToText = require('html-to-text');
let request = require('request');
let caches = require('../lib/caches');
let libmime = require('libmime');

let attachmentCache = new Map();
let attachmentCacheSize = 0;

function findUnsent(callback) {
    let returnUnsent = (row, campaign) => {
        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }
            let subscription = tools.convertKeys(row);
            let query = 'INSERT INTO `campaign__' + campaign.id + '` (list, segment, subscription) VALUES(?, ?,?)';
            connection.query(query, [campaign.list, campaign.segment, subscription.id], (err, result) => {
                connection.release();
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        // race condition, try next one
                        return findUnsent(callback);
                    }
                    return callback(err);
                }

                subscription.campaign = campaign.id;
                callback(null, {
                    id: result.insertId,
                    listId: campaign.list,
                    campaignId: campaign.id,
                    subscription
                });
            });
        });
    };

    // get next subscriber from trigger queue
    let checkQueued = () => {
        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }
            connection.query('SELECT * FROM `queued` ORDER BY `created` ASC LIMIT 1', (err, rows) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                if (!rows || !rows.length) {
                    connection.release();
                    return callback(null, false);
                }

                let queued = tools.convertKeys(rows[0]);

                // delete queued element
                connection.query('DELETE FROM `queued` WHERE `campaign`=? AND `list`=? AND `subscriber`=? LIMIT 1', [queued.campaign, queued.list, queued.subscriber], err => {
                    if (err) {
                        connection.release();
                        return callback(err);
                    }

                    // get campaign
                    connection.query('SELECT `id`, `list`, `segment` FROM `campaigns` WHERE `id`=? LIMIT 1', [queued.campaign], (err, rows) => {
                        if (err) {
                            connection.release();
                            return callback(err);
                        }
                        if (!rows || !rows.length) {
                            connection.release();
                            return callback(null, false);
                        }

                        let campaign = tools.convertKeys(rows[0]);

                        // get subscription
                        connection.query('SELECT * FROM `subscription__' + queued.list + '` WHERE `id`=? AND `status`=1 LIMIT 1', [queued.subscriber], (err, rows) => {
                            connection.release();
                            if (err) {
                                return callback(err);
                            }
                            if (!rows || !rows.length) {
                                return callback(null, false);
                            }
                            return returnUnsent(rows[0], campaign);
                        });
                    });
                });
            });
        });
    };

    if (caches.cache.has('sender queue')) {
        let cached = caches.shift('sender queue');
        return returnUnsent(cached.row, cached.campaign);
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        // Find "normal" campaigns. Ignore RSS and drip campaigns at this point
        let query = 'SELECT `id`, `list`, `segment` FROM `campaigns` WHERE `status`=? AND (`scheduled` IS NULL OR `scheduled` <= NOW()) AND `type` IN (?, ?) LIMIT 1';
        connection.query(query, [2, 1, 3], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            if (!rows || !rows.length) {
                return checkQueued();
            }

            let campaign = tools.convertKeys(rows[0]);

            let getSegmentQuery = (segmentId, next) => {
                segmentId = Number(segmentId);
                if (!segmentId) {
                    return next(null, {
                        where: '',
                        values: []
                    });
                }

                segments.getQuery(segmentId, 'subscription', next);
            };

            getSegmentQuery(campaign.segment, (err, queryData) => {
                if (err) {
                    return callback(err);
                }

                db.getConnection((err, connection) => {
                    if (err) {
                        return callback(err);
                    }

                    // TODO: Add support for localized sending time. In this case campaign messages are
                    //       not sent before receiver's local time reaches defined time
                    // SELECT * FROM subscription__1 LEFT JOIN tzoffset ON tzoffset.tz=subscription__1.tz WHERE NOW() + INTERVAL IFNULL(`offset`,0) MINUTE >= localtime

                    let query;
                    let values;

                    // NOT IN
                    query = 'SELECT * FROM `subscription__' + campaign.list + '` AS subscription WHERE status=1 ' + (queryData.where ? ' AND (' + queryData.where + ')' : '') + ' AND id NOT IN (SELECT subscription FROM `campaign__' + campaign.id + '` campaign WHERE campaign.list = ? AND campaign.segment = ? AND campaign.subscription = subscription.id) LIMIT 150';
                    values = queryData.values.concat([campaign.list, campaign.segment]);

                    // LEFT JOIN / IS NULL
                    //query = 'SELECT subscription.* FROM `subscription__' + campaign.list + '` AS subscription LEFT JOIN `campaign__' + campaign.id + '` AS campaign ON campaign.list = ? AND campaign.segment = ? AND campaign.subscription = subscription.id WHERE subscription.status=1 ' + (queryData.where ? 'AND (' + queryData.where + ') ' : '') + 'AND campaign.id IS NULL LIMIT 150';
                    //values = [campaign.list, campaign.segment].concat(queryData.values);

                    connection.query(query, values, (err, rows) => {

                        if (err) {
                            connection.release();
                            return callback(err);
                        }

                        if (!rows || !rows.length) {
                            // everything already processed for this campaign
                            connection.query('UPDATE campaigns SET `status`=3, `status_change`=NOW() WHERE id=? LIMIT 1', [campaign.id], () => {
                                connection.release();
                                return callback(null, false);
                            });
                            return;
                        }
                        connection.release();

                        rows.forEach(row => {
                            caches.push('sender queue', {
                                row,
                                campaign
                            });
                        });

                        return findUnsent(callback);
                    });
                });

            });
        });
    });
}

function getAttachments(campaign, callback) {
    campaigns.getAttachments(campaign.id, (err, attachments) => {
        if (err) {
            return callback(err);
        }
        if (!attachments) {
            return callback(null, []);
        }

        let response = [];
        let pos = 0;
        let getNextAttachment = () => {
            if (pos >= attachments.length) {
                return callback(null, response);
            }
            let attachment = attachments[pos++];
            let aid = campaign.id + ':' + attachment.id;
            if (attachmentCache.has(aid)) {
                response.push(attachmentCache.get(aid));
                return setImmediate(getNextAttachment);
            }
            campaigns.getAttachment(campaign.id, attachment.id, (err, attachment) => {
                if (err) {
                    return callback(err);
                }
                if (!attachment || !attachment.content) {
                    return setImmediate(getNextAttachment);
                }

                response.push(attachment);

                // make sure we do not cache more buffers than 30MB
                if (attachmentCacheSize + attachment.content.length > 30 * 1024 * 1024) {
                    attachmentCacheSize = 0;
                    attachmentCache.clear();
                }

                attachmentCache.set(aid, attachment);
                attachmentCacheSize += attachment.content.length;

                return setImmediate(getNextAttachment);
            });
        };

        getNextAttachment();
    });
}

function formatMessage(message, callback) {
    campaigns.get(message.campaignId, false, (err, campaign) => {
        if (err) {
            return callback(err);
        }
        if (!campaign) {
            return callback(new Error('Campaign not found'));
        }
        lists.get(message.listId, (err, list) => {
            if (err) {
                return callback(err);
            }
            if (!list) {
                return callback(new Error('List not found'));
            }

            settings.list(['serviceUrl', 'verpUse', 'verpHostname'], (err, configItems) => {
                if (err) {
                    return callback(err);
                }

                let useVerp = config.verp.enabled && configItems.verpUse && configItems.verpHostname;
                fields.list(list.id, (err, fieldList) => {
                    if (err) {
                        return callback(err);
                    }

                    message.subscription.mergeTags = {
                        EMAIL: message.subscription.email,
                        FIRST_NAME: message.subscription.firstName,
                        LAST_NAME: message.subscription.lastName,
                        FULL_NAME: [].concat(message.subscription.firstName || []).concat(message.subscription.lastName || []).join(' ')
                    };

                    let encryptionKeys = [];
                    fields.getRow(fieldList, message.subscription, true, true).forEach(field => {
                        if (field.mergeTag) {
                            message.subscription.mergeTags[field.mergeTag] = field.mergeValue || '';
                        }

                        if (field.type === 'gpg' && field.value) {
                            encryptionKeys.push(field.value.trim());
                        }

                        if (field.options) {
                            field.options.forEach(subField => {
                                if (subField.mergeTag) {
                                    message.subscription.mergeTags[subField.mergeTag] = subField.value && subField.mergeValue || '';
                                }
                            });
                        }
                    });

                    let renderAndSend = (html, text, renderTags) => {
                        links.updateLinks(campaign, list, message.subscription, configItems.serviceUrl, html, (err, html) => {
                            if (err) {
                                return callback(err);
                            }

                            // replace data: images with embedded attachments
                            getAttachments(campaign, (err, attachments) => {
                                if (err) {
                                    return callback(err);
                                }

                                html = html.replace(/(<img\b[^>]* src\s*=[\s"']*)(data:[^"'>\s]+)/gi, (match, prefix, dataUri) => {
                                    let cid = shortid.generate() + '-attachments@' + campaign.address.split('@').pop();
                                    attachments.push({
                                        path: dataUri,
                                        cid
                                    });
                                    return prefix + 'cid:' + cid;
                                });

                                let campaignAddress = [campaign.cid, list.cid, message.subscription.cid].join('.');

                                let renderedHtml = renderTags ? tools.formatMessage(configItems.serviceUrl, campaign, list, message.subscription, html) : html;

                                let renderedText = (text || '').trim() ? (renderTags ? tools.formatMessage(configItems.serviceUrl, campaign, list, message.subscription, text) : text) : htmlToText.fromString(renderedHtml, {
                                    wordwrap: 130
                                });

                                return callback(null, {
                                    from: {
                                        name: campaign.from,
                                        address: campaign.address
                                    },
                                    xMailer: 'Mailtrain Mailer (+https://mailtrain.org)',
                                    to: {
                                        name: [].concat(message.subscription.firstName || []).concat(message.subscription.lastName || []).join(' '),
                                        address: message.subscription.email
                                    },
                                    sender: useVerp ? campaignAddress + '@' + configItems.verpHostname : false,

                                    envelope: useVerp ? {
                                        from: campaignAddress + '@' + configItems.verpHostname,
                                        to: message.subscription.email
                                    } : false,

                                    headers: {
                                        'x-fbl': campaignAddress,
                                        // custom header for SparkPost
                                        'x-msys-api': JSON.stringify({
                                            campaign_id: campaignAddress
                                        }),
                                        // custom header for SendGrid
                                        'x-smtpapi': JSON.stringify({
                                            unique_args: {
                                                campaign_id: campaignAddress
                                            }
                                        }),
                                        // custom header for Mailgun
                                        'x-mailgun-variables': JSON.stringify({
                                            campaign_id: campaignAddress
                                        }),
                                        'List-ID': {
                                            prepared: true,
                                            value: libmime.encodeWords(list.name) + ' <' + list.cid + '.' + (url.parse(configItems.serviceUrl).hostname || 'localhost') + '>'
                                        }
                                    },
                                    list: {
                                        unsubscribe: url.resolve(configItems.serviceUrl, '/subscription/' + list.cid + '/unsubscribe/' + message.subscription.cid + '?auto=yes')
                                    },
                                    subject: tools.formatMessage(configItems.serviceUrl, campaign, list, message.subscription, campaign.subject),
                                    html: renderedHtml,
                                    text: renderedText,

                                    attachments,
                                    encryptionKeys
                                });
                            });
                        });
                    };

                    if (campaign.sourceUrl) {
                        let form = tools.getMessageLinks(configItems.serviceUrl, campaign, list, message.subscription);
                        Object.keys(message.subscription.mergeTags).forEach(key => {
                            form[key] = message.subscription.mergeTags[key];
                        });

                        request.post({
                            url: campaign.sourceUrl,
                            form
                        }, (err, httpResponse, body) => {
                            if (err) {
                                return callback(err);
                            }
                            if (httpResponse.statusCode !== 200) {
                                return callback(new Error('Received status code ' + httpResponse.statusCode + ' from ' + campaign.sourceUrl));
                            }
                            renderAndSend(body && body.toString(), '', false);
                        });
                    } else {
                        renderAndSend(campaign.htmlPrepared || campaign.html, campaign.text, true);
                    }
                });
            });
        });
    });
}

let sendLoop = () => {
    mailer.getMailer(err => {
        if (err) {
            log.error('Mail', err.stack);
            return setTimeout(sendLoop, 10 * 1000);
        }

        let getNext = () => {
            if (!mailer.transport.isIdle()) {
                // only retrieve new messages if there are free slots in the mailer queue
                return;
            }

            // find an unsent message
            findUnsent((err, message) => {
                if (err) {
                    log.error('Mail', err.stack);
                    setTimeout(getNext, 5 * 1000);
                    return;
                }
                if (!message) {
                    setTimeout(getNext, 5 * 1000);
                    return;
                }

                //log.verbose('Mail', 'Found new message to be delivered: %s', message.subscription.cid);
                // format message to nodemailer message format
                formatMessage(message, (err, mail) => {
                    if (err) {
                        log.error('Mail', err.stack);
                        setTimeout(getNext, 5 * 1000);
                        return;
                    }

                    let tryCount = 0;
                    let trySend = () => {
                        tryCount++;

                        // send the message
                        mailer.transport.sendMail(mail, (err, info) => {
                            if (err) {
                                log.error('Mail', err.stack);
                                if (err.responseCode && err.responseCode >= 400 && err.responseCode < 500 && tryCount <= 5) {
                                    // temporary error, try again
                                    return setTimeout(trySend, tryCount * 1000);
                                }
                            }

                            let status = err ? 2 : 1;
                            let response = err && (err.response || err.message) || info.response;
                            let responseId = response.split(/\s+/).pop();

                            db.getConnection((err, connection) => {
                                if (err) {
                                    log.error('Mail', err.stack);
                                    return;
                                }

                                let query = 'UPDATE `campaigns` SET `delivered`=`delivered`+1 ' + (status === 2 ? ', `bounced`=`bounced`+1 ' : '') + ' WHERE id=? LIMIT 1';

                                connection.query(query, [message.campaignId], err => {
                                    if (err) {
                                        log.error('Mail', err.stack);
                                    }

                                    let query = 'UPDATE `campaign__' + message.campaignId + '` SET status=?, response=?, response_id=?, updated=NOW() WHERE id=? LIMIT 1';

                                    connection.query(query, [status, response, responseId, message.id], err => {
                                        connection.release();
                                        if (err) {
                                            log.error('Mail', err.stack);
                                        } else {
                                            // log.verbose('Mail', 'Message sent and status updated for %s', message.subscription.cid);
                                        }
                                    });
                                });
                            });
                        });
                    };
                    setImmediate(trySend);
                    setImmediate(() => mailer.transport.checkThrottling(getNext));
                });
            });
        };

        mailer.transport.on('idle', () => mailer.transport.checkThrottling(getNext));
    });
};

module.exports = callback => {
    sendLoop();
    setImmediate(callback);
};
