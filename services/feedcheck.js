'use strict';

const log = require('../lib/log');
const knex = require('../lib/knex');
const feedparser = require('feedparser-promised');
const { CampaignType, CampaignStatus, CampaignSource } = require('../shared/campaigns');
const util = require('util');
const campaigns = require('../models/campaigns');
const contextHelpers = require('../lib/context-helpers');

const _ = require('../lib/translate')._;

const feedCheckInterval = 10 * 60 * 1000;

const dbCheckInterval = 60 * 1000;

let running = false;

async function fetch(url) {
    const httpOptions = {
        uri: 'http://feeds.feedwrench.com/JavaScriptJabber.rss',
        headers: {
            'user-agent': 'Mailtrain',
            'accept': 'text/html,application/xhtml+xml'
        }
    };

    const items = await feedparser.parse(httpOptions);

    const entries = [];
    for (const item of items) {
        const entry = {
            title: item.title,
            date: item.date || item.pubdate || item.pubDate || new Date(),
            guid: item.guid || item.link,
            link: item.link,
            content: item.description || item.summary,
            summary: item.summary || item.description,
            image_url: item.image.url
        };
        entries.push(entry);
    }

    return entries;
}

async function run() {
    if (running) {
        return;
    }

    running = true;

    let rssCampaignIdRow;

    while (rssCampaignIdRow = await knex('campaigns')
        .where('type', CampaignType.RSS)
        .where('status', CampaignStatus.ACTIVE)
        .where(qry => qry.whereNull('last_check').orWhere('last_check', '<', new Date(Date.now() - feedCheckInterval)))
        .select('id')
        .first()) {

        const rssCampaign = campaigns.getById(contextHelpers.getAdminContext(), rssCampaignIdRow.id);

        let checkStatus = null;

        try {
            const entries = await fetch(rssCampaign.data.feedUrl);

            let added = 0;

            for (const entry of entries) {
                let entryId = null;

                await knex.transaction(async tx => {
                    const existingEntry = await tx('rss').where({
                        parent: rssCampaign.id,
                        guid: entry.guid
                    }).first();

                    if (!existingEntry) {
                        const campaignData = {};

                        let source = rssCampaign.source;
                        if (source === CampaignSource.CUSTOM_FROM_TEMPLATE || source === CampaignSource.CUSTOM) {
                            source = CampaignSource.CUSTOM_FROM_CAMPAIGN;
                            campaignData.sourceCampaign = rssCampaign.id;
                        } else {
                            Object.assign(campaignData, rssCampaign.data);
                        }

                        campaignData.rssEntry = entry;

                        const campaign = {
                            type: CampaignType.RSS_ENTRY,
                            source,
                            name: entry.title || `RSS entry ${entry.guid.substr(0, 67)}`,
                            lists: rssCampaign.lists,
                            namespace: rssCampaign.namespace,
                            send_configuration: rssCampaign.send_configuration,

                            from_name_override: rssCampaign.from_name_override,
                            from_email_override: rssCampaign.from_email_override,
                            reply_to_override: rssCampaign.reply_to_override,
                            subject_override: rssCampaign.subject_override,
                            data: JSON.stringify(campaignData),

                            click_tracking_disabled: rssCampaign.click_tracking_disabled,
                            open_tracking_disabled: rssCampaign.open_tracking_disabled,
                            unsubscribe_url: rssCampaign.unsubscribe_url
                        };

                        const ids = await campaigns.createRssTx(tx, contextHelpers.getAdminContext(), campaign);
                        const campaignId = ids[0];

                        await tx('rss').insert({
                            parent: rssCampaign.id,
                            campaign: campaignId,
                            guid: entry.guid,
                            pubdate: entry.date,
                        });

                        added += 1;
                    }
                });
            }

            if (added > 0) {
                checkStatus = util.format(_('Found %s new campaign messages from feed'), added);
                log.verbose('Feed', `Added ${added} new campaigns for ${rssCampaign.id}`);
            } else {
                checkStatus = _('Found nothing new from the feed');
            }

            rssCampaign.data.checkStatus = checkStatus;
            await knex('campaigns').where('id', rssCampaign.id).update({
                last_check: Date.now(),
                data: JSON.stringify(rssCampaign.data)
            });

        } catch (err) {
            log.error('Feed', err.message);
            rssCampaign.data.checkStatus = err.message;
            await knex('campaigns').where('id', rssCampaign.id).update({
                last_check: Date.now(),
                data: JSON.stringify(rssCampaign.data)
            });
        }
    }

    running = false;

    setTimeout(run, dbCheckInterval);
}

process.send({
    type: 'feedcheck-started'
});

run();
