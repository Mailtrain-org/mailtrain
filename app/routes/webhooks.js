'use strict';

let express = require('express');
let router = new express.Router();
let request = require('request');
let campaigns = require('../lib/models/campaigns');
let settings = require('../lib/models/settings');
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
                    campaigns.findMailByResponse(req.body.Message.mail.messageId, (err, message) => {
                        if (err || !message) {
                            return;
                        }

                        switch (req.body.Message.notificationType) {
                            case 'Bounce':
                                campaigns.updateMessage(message, 'bounced', req.body.Message.bounce.bounceType === 'Permanent', (err, updated) => {
                                    if (err) {
                                        log.error('AWS', 'Failed updating message: %s', err);
                                    } else if (updated) {
                                        log.verbose('AWS', 'Marked message %s as bounced', req.body.Message.mail.messageId);
                                    }
                                });
                                break;
                            case 'Complaint':
                                if (req.body.Message.complaint) {
                                    campaigns.updateMessage(message, 'complained', true, (err, updated) => {
                                        if (err) {
                                            log.error('AWS', 'Failed updating message: %s', err);
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

        campaigns.findMailByCampaign(evt.campaign_id, (err, message) => {
            if (err) {
                return next(err);
            }

            if (!message) {
                return processEvents();
            }

            switch (evt.type) {
                case 'bounce':
                    // https://support.sparkpost.com/customer/portal/articles/1929896
                    return campaigns.updateMessage(message, 'bounced', [1, 10, 25, 30, 50].indexOf(Number(evt.bounce_class)) >= 0, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err);
                        } else if (updated) {
                            log.verbose('Sparkpost', 'Marked message %s as bounced', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'spam_complaint':
                    return campaigns.updateMessage(message, 'complained', true, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err);
                        } else if (updated) {
                            log.verbose('Sparkpost', 'Marked message %s as complaint', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'link_unsubscribe':
                    return campaigns.updateMessage(message, 'unsubscribed', true, (err, updated) => {
                        if (err) {
                            log.error('Sparkpost', 'Failed updating message: %s', err);
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

        campaigns.findMailByCampaign(evt.campaign_id, (err, message) => {
            if (err) {
                return next(err);
            }

            if (!message) {
                return processEvents();
            }

            switch (evt.event) {
                case 'bounce':
                    // https://support.sparkpost.com/customer/portal/articles/1929896
                    return campaigns.updateMessage(message, 'bounced', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err);
                        } else if (updated) {
                            log.verbose('Sendgrid', 'Marked message %s as bounced', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'spamreport':
                    return campaigns.updateMessage(message, 'complained', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err);
                        } else if (updated) {
                            log.verbose('Sendgrid', 'Marked message %s as complaint', evt.campaign_id);
                        }
                        return processEvents();
                    });
                case 'group_unsubscribe':
                case 'unsubscribe':
                    return campaigns.updateMessage(message, 'unsubscribed', true, (err, updated) => {
                        if (err) {
                            log.error('Sendgrid', 'Failed updating message: %s', err);
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
    campaigns.findMailByCampaign([].concat(evt && evt.campaign_id || []).shift(), (err, message) => {
        if (err || !message) {
            return;
        }

        switch (evt.event) {
            case 'bounced':
                return campaigns.updateMessage(message, 'bounced', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err);
                    } else if (updated) {
                        log.verbose('Mailgun', 'Marked message %s as bounced', evt.campaign_id);
                    }
                });
            case 'complained':
                return campaigns.updateMessage(message, 'complained', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err);
                    } else if (updated) {
                        log.verbose('Mailgun', 'Marked message %s as complaint', evt.campaign_id);
                    }
                });
            case 'unsubscribed':
                return campaigns.updateMessage(message, 'unsubscribed', true, (err, updated) => {
                    if (err) {
                        log.error('Mailgun', 'Failed updating message: %s', err);
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

router.post('/zone-mta', (req, res, next) => {
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (E) {
            return next(new Error('Could not parse input'));
        }
    }

    if (req.body.id) {
        campaigns.findMailByResponse(req.body.id, (err, message) => {
            if (err || !message) {
                return;
            }
            campaigns.updateMessage(message, 'bounced', true, (err, updated) => {
                if (err) {
                    log.error('ZoneMTA', 'Failed updating message: %s', err);
                } else if (updated) {
                    log.verbose('ZoneMTA', 'Marked message %s as bounced', req.body.id);
                }
            });
        });
    }

    res.json({
        success: true
    });
});

router.post('/zone-mta/sender-config', (req, res) => {
    if (!req.query.api_token) {
        return res.json({
            error: 'api_token value not set'
        });
    }
    settings.list(['dkim_api_key', 'dkim_private_key', 'dkim_selector', 'dkim_domain'], (err, configItems) => {
        if (err) {
            return res.json({
                error: err.message
            });
        }

        if (configItems.dkimApiKey !== req.query.api_token) {
            return res.json({
                error: 'invalid api_token value'
            });
        }

        configItems.dkimSelector = (configItems.dkimSelector || '').trim();
        configItems.dkimPrivateKey = (configItems.dkimPrivateKey || '').trim();

        if (!configItems.dkimSelector || !configItems.dkimPrivateKey) {
            // empty response
            return res.json({});
        }

        let from = (req.body.from || '').trim();
        let domain = from.split('@').pop().toLowerCase().trim();

        res.json({
            dkim: {
                keys: {
                    domainName: configItems.dkimDomain || domain,
                    keySelector: configItems.dkimSelector,
                    privateKey: configItems.dkimPrivateKey
                }
            }
        });
    });
});

module.exports = router;
