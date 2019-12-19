'use strict';

const config = require('./config');
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
const {toNameTagLangauge} = require('../../shared/lists');
const {CampaignMessageStatus, CampaignMessageErrorType} = require('../../shared/campaigns');
const tools = require('./tools');
const htmlToText = require('html-to-text');
const request = require('request-promise');
const files = require('../models/files');
const {getPublicUrl} = require('./urls');
const blacklist = require('../models/blacklist');
const libmime = require('libmime');
const { enforce, hashEmail } = require('./helpers');
const senders = require('./senders');

const MessageType = {
    REGULAR: 0,
    TRIGGERED: 1,
    TEST: 2,
    SUBSCRIPTION: 3,
    API_TRANSACTIONAL: 4

};

class MessageSender {
    constructor() {
    }

    /*
        Accepted combinations of settings:

        Option #1
        - settings.type in [MessageType.REGULAR, MessageType.TRIGGERED, MessageType.TEST]
        - campaign / campaignCid / campaignId
        - listId / listCid [optional if campaign is provided]
        - sendConfigurationId [optional if campaign is provided]
        - attachments [optional]
        - renderedHtml + renderedText / html + text + tagLanguage [optional if campaign is provided]
        - subject [optional if campaign is provided]

        Option #2
        - settings.type in [MessageType.SUBSCRIPTION, MessageType.API_TRANSACTIONAL]
        - sendConfigurationId
        - attachments [optional]
        - renderedHtml + renderedText / html + text + tagLanguage
        - subject
     */
    async _init(settings) {
        this.type = settings.type;

        this.listsById = new Map(); // listId -> list
        this.listsByCid = new Map(); // listCid -> list
        this.listsFieldsGrouped = new Map(); // listId -> fieldsGrouped

        await knex.transaction(async tx => {
            if (this.type === MessageType.REGULAR || this.type === MessageType.TRIGGERED || this.type === MessageType.TEST) {
                this.isMassMail = true;

                if (settings.campaign) {
                    this.campaign = settings.campaign;
                } else if (settings.campaignCid) {
                    this.campaign = await campaigns.rawGetByTx(tx, 'cid', settings.campaignCid);
                } else if (settings.campaignId) {
                    this.campaign = await campaigns.rawGetByTx(tx, 'id', settings.campaignId);
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

                } else if (settings.listCid) {
                    const list = await lists.getByCidTx(tx, contextHelpers.getAdminContext(), settings.listCid);
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

            } else if (this.type === MessageType.SUBSCRIPTION || this.type === MessageType.API_TRANSACTIONAL) {
                this.isMassMail = false;
                this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), settings.sendConfigurationId, false, true);

            } else {
                enforce(false);
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
                this.tagLanguage = settings.tagLanguage;

            } else if (this.campaign && this.campaign.source === CampaignSource.TEMPLATE) {
                this.template = await templates.getByIdTx(tx, contextHelpers.getAdminContext(), this.campaign.data.sourceTemplate, false);
                this.html = this.template.html;
                this.text = this.template.text;
                this.tagLanguage = this.template.tag_language;

            } else if (this.campaign && (this.campaign.source === CampaignSource.CUSTOM || this.campaign.source === CampaignSource.CUSTOM_FROM_TEMPLATE || this.campaign.source === CampaignSource.CUSTOM_FROM_CAMPAIGN)) {
                this.html = this.campaign.data.sourceCustom.html;
                this.text = this.campaign.data.sourceCustom.text;
                this.tagLanguage = this.campaign.data.sourceCustom.tag_language;
            }

            if (settings.rssEntry !== undefined) {
                this.rssEntry = settings.rssEntry;
            } else if (this.campaign && this.campaign.data.rssEntry) {
                this.rssEntry = this.campaign.data.rssEntry;
            }

            enforce(this.renderedHtml || (this.campaign && this.campaign.source === CampaignSource.URL) || this.tagLanguage);

            if (settings.subject !== undefined) {
                this.subject = settings.subject;
            } else if (this.campaign && this.campaign.subject !== undefined) {
                this.subject = this.campaign.subject;
            } else {
                enforce(false);
            }
        });
    }

    async _getMessage(mergeTags, list, subscriptionGrouped, replaceDataImgs) {
        let html = '';
        let text = '';
        let renderTags = false;
        const campaign = this.campaign;


        if (this.renderedHtml !== undefined) {
            html = this.renderedHtml;
            text = this.renderedText;
            renderTags = false;

        } else if (this.html !== undefined) {
            enforce(mergeTags);

            html = this.html;
            text = this.text;
            renderTags = true;

        } else if (campaign && campaign.source === CampaignSource.URL) {
            const form = tools.getMessageLinks(campaign, list, subscriptionGrouped);
            for (const key in mergeTags) {
                form[key] = mergeTags[key];
            }

            const sourceUrl = campaign.data.sourceUrl;

            let response;
            try {
                response = await request.post({
                    uri: sourceUrl,
                    form,
                    resolveWithFullResponse: true
                });
            } catch (exc) {
                log.error('MessageSender', `Error pulling content from URL (${sourceUrl})`);
                response = {statusCode: exc.message};
            }

            if (response.statusCode !== 200) {
                const statusError = new Error(`Received status code ${response.statusCode} from ${sourceUrl}`);
                if (response.statusCode >= 500) {
                  statusError.campaignMessageErrorType = CampaignMessageErrorType.TRANSIENT;
                } else {
                  statusError.campaignMessageErrorType = CampaignMessageErrorType.PERMANENT;
                }
                throw statusError;
            }

            html = response.body;
            text = '';
            renderTags = false;
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


        if (renderTags) {
            if (this.campaign) {
                html = await links.updateLinks(html, this.tagLanguage, mergeTags, campaign, list, subscriptionGrouped);
            }

            // When no list and subscriptionGrouped is provided, formatCampaignTemplate works the same way as formatTemplate
            html = tools.formatCampaignTemplate(html, this.tagLanguage, mergeTags, true, campaign, list, subscriptionGrouped);
        }

        const generateText = !!(text || '').trim();
        if (generateText) {
            text = htmlToText.fromString(html, {wordwrap: 130});
        } else {
            // When no list and subscriptionGrouped is provided, formatCampaignTemplate works the same way as formatTemplate
            text = tools.formatCampaignTemplate(text, this.tagLanguage, mergeTags, false, campaign, list, subscriptionGrouped)
        }

        return {
            html,
            text,
            attachments
        };
    }

    _getExtraTags() {
        const tags = {};

        if (this.rssEntry) {
            const rssEntry = this.rssEntry;
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

    async initByCampaignId(campaignId) {
        await this._init({type: MessageType.REGULAR, campaignId});
    }


    /*
        Accepted combinations of subData:

        Option #1
        - listId
        - subscriptionId
        - mergeTags [optional, used only when campaign / html+text is provided]

        Option #2:
        - to ... email / { name, address }
        - encryptionKeys [optional]
        - mergeTags [used only when campaign / html+text is provided]
     */
    async _sendMessage(subData) {
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

        const sendConfiguration = this.sendConfiguration;

        let mergeTags = subData.mergeTags;

        if (subData.listId) {
            let listId;

            if (subData.subscriptionId) {
                listId = subData.listId;
                subscriptionGrouped = await subscriptions.getById(contextHelpers.getAdminContext(), listId, subData.subscriptionId);
            }

            list = this.listsById.get(listId);
            email = subscriptionGrouped.email;

            const flds = this.listsFieldsGrouped.get(list.id);

            if (!mergeTags) {
                mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags());
            }

            for (const fld of flds) {
                if (fld.type === 'gpg' && mergeTags[fld.key]) {
                    encryptionKeys.push(mergeTags[fld.key].trim());
                }
            }

            message = await this._getMessage(mergeTags, list, subscriptionGrouped, true);

            let listUnsubscribe = null;
            if (!list.listunsubscribe_disabled) {
                listUnsubscribe = campaign && campaign.unsubscribe_url
                    ? tools.formatCampaignTemplate(campaign.unsubscribe_url, this.tagLanguage, mergeTags, false, campaign, list, subscriptionGrouped)
                    : getPublicUrl('/subscription/' + list.cid + '/unsubscribe/' + subscriptionGrouped.cid);
            }

            to = {
                name: list.to_name === null ? undefined : tools.formatCampaignTemplate(list.to_name, toNameTagLangauge, mergeTags, false, campaign, list, subscriptionGrouped),
                address: subscriptionGrouped.email
            };

            subject = this.subject;

            if (this.tagLanguage) {
                subject = tools.formatCampaignTemplate(this.subject, this.tagLanguage, mergeTags, false, campaign, list, subscriptionGrouped);
            }

            headers = {
                'List-ID': {
                    prepared: true,
                    value: libmime.encodeWords(list.name) + ' <' + list.cid + '.' + getPublicUrl() + '>'
                }
            };

            if (campaign) {
                const campaignAddress = [campaign.cid, list.cid, subscriptionGrouped.cid].join('.');

                if (this.useVerp) {
                    envelope = {
                        from: campaignAddress + '@' + sendConfiguration.verp_hostname,
                        to: subscriptionGrouped.email
                    };
                }

                if (this.useVerpSenderHeader) {
                    sender = campaignAddress + '@' + sendConfiguration.verp_hostname;
                }

                headers['x-fbl'] = campaignAddress;
                headers['x-msys-api'] = JSON.stringify({
                    campaign_id: campaignAddress
                });
                headers['x-smtpapi'] = JSON.stringify({
                    unique_args: {
                        campaign_id: campaignAddress
                    }
                });
                headers['x-mailgun-variables'] = JSON.stringify({
                    campaign_id: campaignAddress
                });
            }

            listHeader = {
                unsubscribe: listUnsubscribe
            };

        } else if (subData.to) {
            to = subData.to;
            email = to.address;
            subject = this.subject;
            encryptionKeys = subData.encryptionKeys;
            message = await this._getMessage(mergeTags);
        }

        if (await blacklist.isBlacklisted(email)) {
            return;
        }

        const mailer = await mailers.getOrCreateMailer(sendConfiguration.id);

        await mailer.throttleWait();

        const getOverridable = key => {
            if (campaign && sendConfiguration[key + '_overridable'] && campaign[key + '_override'] !== null) {
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
            attachments: message.attachments,
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


        const result = {
            response,
            responseId: responseId,
            list,
            subscriptionGrouped,
            email
        };

        return result;
    }

    async sendRegularCampaignMessage(campaignMessage) {
        enforce(this.type === MessageType.REGULAR);

        // We set the campaign_message to SENT before the message is actually sent. This is to avoid multiple delivery
        // if by chance we run out of disk space and couldn't change status in the database after the message has been sent out
        await knex('campaign_messages')
            .where({id: campaignMessage.id})
            .update({
                status: CampaignMessageStatus.SENT,
                updated: new Date()
            });

        let result;
        try {
            result = await this._sendMessage({listId: campaignMessage.list, subscriptionId: campaignMessage.subscription});
        } catch (err) {
            if (
              err.campaignMessageErrorType === CampaignMessageErrorType.PERMANENT ||
              err.retryable === false
            ) {
              await knex('campaign_messages')
                .where({id: campaignMessage.id})
                .update({
                  status: CampaignMessageStatus.FAILED,
                  updated: new Date()
                });
            } else {
              await knex('campaign_messages')
                .where({id: campaignMessage.id})
                .update({
                    status: CampaignMessageStatus.SCHEDULED,
                    updated: new Date()
                });
            }
            throw err;
        }

        enforce(result.list);
        enforce(result.subscriptionGrouped);

        await knex('campaign_messages')
            .where({id: campaignMessage.id})
            .update({
                response: result.response,
                response_id: result.responseId,
                updated: new Date()
            });

        await knex('campaigns').where('id', this.campaign.id).increment('delivered');
    }
}


async function sendQueuedMessage(queuedMessage) {
    const messageType = queuedMessage.type;

    enforce(messageType === MessageType.TRIGGERED || messageType === MessageType.TEST || messageType === MessageType.SUBSCRIPTION || messageType === MessageType.API_TRANSACTIONAL);

    const msgData = queuedMessage.data;

    const cs = new MessageSender();
    await cs._init({
        type: messageType,
        campaignId: msgData.campaignId,
        listId: msgData.listId,
        sendConfigurationId: queuedMessage.send_configuration,
        attachments: msgData.attachments,
        html: msgData.html,
        text: msgData.text,
        subject: msgData.subject,
        tagLanguage: msgData.tagLanguage,
        renderedHtml: msgData.renderedHtml,
        renderedText: msgData.renderedText,
        rssEntry: msgData.rssEntry
    });

    const campaign = cs.campaign;

    await knex('queued')
        .where({id: queuedMessage.id})
        .del();

    let result;
    try {
        result = await cs._sendMessage({
            subscriptionId: msgData.subscriptionId,
            listId: msgData.listId,
            to: msgData.to,
            mergeTags: msgData.mergeTags,
            encryptionKeys: msgData.encryptionKeys
        });
    } catch (err) {
        await knex('queued').insert({
            id: queuedMessage.id,
            send_configuration: queuedMessage.send_configuration,
            type: queuedMessage.type,
            data: JSON.stringify(queuedMessage.data)
        });

        throw err;
    }

    if (messageType === MessageType.TRIGGERED) {
        await knex('campaign_messages').insert({
            hash_email: result.subscriptionGrouped.hash_email,
            subscription: result.subscriptionGrouped.id,
            campaign: campaign.id,
            list: result.list.id,
            send_configuration: queuedMessage.send_configuration,
            status: CampaignMessageStatus.SENT,
            response: result.response,
            response_id: result.response_id,
            updated: new Date()
        });

        await knex('campaigns').where('id', campaign.id).increment('delivered');
    }

    if (campaign && messageType === MessageType.TEST) {
        enforce(result.list);
        enforce(result.subscriptionGrouped);

        try {
            // Insert an entry to test_messages. This allows us to remember test sends to lists that are not
            // listed in the campaign - see the check in getMessage
            await knex('test_messages').insert({
                campaign: campaign.id,
                list: result.list.id,
                subscription: result.subscriptionGrouped.id
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // The entry is already there, so we can ignore this error
            } else {
                throw err;
            }
        }
    }

    if (msgData.attachments) {
        for (const attachment of msgData.attachments) {
            if (attachment.id) { // This means that it is an attachment recorded in table files_campaign_attachment
                try {
                    // We ignore any errors here because we already sent the message. Thus we have to mark it as completed to avoid sending it again.
                    await knex.transaction(async tx => {
                        await files.unlockTx(tx, 'campaign', 'attachment', attachment.id);
                    });
                } catch (err) {
                    log.error('MessageSender', `Error when unlocking attachment ${attachment.id} for ${result.email} (queuedId: ${queuedMessage.id})`);
                    log.verbose(err.stack);
                }
            }
        }
    }
}

async function dropQueuedMessage(queuedMessage) {
    await knex('queued')
        .where({id: queuedMessage.id})
        .del();
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

async function queueAPITransactionalMessage(sendConfigurationId, email, subject, html, text, tagLanguage, mergeTags, attachments) {
    const msgData = {
        to: {
            address: email
        },
        html,
        text,
        tagLanguage,
        subject,
        mergeTags,
        attachments
    };

    await tx('queued').insert({
        send_configuration: sendConfigurationId,
        type: MessageType.API_TRANSACTIONAL,
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

async function getMessage(campaignCid, listCid, subscriptionCid, settings) {
    const cs = new MessageSender();
    await cs._init({type: MessageType.REGULAR, campaignCid, listCid, ...settings});

    const campaign = cs.campaign;
    const list = cs.listsByCid.get(listCid);

    const subscriptionGrouped = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, subscriptionCid);

    let listOk = false;

    for (const listSpec of campaign.lists) {
        if (list.id === listSpec.list) {
            // This means we send to a list that is associated with the campaign
            listOk = true;
            break;
        }
    }

    if (!listOk) {
        const row = await knex('test_messages').where({
            campaign: campaign.id,
            list: list.id,
            subscription: subscriptionGrouped.id
        }).first();

        if (row) {
            listOk = true;
        }
    }

    if (!listOk) {
        throw new Error('Message not found');
    }

    const flds = cs.listsFieldsGrouped.get(list.id);
    const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, cs._getExtraTags());

    return await cs._getMessage(mergeTags, list, subscriptionGrouped, false);
}

module.exports.MessageSender = MessageSender;
module.exports.MessageType = MessageType;
module.exports.sendQueuedMessage = sendQueuedMessage;
module.exports.queueCampaignMessageTx = queueCampaignMessageTx;
module.exports.queueSubscriptionMessage = queueSubscriptionMessage;
module.exports.dropQueuedMessage = dropQueuedMessage;
module.exports.getMessage = getMessage;
module.exports.queueAPITransactionalMessage = queueAPITransactionalMessage;
