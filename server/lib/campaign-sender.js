'use strict';

const config = require('config');
const log = require('./log');
const mailers = require('./mailers');
const knex = require('./knex');
const subscriptions = require('../models/subscriptions');
const contextHelpers = require('./context-helpers');
const campaigns = require('../models/campaigns');
const templates = require('../models/templates');
const lists = require('../models/lists');
const fields = require('../models/fields');
const sendConfigurations = require('../models/send-configurations');
const links = require('../models/links');
const {CampaignSource, CampaignType} = require('../../shared/campaigns');
const {SubscriptionStatus} = require('../../shared/lists');
const tools = require('./tools');
const request = require('request-promise');
const files = require('../models/files');
const htmlToText = require('html-to-text');
const {getPublicUrl} = require('./urls');
const blacklist = require('../models/blacklist');
const libmime = require('libmime');
const { enforce } = require('./helpers');

const MessageType = {
    REGULAR: 0,
    TRIGGERED: 1,
    TEST: 2
};

class CampaignSender {
    constructor() {
    }

    /*
        settings is one of:
        - campaignCid / campaignId
        or
        - sendConfiguration, listId, attachments, html, text, subject
     */
    async _init(settings) {
        this.listsById = new Map(); // listId -> list
        this.listsByCid = new Map(); // listCid -> list
        this.listsFieldsGrouped = new Map(); // listId -> fieldsGrouped

        await knex.transaction(async tx => {
            if (settings.campaignCid) {
                this.campaign = await campaigns.rawGetByTx(tx, 'cid', settings.campaignCid);

            } else if (settings.campaignId) {
                this.campaign = await campaigns.rawGetByTx(tx, 'id', settings.campaignId);

            } else {
                // We are not within scope of a campaign (i.e. templates in MessageType.TEST message)
                // This is to fake the campaign for getMessageLinks, which is called inside formatMessage
                this.campaign = {
                    cid: '[CAMPAIGN_ID]',
                    from_name_override: null,
                    from_email_override: null,
                    reply_to_override: null
                };
            }

            if (settings.sendConfigurationId) {
                this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), settings.sendConfigurationId, false, true);
            } else if (this.campaign.send_configuration) {
                this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaign.send_configuration, false, true);
            } else {
                enforce(false);
            }

            this.useVerp = config.verp.enabled && this.sendConfiguration.verp_hostname;
            this.useVerpSenderHeader = this.useVerp && !this.sendConfiguration.verp_disable_sender_header;

            if (settings.listId) {
                const list = await lists.getByIdTx(tx, contextHelpers.getAdminContext(), settings.listId);
                this.listsById.set(list.id, list);
                this.listsByCid.set(list.cid, list);
                this.listsFieldsGrouped.set(list.id, await fields.listGroupedTx(tx, list.id));

            } else if (this.campaign.lists) {
                for (const listSpec of this.campaign.lists) {
                    const list = await lists.getByIdTx(tx, contextHelpers.getAdminContext(), listSpec.list);
                    this.listsById.set(list.id, list);
                    this.listsByCid.set(list.cid, list);
                    this.listsFieldsGrouped.set(list.id, await fields.listGroupedTx(tx, list.id));
                }

            } else {
                enforce(false);
            }

            if (settings.attachments) {
                this.attachments = settings.attachments;

            } else if (this.campaign.id) {
                const attachments = await files.listTx(tx, contextHelpers.getAdminContext(), 'campaign', 'attachment', this.campaign.id);

                this.attachments = [];
                for (const attachment of attachments) {
                    this.attachments.push({
                        filename: attachment.originalname,
                        path: files.getFilePath('campaign', 'attachment', this.campaign.id, attachment.filename)
                    });
                }

            } else {
                this.attachments = [];
            }

            if (settings.html !== undefined) {
                this.html = settings.html;
                this.text = settings.text;
            } else if (this.campaign.source === CampaignSource.TEMPLATE) {
                this.template = await templates.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaign.data.sourceTemplate, false);
            }

            if (settings.subject !== undefined) {
                this.subject = settings.subject;
            } else if (this.campaign.subject !== undefined) {
                this.subject = this.campaign.subject;
            } else {
                enforce(false);
            }
        });
    }

    async _getMessage(list, subscriptionGrouped, mergeTags, replaceDataImgs) {
        let html = '';
        let text = '';
        let renderTags = false;
        const campaign = this.campaign;

        if (this.renderedHtml !== undefined) {
            html = this.renderedHtml;
            text = this.renderedText;
            renderTags = false;

        } else if (this.html !== undefined) {
            html = this.html;
            text = this.text;
            renderTags = true;

        } else {
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

            html = await links.updateLinks(campaign, list, subscriptionGrouped, mergeTags, html);
        }

        const attachments = this.attachments.slice();
        if (replaceDataImgs) {
            // replace data: images with embedded attachments
            html = html.replace(/(<img\b[^>]* src\s*=[\s"']*)(data:[^"'>\s]+)/gi, (match, prefix, dataUri) => {
                const cid = shortid.generate() + '-attachments';
                attachments.push({
                    path: dataUri,
                    cid
                });
                return prefix + 'cid:' + cid;
            });
        }

        html = renderTags ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, html, true) : html;

        text = (text || '').trim()
            ? (renderTags ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, text) : text)
            : htmlToText.fromString(html, {wordwrap: 130});

        return {
            html,
            text,
            attachments
        };
    }

    _getExtraTags(campaign) {
        const tags = {};

        if (campaign.type === CampaignType.RSS_ENTRY) {
            const rssEntry = campaign.data.rssEntry;
            tags['RSS_ENTRY_TITLE'] = rssEntry.title;
            tags['RSS_ENTRY_DATE'] = rssEntry.date;
            tags['RSS_ENTRY_LINK'] = rssEntry.link;
            tags['RSS_ENTRY_CONTENT'] = rssEntry.content;
            tags['RSS_ENTRY_SUMMARY'] = rssEntry.summary;
            tags['RSS_ENTRY_IMAGE_URL'] = rssEntry.imageUrl;
            tags['RSS_ENTRY_CUSTOM_TAGS'] = rssEntry.customTags;
        }

        return tags;
    }

    async initByCampaignCid(campaignCid) {
        await this._init({campaignCid});
    }

    async initByCampaignId(campaignId) {
        await this._init({campaignId});
    }

    async getMessage(listCid, subscriptionCid) {
        const list = this.listsByCid.get(listCid);
        const subscriptionGrouped = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, subscriptionCid);
        const flds = this.listsFieldsGrouped.get(list.id);
        const campaign = this.campaign;
        const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags(campaign));

        return await this._getMessage(list, subscriptionGrouped, mergeTags, false);
    }


    /*
        subData is one of:
        - queuedMessage
        or
        - email, listId
     */
    async _sendMessage(subData) {
        let msgType;
        let subscriptionGrouped;
        let listId;

        if (subData.queuedMessage) {
            const queuedMessage = subData.queuedMessage;
            msgType = queuedMessage.type;
            listId = queuedMessage.list;
            subscriptionGrouped = await subscriptions.getById(contextHelpers.getAdminContext(), listId, queuedMessage.subscription);

        } else {
            enforce(subData.email);
            enforce(subData.listId);

            msgType = MessageType.REGULAR;
            listId = subData.listId;
            subscriptionGrouped = await subscriptions.getByEmail(contextHelpers.getAdminContext(), listId, subData.email);
        }

        const email = subscriptionGrouped.email;

        if (await blacklist.isBlacklisted(email)) {
            return;
        }

        const list = this.listsById.get(listId);
        const flds = this.listsFieldsGrouped.get(list.id);
        const campaign = this.campaign;

        const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags(campaign));

        const encryptionKeys = [];
        for (const fld of flds) {
            if (fld.type === 'gpg' && mergeTags[fld.key]) {
                encryptionKeys.push(mergeTags[fld.key].trim());
            }
        }

        const sendConfiguration = this.sendConfiguration;

        const {html, text, attachments} = await this._getMessage(list, subscriptionGrouped, mergeTags, true);

        const campaignAddress = [campaign.cid, list.cid, subscriptionGrouped.cid].join('.');

        let listUnsubscribe = null;
        if (!list.listunsubscribe_disabled) {
            listUnsubscribe = campaign.unsubscribe_url
                ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, campaign.unsubscribe_url)
                : getPublicUrl('/subscription/' + list.cid + '/unsubscribe/' + subscriptionGrouped.cid);
        }

        const mailer = await mailers.getOrCreateMailer(sendConfiguration.id);

        await mailer.throttleWait();

        const getOverridable = key => {
            if (sendConfiguration[key + '_overridable'] && this.campaign[key + '_override'] !== null) {
                return campaign[key + '_override'] || '';
            } else {
                return sendConfiguration[key] || '';
            }
        };

        const mail = {
            from: {
                name: getOverridable('from_name'),
                address: getOverridable('from_email')
            },
            replyTo: getOverridable('reply_to'),
            xMailer: sendConfiguration.x_mailer ? sendConfiguration.x_mailer : false,
            to: {
                name: list.to_name === null ? undefined : tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, list.to_name, false),
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
            subject: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, this.subject, false),
            html,
            text,

            attachments,
            encryptionKeys
        };


        let status;
        let response;
        let responseId = null;
        try {
            const info = await mailer.sendMassMail(mail);
            status = SubscriptionStatus.SUBSCRIBED;

            log.verbose('CampaignSender', `response: ${info.response}   messageId: ${info.messageId}`);

            let match;
            if ((match = info.response.match(/^250 Message queued as ([0-9a-f]+)$/))) {
                /*
                    ZoneMTA
                    info.response: 250 Message queued as 1691ad7f7ae00080fd
                    info.messageId: <e65c9386-e899-7d01-b21e-ec03c3a9d9b4@sathyasai.org>
                 */
                response = info.response;
                responseId = match[1];

            } else if ((match = info.messageId.match(/^<([^>@]*)@.*amazonses\.com>$/))) {
                /*
                    AWS SES
                    info.response: 0102016ad2244c0a-955492f2-9194-4cd1-bef9-70a45906a5a7-000000
                    info.messageId: <0102016ad2244c0a-955492f2-9194-4cd1-bef9-70a45906a5a7-000000@eu-west-1.amazonses.com>
                 */
                response = info.response;
                responseId = match[1];

            } else if (info.response.match(/^250 OK$/) && (match = info.messageId.match(/^<([^>]*)>$/))) {
                /*
                    Postal Mail Server
                    info.response: 250 OK
                    info.messageId:  <xxxxxxxxx@xxx.xx> (postal messageId)
                 */
                response = info.response;
                responseId = match[1];

            } else {
                /*
                    Fallback - Mailtrain v1 behavior
                 */
                response = info.response || info.messageId;
                responseId = response.split(/\s+/).pop();
            }


            if (msgType === MessageType.REGULAR || msgType === MessageType.TRIGGERED) {
                await knex('campaigns').where('id', campaign.id).increment('delivered');
            }
        } catch (err) {
            console.log(err);

            /*
            { Error: connect ECONNREFUSED 127.0.0.1:55871
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1097:14)
  cause:
   { Error: connect ECONNREFUSED 127.0.0.1:55871
       at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1097:14)
     stack:
      'Error: connect ECONNREFUSED 127.0.0.1:55871\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1097:14)',
     errno: 'ECONNREFUSED',
     code: 'ECONNECTION',
     syscall: 'connect',
     address: '127.0.0.1',
     port: 55871,
     command: 'CONN' },
  isOperational: true,
  errno: 'ECONNREFUSED',
  code: 'ECONNECTION',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 55871,
  command: 'CONN' }

             */

            status = SubscriptionStatus.BOUNCED;
            response = err.response || err.message;
            if (msgType === MessageType.REGULAR || msgType === MessageType.TRIGGERED) {
                await knex('campaigns').where('id', campaign.id).increment('delivered').increment('bounced');
            }
        }


        const now = new Date();

        if (msgType === MessageType.REGULAR) {
            await knex('campaign_messages').insert({
                campaign: this.campaign.id,
                list: list.id,
                subscription: subscriptionGrouped.id,
                send_configuration: sendConfiguration.id,
                status,
                response,
                response_id: responseId,
                updated: now
            });

        } else if (msgType === MessageType.TRIGGERED || msgType === MessageType.TEST) {
            if (subData.queuedMessage.data.attachments) {
                for (const attachment of subData.queuedMessage.data.attachments) {
                    try {
                        // We ignore any errors here because we already sent the message. Thus we have to mark it as completed to avoid sending it again.
                        await knex.transaction(async tx => {
                            await files.unlockTx(tx, 'campaign', 'attachment', attachment.id);
                        });
                    } catch (err) {
                        log.error('CampaignSender', `Error when unlocking attachment ${attachment.id} for ${listId}:${subscriptionGrouped.email} (queuedId: ${subData.queuedMessage.id})`);
                        log.verbose(err.stack);
                    }
                }
            }

            await knex('queued')
                .where({id: subData.queuedMessage.id})
                .del();
        }
    }

    async sendRegularMessage(listId, email) {
        await this._sendMessage({listId, email});
    }
}

CampaignSender.sendQueuedMessage = async (queuedMessage) => {
    const msgData = queuedMessage.data;

    const cs = new CampaignSender();
    await cs._init({
        campaignId: msgData.campaignId,
        listId: queuedMessage.list,
        sendConfigurationId: queuedMessage.send_configuration,
        attachments: msgData.attachments,
        html: msgData.html,
        text: msgData.text,
        subject: msgData.subject
    });

    await cs._sendMessage({queuedMessage});
};

CampaignSender.queueMessageTx = async (tx, sendConfigurationId, listId, subscriptionId, messageType, messageData) => {
    if (messageData.attachments) {
        for (const attachment of messageData.attachments) {
            await files.lockTx(tx,'campaign', 'attachment', attachment.id);
        }
    }

    await tx('queued').insert({
        send_configuration: sendConfigurationId,
        list: listId,
        subscription: subscriptionId,
        type: messageType,
        data: JSON.stringify(messageData)
    });
};

module.exports.CampaignSender = CampaignSender;
module.exports.MessageType = MessageType;