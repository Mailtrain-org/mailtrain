'use strict';

const config = require('config');
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


class CampaignSender {
    constructor() {
    }

    static async testSend(context, listCid, subscriptionCid, campaignId, sendConfigurationId, html, text) {
        let sendConfiguration, list, fieldsGrouped, campaign, subscriptionGrouped, useVerp, useVerpSenderHeader, mergeTags, attachments;

        await knex.transaction(async tx => {
            sendConfiguration = await sendConfigurations.getByIdTx(tx, context, sendConfigurationId, false, true);
            list = await lists.getByCidTx(tx, context, listCid);
            fieldsGrouped = await fields.listGroupedTx(tx, list.id);

            useVerp = config.verp.enabled && sendConfiguration.verp_hostname;
            useVerpSenderHeader = useVerp && !sendConfiguration.verp_disable_sender_header;

            subscriptionGrouped = await subscriptions.getByCid(context, list.id, subscriptionCid);
            mergeTags = fields.getMergeTags(fieldsGrouped, subscriptionGrouped);

            if (campaignId) {
                campaign = await campaigns.getByIdTx(tx, context, campaignId, false, campaigns.Content.WITHOUT_SOURCE_CUSTOM);
            } else {
                // This is to fake the campaign for getMessageLinks, which is called inside formatMessage
                campaign = {
                    cid: '[CAMPAIGN_ID]'
                };
            }
        });

        const encryptionKeys = [];
        for (const fld of fieldsGrouped) {
            if (fld.type === 'gpg' && mergeTags[fld.key]) {
                encryptionKeys.push(mergeTags[fld.key].trim());
            }
        }

        attachments = [];
        // replace data: images with embedded attachments
        html = html.replace(/(<img\b[^>]* src\s*=[\s"']*)(data:[^"'>\s]+)/gi, (match, prefix, dataUri) => {
            const cid = shortid.generate() + '-attachments';
            attachments.push({
                path: dataUri,
                cid
            });
            return prefix + 'cid:' + cid;
        });

        html = tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, html, true);

        text = (text || '').trim()
            ? tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, text)
            : htmlToText.fromString(html, {wordwrap: 130});


        const mailer = await mailers.getOrCreateMailer(sendConfiguration.id);

        const getOverridable = key => {
            return sendConfiguration[key];
        }

        const campaignAddress = [campaign.cid, list.cid, subscriptionGrouped.cid].join('.');

        const mail = {
            from: {
                name: getOverridable('from_name'),
                address: getOverridable('from_email')
            },
            replyTo: getOverridable('reply_to'),
            xMailer: sendConfiguration.x_mailer ? sendConfiguration.x_mailer : false,
            to: {
                name: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, list.to_name, false),
                address: subscriptionGrouped.email
            },
            sender: useVerpSenderHeader ? campaignAddress + '@' + sendConfiguration.verp_hostname : false,

            envelope: useVerp ? {
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
                unsubscribe: null
            },
            subject: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, getOverridable('subject'), false),
            html,
            text,

            attachments,
            encryptionKeys
        };


        let response;
        try {
            const info = await mailer.sendMassMail(mail);
            response = info.response || info.messageId;
        } catch (err) {
            response = err.response || err.message;
        }

        return response;
    }


    async init(settings) {
        this.listsById = new Map(); // listId -> list
        this.listsByCid = new Map(); // listCid -> list
        this.listsFieldsGrouped = new Map(); // listId -> fieldsGrouped
        this.attachments = [];

        await knex.transaction(async tx => {
            if (settings.campaignCid) {
                this.campaign = await campaigns.rawGetByTx(tx, 'cid', settings.campaignCid);
            } else {
                this.campaign = await campaigns.rawGetByTx(tx, 'id', settings.campaignId);
            }

            const campaign = this.campaign;

            this.sendConfiguration = await sendConfigurations.getByIdTx(tx, contextHelpers.getAdminContext(), campaign.send_configuration, false, true);

            for (const listSpec of campaign.lists) {
                const list = await lists.getByIdTx(tx, contextHelpers.getAdminContext(), listSpec.list);
                this.listsById.set(list.id, list);
                this.listsByCid.set(list.cid, list);
                this.listsFieldsGrouped.set(list.id, await fields.listGroupedTx(tx, list.id));
            }

            if (campaign.source === CampaignSource.TEMPLATE) {
                this.template = await templates.getByIdTx(tx, contextHelpers.getAdminContext(), campaign.data.sourceTemplate, false);
            }

            const attachments = await files.listTx(tx, contextHelpers.getAdminContext(), 'campaign', 'attachment', campaign.id);
            for (const attachment of attachments) {
                this.attachments.push({
                    filename: attachment.originalname,
                    path: files.getFilePath('campaign', 'attachment', campaign.id, attachment.filename)
                });
            }

            this.useVerp = config.verp.enabled && this.sendConfiguration.verp_hostname;
            this.useVerpSenderHeader = this.useVerp && !this.sendConfiguration.verp_disable_sender_header;
        });
    }

    async _getMessage(campaign, list, subscriptionGrouped, mergeTags, replaceDataImgs) {
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

        html = await links.updateLinks(campaign, list, subscriptionGrouped, mergeTags, html);

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

    async getMessage(listCid, subscriptionCid) {
        const list = this.listsByCid.get(listCid);
        const subscriptionGrouped = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, subscriptionCid);
        const flds = this.listsFieldsGrouped.get(list.id);
        const campaign = this.campaign;
        const mergeTags = fields.getMergeTags(flds, subscriptionGrouped, this._getExtraTags(campaign));

        return await this._getMessage(campaign, list, subscriptionGrouped, mergeTags, false);
    }

    async sendMessageByEmail(listId, email) {
        const subscriptionGrouped = await subscriptions.getByEmail(contextHelpers.getAdminContext(), listId, email);
        await this._sendMessage(listId, subscriptionGrouped);
    }

    async sendMessageBySubscriptionId(listId, subscriptionId) {
        const subscriptionGrouped = await subscriptions.getById(contextHelpers.getAdminContext(), listId, subscriptionId);
        await this._sendMessage(listId, subscriptionGrouped);
    }

    async _sendMessage(listId, subscriptionGrouped) {
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

        const {html, text, attachments} = await this._getMessage(campaign, list, subscriptionGrouped, mergeTags, true);

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
        }

        const mail = {
            from: {
                name: getOverridable('from_name'),
                address: getOverridable('from_email')
            },
            replyTo: getOverridable('reply_to'),
            xMailer: sendConfiguration.x_mailer ? sendConfiguration.x_mailer : false,
            to: {
                name: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, list.to_name, false),
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
            subject: tools.formatMessage(campaign, list, subscriptionGrouped, mergeTags, getOverridable('subject'), false),
            html,
            text,

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

        if (campaign.type === CampaignType.REGULAR || campaign.type === CampaignType.RSS_ENTRY) {
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

        } else if (campaign.type = CampaignType.TRIGGERED) {
            await knex('queued')
                .where({
                    campaign: this.campaign.id,
                    list: list.id,
                    subscription: subscriptionGrouped.id
                })
                .del();
        }
    }
}

module.exports = CampaignSender;