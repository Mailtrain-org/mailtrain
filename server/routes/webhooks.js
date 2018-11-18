'use strict';

const router = require('../lib/router-async').create();
const request = require('request-promise');
const campaigns = require('../models/campaigns');
const sendConfigurations = require('../models/send-configurations');
const contextHelpers = require('../lib/context-helpers');
const {SubscriptionStatus} = require('../../shared/lists');
const {MailerType} = require('../../shared/send-configurations');
const log = require('../lib/log');
const multer = require('multer');
const uploads = multer();


router.postAsync('/aws', async (req, res) => {
    if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
    }

    switch (req.body.Type) {

        case 'SubscriptionConfirmation':
            if (req.body.SubscribeURL) {
                await request(req.body.SubscribeURL);
                break;
            } else {
                const err = new Error('SubscribeURL not set');
                err.status = 400;
                throw err;
            }

        case 'Notification':
            if (req.body.Message) {
                if (typeof req.body.Message === 'string') {
                    req.body.Message = JSON.parse(req.body.Message);
                }

                if (req.body.Message.mail && req.body.Message.mail.messageId) {
                    const message = await campaigns.getMessageByResponseId(req.body.Message.mail.messageId);

                    if (!message) {
                        return;
                    }

                    switch (req.body.Message.notificationType) {
                        case 'Bounce':
                            await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.BOUNCED, req.body.Message.bounce.bounceType === 'Permanent');
                            log.verbose('AWS', 'Marked message %s as bounced', req.body.Message.mail.messageId);
                            break;

                        case 'Complaint':
                            if (req.body.Message.complaint) {
                                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.COMPLAINED, true);
                                log.verbose('AWS', 'Marked message %s as complaint', req.body.Message.mail.messageId);
                            }
                            break;
                    }
                }
            }
            break;
    }

    res.json({
        success: true
    });
});


router.postAsync('/sparkpost', async (req, res) => {
    const events = [].concat(req.body || []); // This is just a cryptic way getting an array regardless whether req.body is empty, one item, or array

    for (const curEvent of events) {
        let msys = curEvent && curEvent.msys;
        let evt;

        if (msys && msys.message_event) {
            evt = msys.message_event;
        } else if (msys && msys.unsubscribe_event) {
            evt = msys.unsubscribe_event;
        } else {
            continue;
        }

        const message = await campaigns.getMessageByCid(evt.campaign_id);
        if (!message) {
            continue;
        }

        switch (evt.type) {
            case 'bounce':
                // https://support.sparkpost.com/customer/portal/articles/1929896
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.BOUNCED, [1, 10, 25, 30, 50].indexOf(Number(evt.bounce_class)) >= 0);
                log.verbose('Sparkpost', 'Marked message %s as bounced', evt.campaign_id);
                break;

            case 'spam_complaint':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.COMPLAINED, true);
                log.verbose('Sparkpost', 'Marked message %s as complaint', evt.campaign_id);
                break;

            case 'link_unsubscribe':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.UNSUBSCRIBED, true);
                log.verbose('Sparkpost', 'Marked message %s as unsubscribed', evt.campaign_id);
                break;
        }
    }

    return res.json({
        success: true
    });
});


router.postAsync('/sendgrid', async (req, res) => {
    let events = [].concat(req.body || []);

    for (const evt of events) {
        if (!evt) {
            continue;
        }

        const message = await campaigns.getMessageByCid(evt.campaign_id);
        if (!message) {
            continue;
        }

        switch (evt.event) {
            case 'bounce':
                // https://support.sparkpost.com/customer/portal/articles/1929896
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.BOUNCED, true);
                log.verbose('Sendgrid', 'Marked message %s as bounced', evt.campaign_id);
                break;

            case 'spamreport':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.COMPLAINED, true);
                log.verbose('Sendgrid', 'Marked message %s as complaint', evt.campaign_id);
                break;

            case 'group_unsubscribe':
            case 'unsubscribe':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.UNSUBSCRIBED, true);
                log.verbose('Sendgrid', 'Marked message %s as unsubscribed', evt.campaign_id);
                break;
        }
    }

    return res.json({
        success: true
    });
});


router.postAsync('/mailgun', uploads.any(), async (req, res) => {
    const evt = req.body;

    const message = await campaigns.getMessageByCid([].concat(evt && evt.campaign_id || []).shift());
    if (message) {
        switch (evt.event) {
            case 'bounced':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.BOUNCED, true);
                log.verbose('Mailgun', 'Marked message %s as bounced', evt.campaign_id);
                break;

            case 'complained':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.COMPLAINED, true);
                log.verbose('Mailgun', 'Marked message %s as complaint', evt.campaign_id);
                break;

            case 'unsubscribed':
                await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.UNSUBSCRIBED, true);
                log.verbose('Mailgun', 'Marked message %s as unsubscribed', evt.campaign_id);
                break;
        }
    }

    return res.json({
        success: true
    });
});


router.postAsync('/zone-mta', async (req, res) => {
    if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
    }

    if (req.body.id) {
        const message = await campaigns.getMessageByCid(req.body.id);

        if (message) {
            await campaigns.changeStatusByMessage(contextHelpers.getAdminContext(), message, SubscriptionStatus.BOUNCED, true);
            log.verbose('ZoneMTA', 'Marked message %s as bounced', req.body.id);
        }
    }

    res.json({
        success: true
    });
});


router.postAsync('/zone-mta/sender-config/:sendConfigurationCid', async (req, res) => {
    if (!req.query.api_token) {
        return res.json({
            error: 'api_token value not set'
        });
    }

    const sendConfiguration = await sendConfigurations.getByCid(contextHelpers.getAdminContext(), req.params.sendConfigurationCid, false, true);

    if (sendConfiguration.mailer_type !== MailerType.ZONE_MTA || sendConfiguration.mailer_settings.dkimApiKey !== req.query.api_token) {
        return res.json({
            error: 'invalid api_token value'
        });
    }

    const dkimDomain = sendConfiguration.mailer_settings.dkimDomain;
    const dkimSelector = (sendConfiguration.mailer_settings.dkimSelector || '').trim();
    const dkimPrivateKey = (sendConfiguration.mailer_settings.dkimPrivateKey || '').trim();

    if (!dkimSelector || !dkimPrivateKey) {
        // empty response
        return res.json({});
    }

    const from = (req.body.from || '').trim();
    const domain = from.split('@').pop().toLowerCase().trim();

    res.json({
        dkim: {
            keys: [{
                domainName: dkimDomain || domain,
                keySelector: dkimSelector,
                privateKey: dkimPrivateKey
            }]
        }
    });
});

module.exports = router;
