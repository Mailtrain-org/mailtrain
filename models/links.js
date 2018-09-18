'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const tools = require('../lib/tools');
const campaigns = require('./campaigns');
const lists = require('./lists');
const subscriptions = require('./subscriptions');
const contextHelpers = require('../lib/context-helpers');
const geoip = require('geoip-ultralight');
const uaParser = require('device');
const he = require('he');
const { enforce } = require('../lib/helpers');
const { getTrustedUrl } = require('../lib/urls');

const LinkId = {
    OPEN: -1,
    GENERAL_CLICK: 0
};

async function resolve(linkCid) {
    return await knex('links').where('cid', linkCid).select(['id', 'url']).first();
}

async function countLink(remoteIp, userAgent, campaignCid, listCid, subscriptionCid, linkId) {
    await knex.transaction(async tx => {
        const list = await lists.getByCidTx(tx, contextHelpers.getAdminContext(), listCid);
        const campaign = await campaigns.getByCidTx(tx, contextHelpers.getAdminContext(), campaignCid);
        const subscription = await subscriptions.getByCidTx(tx, contextHelpers.getAdminContext(), subscriptionCid);

        const country = geoip.lookupCountry(remoteIp) || null;
        const device = uaParser(userAgent, { unknownUserAgentDeviceType: 'desktop', emptyUserAgentDeviceType: 'desktop' });
        const now = new Date();

        const _countLink = async (clickLinkId, incrementOnDup) => {
            try {
                const campaignLinksQry = knex('campaign_links')
                    .insert({
                        campaign: campaign.id,
                        list: list.id,
                        subscription: subscription.id,
                        link: linkId,
                        ip: remoteIp,
                        device_type: device.type,
                        country
                    }).toSQL();

                const campaignLinksQryResult = await tx.raw(campaignLinksQry.sql + (incrementOnDup ? ' ON DUPLICATE KEY UPDATE `count`=`count`+1' : ''), campaignLinksQry.bindings);

                if (campaignLinksQryResult.affectedRows > 1) { // When using DUPLICATE KEY UPDATE, this means that the entry was already there
                    return false;
                }

                return true;

            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return false;
                }

                throw err;
            }
        };



        // Update opened and click timestamps
        const latestUpdates = {};

        if (!campaign.click_tracking_disabled && linkId > LinkId.GENERAL_CLICK) {
            latestUpdates.latest_click = now;
        }

        if (!campaign.open_tracking_disabled) {
            latestUpdates.latest_open = now;
        }

        if (latestUpdates.latest_click || latestUpdates.latest_open) {
            await tx(subscriptions.getSubscriptionTableName(list.id)).update(latestUpdates).where('id', subscription.id);
        }


        // Update clicks
        if (linkId > LinkId.GENERAL_CLICK && !campaign.click_tracking_disabled) {
            if (await _countLink(linkId, true)) {
                if (await _countLink(LinkId.GENERAL_CLICK, false)) {
                    await tx('campaigns').increment('clicks').where('id', campaign.id);
                }
            }
        }


        // Update opens. We count a click as an open too.
        if (!campaign.open_tracking_disabled) {
            if (await _countLink(LinkId.OPEN, true)) {
                await tx('campaigns').increment('opened').where('id', campaign.id);
            }
        }
    });
}

async function addOrGet(campaignId, url) {
    return await knex.transaction(async tx => {
        const link = tx('links').select(['id', 'cid']).where({
            campaign: campaignId,
            url
        }).first();

        if (!link) {
            let cid = shortid.generate();

            const ids = tx('links').insert({
                campaign: campaignId,
                cid,
                url
            });

            return {
                id: ids[0],
                cid
            };
        }
    });
}

async function updateLinks(campaign, list, subscription, message) {
    if ((campaign.open_tracking_disabled && campaign.click_tracking_disabled) || !message || !message.trim()) {
        // tracking is disabled, do not modify the message
        return message;
    }

    // insert tracking image
    if (!campaign.open_tracking_disabled) {
        let inserted = false;
        const imgUrl = getTrustedUrl(`/links/${campaign.cid}/${list.cid}/${subscription.cid}`);
        const img = '<img src="' + imgUrl + '" width="1" height="1" alt="mt">';
        message = message.replace(/<\/body\b/i, match => {
            inserted = true;
            return img + match;
        });
        if (!inserted) {
            message = message + img;
        }
    }

    if (!campaign.click_tracking_disabled) {
        const re = /(<a[^>]* href\s*=[\s"']*)(http[^"'>\s]+)/gi;

        const urlsToBeReplaced = new Set();

        message.replace(re, (match, prefix, encodedUrl) => {
            const url = he.decode(encodedUrl, {isAttributeValue: true});
            urlsToBeReplaced.add(url);
        });

        const urls = new Map(); // url -> {id, cid} (as returned by add)
        for (const url of urlsToBeReplaced) {
            const link = await addOrGet(campaign.id, url);
            urls.set(url, link);
        }

        message.replace(re, (match, prefix, encodedUrl) => {
            const url = he.decode(encodedUrl, {isAttributeValue: true});
            const link = urls.get(url);
            return getTrustedUrl(`/links/${campaign.cid}/${list.cid}/${subscription.cid}/${link.cid}`);
        });
    }
}


module.exports.resolve = resolve;
module.exports.countLink = countLink;
module.exports.addOrGet = addOrGet;
module.exports.updateLinks = updateLinks;