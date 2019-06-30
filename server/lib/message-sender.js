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
const htmlToText = require('html-to-text');
const request = require('request-promise');
const files = require('../models/files');
const {getPublicUrl} = require('./urls');
const blacklist = require('../models/blacklist');
const libmime = require('libmime');
const { enforce } = require('./helpers');
const senders = require('./senders');

const MessageType = {
    REGULAR: 0,
    TRIGGERED: 1,
    TEST: 2,
    SUBSCRIPTION: 3
};

class MessageSender {
    constructor() {
    }

    /*
        settings is one of:
        - campaignCid / campaignId
        or
        - sendConfiguration, listId, attachments, html, text, subject
     */
    async _init(settings) {
        this.type = settings.type;

        this.listsById = new Map(); // listId -> list
        this.listsByCid = new Map(); // listCid -> list
        this.listsFieldsGrouped = new Map(); // listId -> fieldsGrouped

        await knex.transaction(async tx => {
            if (settings.campaignCid) {
                this.campaign = await campaigns.rawGetByTx(tx, 'cid', settings.campaignCid);
                this.isMassMail = true;

            } else if (settings.campaignId) {
                this.campaign = await campaigns.rawGetByTx(tx, 'id', settings.campaignId);
                this.isMassMail = true;

            } else if (this.type === MessageType.TEST) {
                // We are not within scope of a campaign (i.e. templates in MessageType.TEST message)
                // This is to fake the campaign for getMessageLinks, which is called inside formatMessage
                this.campaign = {
                    cid: '[CAMPAIGN_ID]',
                    from_name_override: null,
                    from_email_override: null,
                    reply_to_override: null
                };
                this.isMassMail = true;

            } else {
                this.isMassMail = false;
            }

            if (settings.sendConfigurationId) {
                this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), settings.sendConfigurationId, false, true);
            } else if (this.campaign && this.campaign.send_configuration) {
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

            } else if (this.campaign && this.campaign.lists) {
                for (const listSpec of this.campaign.lists) {
                    const list = await lists.getByIdTx(tx, contextHelpers.getAdminContext(), listSpec.list);
                    this.listsById.set(list.id, list);
                    this.listsByCid.set(list.cid, list);
                    this.listsFieldsGrouped.set(list.id, await fields.listGroupedTx(tx, list.id));
                }
            }

            if (settings.attachments) {
                this.attachments = settings.attachments;

            } else if (this.campaign && this.campaign.id) {
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

            if (settings.renderedHtml !== undefined) {
                this.renderedHtml = settings.renderedHtml;
                this.renderedText = settings.renderedText;

            } else if (settings.html !== undefined) {
                this.html = settings.html;
                this.text = settings.text;

            } else if (this.campaign && this.campaign.source === CampaignSource.TEMPLATE) {
                this.template = await templates.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaign.data.sourceTemplate, false);
            }

            if (settings.subject !== undefined) {
                this.subject = settings.subject;
            } else if (this.campaign && this.campaign.subject !== undefined) {
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

        } else if (campaign) {
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
        await this._init({type: MessageType.REGULAR, campaignCid});
    }

    async initByCampaignId(campaignId) {
        await this._init({type: MessageType.REGULAR, campaignId});
    }

    async getMessage(listCid, subscriptionCid) {
        enforce(this.type === MessageType.REGULAR);

        const list = this.listsByCid.get(listCid);
        const subscriptionGrouped = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, subscriptionCid);
        const flds = this.listsFieldsGrouped.get(list.id);
        const campaign = this.campaign;
        const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags(campaign));

        return await this._getMessage(list, subscriptionGrouped, mergeTags, false);
    }


    /*
        subData is one of:
        - subscriptionId, listId, attachments
        or
        - email, listId
        or
        - to, subject
     */
    async _sendMessage(subData) {
        let msgType = this.type;
        let to, email;
        let envelope = false;
        let sender = false;
        let headers = {};
        let listHeader = false;
        let encryptionKeys = [];
        let subject;
        let message;

        let subscriptionGrouped, list; // May be undefined
        const campaign = this.campaign; // May be undefined

        if (subData.listId) {
            let listId;
            subscriptionGrouped;

            if (subData.subscriptionId) {
                listId = subData.listId;
                subscriptionGrouped = await subscriptions.getById(contextHelpers.getAdminContext(), listId, subData.subscriptionId);

            } else if (subData.email) {
                listId = subData.listId;
                subscriptionGrouped = await subscriptions.getByEmail(contextHelpers.getAdminContext(), listId, subData.email);
            }

            list = this.listsById.get(listId);
            email = subscriptionGrouped.email;

            const flds = this.listsFieldsGrouped.get(list.id);
            const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags(campaign));

            for (const fld of flds) {
                if (fld.type === 'gpg' && mergeTags[fld.key]) {
                    encryptionKeys.push(mergeTags[fld.key].trim());
                }
            }

            message = await this._getMessage(list, subscriptionGrouped, mergeTags, true);

            const campaignAddress = [campaign.cid, list.cid, subscriptionGrouped.cid].join('.');

            let listUnsubscribe = null;
            if (!list.listunsubscribe_disabled) {
                listUnsubscribe = campaign.unsubscribe_url
                    ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, campaign.unsubscribe_url)
                    : getPublicUrl('/subscription/' + list.cid + '/unsubscribe/' + subscriptionGrouped.cid);
            }

            to = {
                name: list.to_name === null ? undefined : tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, list.to_name, false),
                address: subscriptionGrouped.email
            };

            subject = tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, this.subject, false);

            if (this.useVerp) {
                envelope = {
                    from: campaignAddress + '@' + sendConfiguration.verp_hostname,
                    to: subscriptionGrouped.email
                };
            }

            if (this.useVerpSenderHeader) {
                sender = campaignAddress + '@' + sendConfiguration.verp_hostname;
            }

            headers = {
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
            };

            listHeader = {
                unsubscribe: listUnsubscribe
            };

        } else if (subData.to) {
            to = subData.to;
            email = to.address;
            subject = this.subject;
            encryptionKeys = subData.encryptionKeys;
            message = await this._getMessage();
        }

        if (await blacklist.isBlacklisted(email)) {
            return;
        }

        const sendConfiguration = this.sendConfiguration;
        const mailer = await mailers.getOrCreateMailer(sendConfiguration.id);

        await mailer.throttleWait();

        const getOverridable = key => {
            if (campaign && sendConfiguration[key + '_overridable'] && this.campaign[key + '_override'] !== null) {
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
            to,
            sender,
            envelope,
            headers,
            list: listHeader,
            subject,
            html: message.html,
            text: message.text,
            attachments: message.attachments || [],
            encryptionKeys
        };


        let response;
        let responseId = null;

        const info = this.isMassMail ? await mailer.sendMassMail(mail) : await mailer.sendTransactionalMail(mail);

        log.verbose('MessageSender', `response: ${info.response}   messageId: ${info.messageId}`);

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


        const now = new Date();

        if (msgType === MessageType.REGULAR) {
            enforce(list);
            enforce(subscriptionGrouped);

            await knex('campaign_messages').insert({
                campaign: this.campaign.id,
                list: list.id,
                subscription: subscriptionGrouped.id,
                send_configuration: sendConfiguration.id,
                status: SubscriptionStatus.SUBSCRIBED,
                response,
                response_id: responseId,
                updated: now
            });

        } else if (msgType === MessageType.TRIGGERED || msgType === MessageType.TEST || msgType === MessageType.SUBSCRIPTION) {
            if (subData.attachments) {
                for (const attachment of subData.attachments) {
                    try {
                        // We ignore any errors here because we already sent the message. Thus we have to mark it as completed to avoid sending it again.
                        await knex.transaction(async tx => {
                            await files.unlockTx(tx, 'campaign', 'attachment', attachment.id);
                        });
                    } catch (err) {
                        log.error('MessageSender', `Error when unlocking attachment ${attachment.id} for ${email} (queuedId: ${subData.queuedId})`);
                        log.verbose(err.stack);
                    }
                }
            }

            await knex('queued')
                .where({id: subData.queuedId})
                .del();
        }
    }

    async sendRegularMessage(listId, email) {
        enforce(this.type === MessageType.REGULAR);

        await this._sendMessage({listId, email});
    }
}

async function dropQueuedMessage(queuedMessage) {
    await knex('queued')
        .where({id: queuedMessage.id})
        .del();
}

async function sendQueuedMessage(queuedMessage) {
    const msgData = queuedMessage.data;

    const cs = new MessageSender();
    await cs._init({
        type: queuedMessage.type,
        campaignId: msgData.campaignId,
        listId: msgData.listId,
        sendConfigurationId: queuedMessage.send_configuration,
        attachments: msgData.attachments,
        html: msgData.html,
        text: msgData.text,
        subject: msgData.subject,
        renderedHtml: msgData.renderedHtml,
        renderedText: msgData.renderedText
    });

    await cs._sendMessage({
        subscriptionId: msgData.subscriptionId,
        listId: msgData.listId,
        to: msgData.to,
        attachments: msgData.attachments,
        encryptionKeys: msgData.encryptionKeys,
        queuedId: queuedMessage.id
    });
}

async function queueCampaignMessageTx(tx, sendConfigurationId, listId, subscriptionId, messageType, messageData) {
    enforce(messageType === MessageType.TRIGGERED || messageType === MessageType.TEST);

    const msgData = {...messageData};

    if (msgData.attachments) {
        for (const attachment of messageData.attachments) {
            await files.lockTx(tx,'campaign', 'attachment', attachment.id);
        }
    }

    msgData.listId = listId;
    msgData.subscriptionId = subscriptionId;

    await tx('queued').insert({
        send_configuration: sendConfigurationId,
        type: messageType,
        data: JSON.stringify(msgData)
    });
}

async function queueSubscriptionMessage(sendConfigurationId, to, subject, encryptionKeys, template) {
    let html, text;

    const htmlRenderer = await tools.getTemplate(template.html, template.locale);
    if (htmlRenderer) {
        html = htmlRenderer(template.data || {});

        if (html) {
            html = await tools.prepareHtml(html);
        }
    }

    const textRenderer = await tools.getTemplate(template.text, template.locale);
    if (textRenderer) {
        text = textRenderer(template.data || {});
    } else if (html) {
        text = htmlToText.fromString(html, {
            wordwrap: 130
        });
    }

    const msgData = {
        renderedHtml: html,
        renderedText: text,
        to,
        subject,
        encryptionKeys
    };

    await knex('queued').insert({
        send_configuration: sendConfigurationId,
        type: MessageType.SUBSCRIPTION,
        data: JSON.stringify(msgData)
    });

    senders.scheduleCheck();
}

module.exports.MessageSender = MessageSender;
module.exports.MessageType = MessageType;
module.exports.sendQueuedMessage = sendQueuedMessage;
module.exports.queueCampaignMessageTx = queueCampaignMessageTx;
module.exports.queueSubscriptionMessage = queueSubscriptionMessage;
module.exports.dropQueuedMessage = dropQueuedMessage;