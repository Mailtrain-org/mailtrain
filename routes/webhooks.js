'use strict';

let express = require('express');
let router = new express.Router();
let request = require('request');
let campaigns = require('../lib/models/campaigns');
let subscriptions = require('../lib/models/subscriptions');
let db = require('../lib/db');
let log = require('npmlog');
let multer = require('multer');
let uploads = multer();

router.post('/aws', (req, res, next) => {
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (E) {
            return next(new Error('Could not parse input'));
        }
    }

    switch (req.body.Type) {

        case 'SubscriptionConfirmation':
            if (req.body.SubscribeURL) {
                request(req.body.SubscribeURL, () => false);
                break;
            } else {
                let err = new Error('SubscribeURL not set');
                err.status = 400;
                return next(err);
            }

        case 'Notification':
            if (req.body.Message) {
                if (typeof req.body.Message === 'string') {
                    try {
                        req.body.Message = JSON.parse(req.body.Message);
                    } catch (E) {
                        return next('Could not parse Message object');
                    }
                }

                if (req.body.Message.mail && req.body.Message.mail.messageId) {
                    campaigns.findMail(req.body.Message.mail.messageId, (err, message) => {
                        if (err || !message) {
                            return;
                        }

                        switch (req.body.Message.notificationType) {
                            case 'Bounce':
                                updateMessage(message, 'bounced', ['Undetermined', 'Permanent'].indexOf(req.body.Message.bounce.bounceType) >= 0, (err, updated) => {
                                    if (err) {
                                        log.error('AWS', 'Failed updating message: %s', err.stack);
                                    } else if (updated) {
                                        log.verbose('AWS', 'Marked message %s as bounced', req.body.Message.mail.messageId);
                                    }
                                });
                                break;
                            case 'Complaint':
                                if (req.body.Message.complaint) {
                                    updateMessage(message, 'complained', true, (err, updated) => {
                                        if (err) {
                                            log.error('AWS', 'Failed updating message: %s', err.stack);
                                        } else if (updated) {
                                            log.verbose('AWS', 'Marked message %s as complaint', req.body.Message.mail.messageId);
                                        }
                                    });
                                }
                                break;
                        }
                    });
                }
            }
            break;
    }

    res.json({
        success: true
    });
});

router.post('/sparkpost', (req, res, next) => {
    let events = [].concat(req.body || []);
    let pos = 0;

    let processEvents = () => {
        if (pos >= events.length) {
            return res.json({
                success: true
            });
        }
        let curEvent = events[pos++];

        let msys = curEvent && curEvent.msys;
        let evt;

        if (msys && msys.message_event) {
            evt = msys.message_event;
        } else if (msys && msys.unsubscribe_event) {
            evt = msys.unsubscribe_event;
        }

        if (!evt) {
            return processEvents();
        }

        getMessage(evt.campaign_id, (err, message) => {
            if (err) {
                return next(err);
            }

            if (!message) {
                return processEvents();
            }

            switch (evt.type) {
                case 'bounce':
                    // https://support.sparkpost.com/customer/portal/articles/1929896
                    return updateMessage(message, 'bounced', [1, 10, 25, 30, 50].indexOf(Number(evt.bounce_class)) >= 0, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sparkpost', 'Marked message %s as bounced', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'spam_complaint':
                    return updateMessage(message, 'complained', true, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sparkpost', 'Marked message %s as complaint', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'link_unsubscribe':
                    return updateMessage(message, 'unsubscribed', true, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sparkpost', 'Marked message %s as unsubscribed', evt.campaign_id);
                        }
                        return processEvents();
                    });
                default:
                    return processEvents();
            }

        });
    };

    processEvents();
});

router.post('/sendgrid', (req, res, next) => {
    console.log(require('util').inspect(req.body, false, 22)); // eslint-disable-line

    let events = [].concat(req.body || []);
    let pos = 0;

    let processEvents = () => {
        if (pos >= events.length) {
            return res.json({
                success: true
            });
        }
        let evt = events[pos++];

        if (!evt) {
            return processEvents();
        }

        getMessage(evt.campaign_id, (err, message) => {
            if (err) {
                return next(err);
            }

            if (!message) {
                return processEvents();
            }

            switch (evt.event) {
                case 'bounce':
                    // https://support.sparkpost.com/customer/portal/articles/1929896
                    return updateMessage(message, 'bounced', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sendgrid', 'Marked message %s as bounced', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'spamreport':
                    return updateMessage(message, 'complained', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sendgrid', 'Marked message %s as complaint', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'group_unsubscribe':
                case 'unsubscribe':
                    return updateMessage(message, 'unsubscribed', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err.stack);
                        } else if (updated) {
                            log.verbose('Sendgrid', 'Marked message %s as unsubscribed', evt.campaign_id);
                        }
                        return processEvents();
                    });
                default:
                    return processEvents();
            }

        });
    };

    processEvents();
});

router.post('/mailgun', uploads.any(), (req, res) => {
    let evt = req.body;
    getMessage([].concat(evt && evt.campaign_id || []).shift(), (err, message) => {
        if (err || !message) {
            return;
        }

        switch (evt.event) {
            case 'bounced':
                return updateMessage(message, 'bounced', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err.stack);
                    } else if (updated) {
                        log.verbose('Mailgun', 'Marked message %s as bounced', evt.campaign_id);
                    }
                });
            case 'complained':
                return updateMessage(message, 'complained', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err.stack);
                    } else if (updated) {
                        log.verbose('Mailgun', 'Marked message %s as complaint', evt.campaign_id);
                    }
                });
            case 'unsubscribed':
                return updateMessage(message, 'unsubscribed', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err.stack);
                    } else if (updated) {
                        log.verbose('Mailgun', 'Marked message %s as unsubscribed', evt.campaign_id);
                    }
                });
        }

    });

    return res.json({
        success: true
    });
});

module.exports = router;

function getMessage(messageHeader, callback) {
    if (!messageHeader) {
        return callback(null, false);
    }

    let parts = messageHeader.split('.');
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
}

function updateMessage(message, status, updateSubscription, callback) {
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
}
