'use strict';

const passport = require('../lib/passport');
const shares = require('../models/shares');
const campaigns = require('../models/campaigns');
const {castToInteger} = require('../lib/helpers');
const {SubscriptionStatus} = require('../../shared/lists');
const knex = require('../lib/knex');
const {LinkId} = require('../models/links');
const moment = require('moment');
const {stringify: csvStringify} = require('csv-stringify');
const stream = require('stream');
const fields = require('../models/fields');
const contextHelpers = require('../lib/context-helpers');

const router = require('../lib/router-async').create();

async function renderCsvFromStream(readable, writable, opts, transform) {
    const finished = new Promise((success, fail) => {
        let lastReadable = readable;

        const stringifier = csvStringify(opts);

        stringifier.on('finish', () => success());
        stringifier.on('error', err => fail(err));

        if (transform) {
            const rowTransform = new stream.Transform({
                objectMode: true,
                transform(row, encoding, callback) {
                    async function performTransform() {
                        try {
                            const newRow = await transform(row, encoding);
                            callback(null, newRow);
                        } catch (err) {
                            callback(err);
                        }
                    }

                    // noinspection JSIgnoredPromiseFromCall
                    performTransform();
                }
            });

            lastReadable.on('error', err => fail(err));
            lastReadable.pipe(rowTransform);

            lastReadable = rowTransform;
        }

        stringifier.pipe(writable);
        lastReadable.pipe(stringifier);
    });

    await finished;
}


async function getCampaignCommonListFields(campaign) {
    const listFields = {};
    let firstIteration = true;
    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const flds = await fields.list(contextHelpers.getAdminContext(), cpgListId);

        const assignedFlds = new Set();

        for (const fld of flds) {
            /* Dropdown and checkbox groups have field.column == null
               For the time being, we don't group options and we don't expand enums. We just provide it as it is in the DB. */
            if (fld.column) {
                const fldKey = 'field:' + fld.key.toLowerCase();

                if (firstIteration) {
                    listFields[fldKey] = {
                        key: fld.key,
                        name: fld.name,
                        description: fld.description
                    };
                }

                if (fldKey in listFields) {
                    assignedFlds.add(fldKey);
                }
            }
        }

        for (const fldKey in listFields) {
            if (!assignedFlds.has(fldKey)) {
                delete listFields[fldKey];
            }
        }

        firstIteration = false;
    }

    return listFields;
}

async function _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, asStream) {
    const subsQrys = [];
    joins = joins || [];

    const knexJoinFns = [];

    const commonFieldsMapping = {
        'subscription:status': 'subscriptions.status',
        'subscription:id': 'subscriptions.id',
        'subscription:cid': 'subscriptions.cid',
        'subscription:email': 'subscriptions.email'
    };

    for (const join of joins) {
        const prefix = join.prefix;
        const type = join.type;
        const onConditions = join.onConditions || {};

        const getConds = (alias, cpgListId) => {
            const conds = {
                [alias + '.campaign']: knex.raw('?', [campaign.id]),
                [alias + '.list']: knex.raw('?', [cpgListId]),
                [alias + '.subscription']: 'subscriptions.id',
            };

            for (const onConditionKey in onConditions) {
                conds[alias + '.' + onConditionKey] = onConditions[onConditionKey];
            }

            return conds;
        };

        if (type === 'messages') {
            const alias = 'campaign_messages_' + prefix;

            commonFieldsMapping[`${prefix}:status`] = alias + '.status';

            knexJoinFns.push((qry, cpgListId) => qry.leftJoin('campaign_messages AS ' + alias, getConds(alias, cpgListId)));

        } else if (type === 'links') {
            const alias = 'campaign_links_' + prefix;

            commonFieldsMapping[`${prefix}:count`] = {raw: 'COALESCE(`' + alias + '`.`count`, 0)'};
            commonFieldsMapping[`${prefix}:link`] = alias + '.link';
            commonFieldsMapping[`${prefix}:country`] = alias + '.country';
            commonFieldsMapping[`${prefix}:deviceType`] = alias + '.device_type';
            commonFieldsMapping[`${prefix}:ip`] = alias + '.ip';
            commonFieldsMapping[`${prefix}:created`] = alias + '.created';

            knexJoinFns.push((qry, cpgListId) => qry.leftJoin('campaign_links AS ' + alias, getConds(alias, cpgListId)));

        } else {
            throw new Error(`Unknown join type "${type}"`);
        }
    }


    const listsFields = {};
    const permittedListFields = new Set();
    let firstIteration = true;
    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const listFields = {};
        listsFields[cpgListId] = listFields;

        const flds = await fields.list(contextHelpers.getAdminContext(), cpgListId);

        const assignedFlds = new Set();

        for (const fld of flds) {
            /* Dropdown and checkbox groups have field.column == null
               For the time being, we don't group options and we don't expand enums. We just provide it as it is in the DB. */
            if (fld.column) {
                const fldKey = 'field:' + fld.key.toLowerCase();

                listFields[fldKey] = 'subscriptions.' + fld.column;

                if (firstIteration) {
                    permittedListFields.add(fldKey);
                }

                if (permittedListFields.has(fldKey)) {
                    assignedFlds.add(fldKey);
                }
            }
        }

        for (const fldKey in [...permittedListFields]) {
            if (!assignedFlds.has(fldKey)) {
                permittedListFields.delete(fldKey);
            }
        }

        firstIteration = false;
    }

    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;
        const listFields = listsFields[cpgListId];

        for (const fldKey in listFields) {
            if (!permittedListFields.has(fldKey)) {
                delete listFields[fldKey];
            }
        }
    }


    for (const cpgList of campaign.lists) {
        const cpgListId = cpgList.list;

        const fieldsMapping = {
            ...commonFieldsMapping,
            ...listsFields[cpgListId],
            'list:id': {raw: knex.raw('?', [cpgListId])}
        };

        const getSelField = item => {
            const itemMapping = fieldsMapping[item];
            if (typeof itemMapping === 'string') {
                return itemMapping + ' AS ' + item;
            } else if (itemMapping.raw) {
                return knex.raw(fieldsMapping[item].raw + ' AS `' + item + '`');
            }
        };

        let selFields = [];
        for (let idx = 0; idx < select.length; idx++) {
            const item = select[idx];
            if (item in fieldsMapping) {
                selFields.push(getSelField(item));
            } else if (item === '*') {
                selFields = selFields.concat(Object.keys(fieldsMapping).map(entry => getSelField(entry)));
            } else {
                selFields.push(item);
            }
        }

        let query = knex(`subscription__${cpgListId} AS subscriptions`).select(selFields);

        for (const knexJoinFn of knexJoinFns) {
            query = knexJoinFn(query, cpgListId);
        }

        if (listQryFn) {
            query = listQryFn(
                query,
                colId => {
                    if (colId in fieldsMapping) {
                        return fieldsMapping[colId];
                    } else {
                        throw new Error(`Unknown column id ${colId}`);
                    }
                }
            );
        }

        subsQrys.push(query.toSQL().toNative());
    }

    if (subsQrys.length > 0) {
        let subsSql, subsBindings;

        const fieldsSet = new Set([...Object.keys(commonFieldsMapping), ...permittedListFields, 'list:id']);

        const applyUnionQryFn = (subsSql, subsBindings) => {
            if (unionQryFn) {
                return unionQryFn(
                    knex.from(function() {
                        return knex.raw('(' + subsSql + ')', subsBindings);
                    }),
                    colId => {
                        if (fieldsSet.has(colId)) {
                            return colId;
                        } else {
                            throw new Error(`Unknown column id ${colId}`);
                        }
                    }
                );
            } else {
                return knex.raw(subsSql, subsBindings);
            }
        };

        if (subsQrys.length === 1) {
            subsSql = subsQrys[0].sql;
            subsBindings = subsQrys[0].bindings;
        } else {
            subsSql = subsQrys.map(qry => '(' + qry.sql + ')').join(' UNION ALL ');
            subsBindings = Array.prototype.concat(...subsQrys.map(qry => qry.bindings));
        }

        if (asStream) {
            return applyUnionQryFn(subsSql, subsBindings).stream();

        } else {
            const res = await applyUnionQryFn(subsSql, subsBindings);
            if (res[0] && Array.isArray(res[0])) {
                return res[0]; // UNION ALL generates an array with result and schema
            } else {
                return res;
            }
        }

    } else {
        if (asStream) {
            const result = new Readable({
                objectMode: true,
            });
            result.push(null);
            return result;

        } else {
            return [];
        }
    }
}

async function _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, asStream) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), LinkId.OPEN)
            }),
            col
        ),
        asStream
    );
}

async function _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), LinkId.GENERAL_CLICK)
            }),
            col
        ),
        asStream
    );
}

async function _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn) {
    if (!listQryFn) {
        listQryFn = qry => qry;
    }

    return await _getCampaignStatistics(
        campaign,
        select,
        [{type: 'messages', prefix: 'tracker'}, {type: 'links', prefix: 'tracker'}],
        unionQryFn,
        (qry, col) => listQryFn(
            qry.where(function() {
                this.whereNull(col('tracker:link')).orWhere(col('tracker:link'), '>', LinkId.GENERAL_CLICK)
            }),
            col
        ),
        asStream
    );
}

async function getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn) {
    return await _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, false);
}

async function getCampaignStatisticsStream(campaign, select, joins, unionQryFn, listQryFn) {
    return await _getCampaignStatistics(campaign, select, joins, unionQryFn, listQryFn, true);
}

async function getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignOpenStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignOpenStatistics(campaign, select, unionQryFn, listQryFn, true);
}

async function getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignClickStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignClickStatistics(campaign, select, unionQryFn, listQryFn, true);
}

async function getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn, false);
}

async function getCampaignLinkClickStatisticsStream(campaign, select, unionQryFn, listQryFn) {
    return await _getCampaignLinkClickStatistics(campaign, select, unionQryFn, listQryFn, true);
}




router.getAsync('/open-and-click-counts/:campaignId', passport.loggedIn, async (req, res) => {
    const campaignId = castToInteger(req.params.campaignId);

    await shares.enforceEntityPermission(req.context, 'campaign', campaignId, 'viewStats');
    const campaign = await campaigns.getById(req.context, campaignId, false);

    const listFields = await getCampaignCommonListFields(campaign);

    const results = await getCampaignStatisticsStream(
        campaign,
        ['subscription:email', 'open_tracker:count', 'click_tracker:count', 'open_tracker:country', 'open_tracker:created', 'open_tracker:deviceType', ...Object.keys(listFields)],
        [
            {type: 'links', prefix: 'open_tracker', onConditions: {link: knex.raw('?', [LinkId.OPEN])} },
            {type: 'links', prefix: 'click_tracker', onConditions: {link: knex.raw('?', [LinkId.GENERAL_CLICK])} }
        ],
        null,
        (qry, col) => qry
            .where(col('subscription:status'), SubscriptionStatus.SUBSCRIBED)
    );

    res.set({
        'Content-Disposition': `attachment;filename=campaign-open-and-click-counts-${campaign.cid}.csv`,
        'Content-Type': 'text/csv'
    });

    await renderCsvFromStream(
        results,
        res,
        {
            header: true,
            columns: [
                { key: 'subscription:email', header: 'Email' },
                { key: 'open_tracker:count', header: 'Open count' },
                { key: 'click_tracker:count', header: 'Click count' },
                { key: 'open_tracker:country', header: 'Country (first open)' },
                { key: 'open_tracker:created', header: 'Date/time (first open)' },
                { key: 'open_tracker:deviceType', header: 'Device type (first open)' },
                ...Object.keys(listFields).map(key => ({key, header: listFields[key].key}))
            ],
            delimiter: ','
        },
        async (row, encoding) => ({
                ...row,
                'open_tracker:created': moment(row['open_tracker:created']).toISOString()
            })
    );
});

module.exports = router;
