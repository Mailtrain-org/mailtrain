'use strict';

const config = require('config');
const log = require('npmlog');
const mailers = require('../lib/mailers');
const knex = require('../lib/knex');
const subscriptions = require('../models/subscriptions');
const contextHelpers = require('../lib/context-helpers');
const campaigns = require('../models/campaigns');
const templates = require('../models/templates');
const lists = require('../models/lists');
const fields = require('../models/fields');
const sendConfigurations = require('../models/send-configurations');
const links = require('../models/links');
const {CampaignSource} = require('../shared/campaigns');
const {SubscriptionStatus} = require('../shared/lists');
const tools = require('../lib/tools');
const request = require('request-promise');
const files = require('../models/files');
const htmlToText = require('html-to-text');
const {getPublicUrl} = require('../lib/urls');
const blacklist = require('../models/blacklist');
let libmime = require('libmime');

const workerId = Number.parseInt(process.argv[2]);
let running = false;

class CampaignSender {
    constructor(campaignId) {
        this.campaignId = campaignId;
    }

    async init() {
        this.lists = Map(); // listId -> list
        this.listsFieldsGrouped = Map(); // listId -> fieldsGrouped
        this.attachments = [];

        await knex.transaction(async tx => {
            this.campaign = await campaigns.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaignId, false, campaigns.Content.ALL)
            this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), campaign.send_configuration);

            for (const listSpec of campaign.lists) {
                this.lists.set(listSpec.list) = await lists.getByIdTx(tx, contextHelpers.getAdminContext(), listSpec.list);
                this.listsFieldsGrouped.set(listSpec.list) = await fields.listGroupedTx(tx, listSpec.list);
            }

            if (campaign.source === CampaignSource.TEMPLATE) {
                this.template = templates.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaign.data.sourceTemplate, false);
            }

            const attachments = await files.listTx(tx, contextHelpers.getAdminContext(), 'campaign', 'attachment', this.campaignId);
            for (const attachment of attachments) {
                this.attachments.push({
                    filename: attachment.originalname,
                    path: files.getFilePath('campaign', 'attachment', this.campaignId, attachment.filename)
                });
            }

        });

        this.useVerp = config.verp.enabled && sendConfiguration.verp_hostname;
        this.useVerpSenderHeader = useVerp && config.verp.disablesenderheader !== true;
    }

    async sendMessage(listId, email) {
        if (await blacklist.isBlacklisted(email)) {
            return;
        }

        const subscriptionGrouped = await subscriptions.getByEmail(contextHelpers.getAdminContext(), listId, email);
        console.log(subscriptionGrouped);

        const flds = this.listsFieldsGrouped.get(listId);
        const campaign = this.campaign;
        const list = this.lists.get(listId);
        const sendConfiguration = this.sendConfiguration;

        const encryptionKeys = [];
        const mergeTags = fields.forHbsWithFieldsGrouped(flds, subscriptionGrouped);
        for (const fld of flds) {
            if (fld.type === 'gpg' && mergeTags[fld.key]) {
                encryptionKeys.push(mergeTags[fld.key].trim());
            }
        }

        let html = '';
        let text = '';
        let renderTags = false;

        if (campaign.source === CampaignSource.URL) {
            const form = tools.getMessageLinks(campaign, list, subscriptionGrouped);
            for (const key in mergeTags) {
                form[key] = mergeTags[key];
            }

            const response = await request.post({
                uri: campaign.sourceUrl,
                form,
                resolveWithFullResponse: true
            });

            if (response.statusCode !== 200) {
                throw new Error(`Received status code ${httpResponse.statusCode} from ${campaign.sourceUrl}`);
            }

            html = response.body;
            text = '';
            renderTags = false;

        } else if (campaign.source === CampaignSource.CUSTOM || campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN || campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE) {
            html = campaign.data.sourceCustom.html;
            text = campaign.data.sourceCustom.text;
            renderTags = true;

        } else if (campaign.source === CampaignSource.TEMPLATE) {
            const template = this.template;
            html = template.html;
            text = template.text;
            renderTags = true;
        }

        html = await links.updateLinks(campaign, list, subscriptionGrouped, html);

        const attachments = this.attachments.slice();
        // replace data: images with embedded attachments
        html = html.replace(/(<img\b[^>]* src\s*=[\s"']*)(data:[^"'>\s]+)/gi, (match, prefix, dataUri) => {
            let cid = shortid.generate() + '-attachments@' + campaign.address.split('@').pop();
            attachments.push({
                path: dataUri,
                cid
            });
            return prefix + 'cid:' + cid;
        });

        const campaignAddress = [campaign.cid, list.cid, subscriptionGrouped.cid].join('.');

        const renderedHtml = renderTags ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, html, false, true) : html;

        const renderedText = (text || '').trim()
            ? (renderTags ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, text) : text)
            : htmlToText.fromString(renderedHtml, {wordwrap: 130});

        let listUnsubscribe = null;
        if (!list.listunsubscribe_disabled) {
            listUnsubscribe = campaign.unsubscribe_url
                ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, campaign.unsubscribe_url)
                : getPublicUrl('/subscription/' + list.cid + '/unsubscribe/' + subscriptionGrouped.subscription.cid);
        }

        const mailer = await mailers.getOrCreateMailer(sendConfiguration.id);

        await mailer.throttleWait();

        const getOverridable = key => {
            if (sendConfiguration[key + '_overridable'] && this.campaign[key + '_override'] !== null) {
                return campaign[key + '_override'];
            } else {
                return sendConfiguration[key];
            }
        }

        const mail = {
            from: {
                name: getOverridable('from_name'),
                address: getOverridable('from_email')
            },
            replyTo: getOverridable('reply_to'),
            xMailer: sendConfiguration.x_mailer ? sendConfiguration.x_mailer : false,
            to: {
                name: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, list.to_name, false, false),
                address: subscriptionGrouped.email
            },
            sender: this.useVerpSenderHeader ? campaignAddress + '@' + sendConfiguration.verp_hostname : false,

            envelope: this.useVerp ? {
                from: campaignAddress + '@' + sendConfiguration.verp_hostname,
                to: subscriptionGrouped.email
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
                    value: libmime.encodeWords(list.name) + ' <' + list.cid + '.' + getPublicUrl() + '>'
                }
            },
            list: {
                unsubscribe: listUnsubscribe
            },
            subject: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, getOverridable('subject'), false, false),
            html: renderedHtml,
            text: renderedText,

            attachments,
            encryptionKeys
        };


        let status;
        let response;
        try {
            const info = await mailer.sendMassMail(mail);
            status = SubscriptionStatus.SUBSCRIBED;
            response = info.response || info.messageId;

            await knex('campaigns').where('id', campaign.id).increment('delivered');
        } catch (err) {
            status = SubscriptionStatus.BOUNCED;
            response = err.response || err.message;
            await knex('campaigns').where('id', campaign.id).increment('delivered').increment('bounced');
        }

        const responseId = response.split(/\s+/).pop();

        const now = new Date();
        await knex('campaign_messages').insert({
            campaign: this.campaignId,
            list: listId,
            subscriptions: subscriptionGrouped.id,
            send_configuration: sendConfiguration.id,
            status,
            response,
            response_id: responseId,
            updated: now
        });

        log.verbose('Senders', 'Message sent and status updated for %s', subscriptionGrouped.cid);
    }
}


async function processMessages(campaignId, subscribers) {
    if (running) {
        log.error('Senders', `Worker ${workerId} assigned work while working`);
        return;
    }

    running = true;

    const cs = new CampaignSender(campaignId);
    await cs.init()

    for (const subData of subscribers) {
        try {
            await cs.sendMessage(subData.listId, subData.email);
        } catch (err) {
            log.error('Senders', `Sending message to ${subData.listId}:${subData.email} failed with error: ${err.message}`)
        }
    }

    running = false;

    sendToMaster('messages-processed');
}

function sendToMaster(msgType) {
    process.send({
        type: msgType
    });
}

process.on('message', msg => {
    if (msg) {
        const type = msg.type;

        if (type === 'reload-config') {
            mailers.invalidateMailer(msg.data.sendConfigurationId);

        } else if (type === 'process-messages') {
            // noinspection JSIgnoredPromiseFromCall
            processMessages(msg.data.campaignId, msg.data.subscribers)
        }

    }
});

sendToMaster('worker-started');


