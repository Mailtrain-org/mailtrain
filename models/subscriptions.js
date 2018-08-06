'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const shortid = require('shortid');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const fields = require('./fields');
const { SubscriptionStatus, getFieldKey } = require('../shared/lists');
const segments = require('./segments');
const { enforce, filterObject } = require('../lib/helpers');
const moment = require('moment');
const { formatDate, formatBirthday } = require('../shared/date');

const allowedKeysBase = new Set(['email', 'tz', 'is_test', 'status']);

const fieldTypes = {};

const Cardinality = {
    SINGLE: 0,
    MULTIPLE: 1
};

function getOptionsMap(groupedField) {
    const result = {};
    for (const opt of groupedField.settings.options) {
        result[opt.key] = opt.label;
    }

    return result;
}

fieldTypes.text = fieldTypes.website = fieldTypes.longtext = fieldTypes.gpg = fieldTypes.number = fieldTypes.json = {
    afterJSON: (groupedField, entity) => {},
    listRender: (groupedField, value) => value
};

fieldTypes['checkbox-grouped'] = {
    afterJSON: (groupedField, entity) => {},
    listRender: (groupedField, value) => {
        const optMap = getOptionsMap(groupedField);
        return value.map(x => optMap[x]).join(', ');
    }
};

fieldTypes['radio-enum'] = fieldTypes['dropdown-enum'] = fieldTypes['radio-grouped'] = fieldTypes['dropdown-grouped'] = {
    afterJSON: (groupedField, entity) => {},
    listRender: (groupedField, value) => {
        const optMap = getOptionsMap(groupedField);
        return optMap[value];
    }
};

fieldTypes.date = {
    afterJSON: (groupedField, entity) => {
        const key = getFieldKey(groupedField);
        if (key in entity) {
            entity[key] = entity[key] ? moment(entity[key]).toDate() : null;
        }
    },
    listRender: (groupedField, value) => formatDate(groupedField.settings.dateFormat, value)
};

fieldTypes.birthday = {
    afterJSON: (groupedField, entity) => {
        const key = getFieldKey(groupedField);
        if (key in entity) {
            entity[key] = entity[key] ? moment(entity[key]).toDate() : null;
        }
    },
    listRender: (groupedField, value) => formatBirthday(groupedField.settings.dateFormat, value)
};



function getSubscriptionTableName(listId) {
    return `subscription__${listId}`;
}

function getCampaignTableName(campaignId) {
    return `campaign__${campaignId}`;
}

async function getGroupedFieldsMap(tx, listId) {
    const groupedFields = await fields.listGroupedTx(tx, listId);
    const result = {};
    for (const fld of groupedFields) {
        result[getFieldKey(fld)] = fld;
    }
    return result;
}

function groupSubscription(groupedFieldsMap, entity) {
    for (const fldKey in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldKey];
        const fieldType = fields.getFieldType(fld.type);

        if (fieldType.grouped) {

            let value = null;

            if (fieldType.cardinality === fields.Cardinality.SINGLE) {
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];

                    if (entity[option.column]) {
                        value = option.column;
                    }

                    delete entity[option.column];
                }

            } else {
                value = [];
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];

                    if (entity[option.column]) {
                        value.push(option.column);
                    }

                    delete entity[option.column];
                }
            }

            entity[fldKey] = value;

        } else if (fieldType.enumerated) {
            // This is enum-xxx type. We just make sure that the options we give out match the field settings.
            // If the field settings gets changed, there can be discrepancies between the field and the subscription data.

            const allowedKeys = new Set(fld.settings.options.map(x => x.key));

            if (!allowedKeys.has(entity[fldKey])) {
                entity[fldKey] = null;
            }
        }
    }
}

function ungroupSubscription(groupedFieldsMap, entity) {
    for (const fldKey in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldKey];

        const fieldType = fields.getFieldType(fld.type);
        if (fieldType.grouped) {

            if (fieldType.cardinality === fields.Cardinality.SINGLE) {
                const value = entity[fldKey];
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];
                    entity[option.column] = option.column === value;
                }

            } else {
                const values = entity[fldKey] || []; // The default (empty array) is here because create may be called with an entity that has some fields not filled in
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];
                    entity[option.column] = values.includes(option.column);
                }
            }

            delete entity[fldKey];

        } else if (fieldType.enumerated) {
            // This is enum-xxx type. We just make sure that the options we give out match the field settings.
            // If the field settings gets changed, there can be discrepancies between the field and the subscription data.

            const allowedKeys = new Set(fld.settings.options.map(x => x.key));

            if (!allowedKeys.has(entity[fldKey])) {
                entity[fldKey] = null;
            }
        }
    }
}


function getAllowedKeys(groupedFieldsMap) {
    return new Set([
        ...allowedKeysBase,
        ...Object.keys(groupedFieldsMap)
    ]);
}

function hashByAllowedKeys(allowedKeys, entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function hashByList(listId, entity) {
    return await knex.transaction(async tx => {
        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);
        return hashByAllowedKeys(allowedKeys, entity);
    });
}


async function _getBy(context, listId, key, value, grouped) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const entity = await tx(getSubscriptionTableName(listId)).where(key, value).first();

        if (!entity) {
            throw new interoperableErrors.NotFoundError('Subscription not found in this list');
        }

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);

        if (grouped) {
            groupSubscription(groupedFieldsMap, entity);
        }

        return entity;
    });
}


async function getById(context, listId, id, grouped = true) {
    return await _getBy(context, listId, 'id', id, grouped);
}

async function getByEmail(context, listId, email, grouped = true) {
    return await _getBy(context, listId, 'email', email, grouped);
}

async function getByCid(context, listId, cid, grouped = true) {
    return await _getBy(context, listId, 'cid', cid, grouped);
}

async function listDTAjax(context, listId, segmentId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const listTable = getSubscriptionTableName(listId);

        // All the data transformation below is to reuse ajaxListTx and groupSubscription methods so as to keep the code DRY
        // We first construct the columns to contain all which is supposed to be show and extraColumns which contain
        // everything else that constitutes the subscription.
        // Then in ajaxList's mapFunc, we construct the entity from the fields ajaxList retrieved and pass it to groupSubscription
        // to group the fields. Then we copy relevant values form grouped subscription to ajaxList's data which then get
        // returned to the client. During the copy, we also render the values.

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        const listFlds = await fields.listByOrderListTx(tx, listId, ['column', 'id']);

        const columns = [
            listTable + '.id',
            listTable + '.cid',
            listTable + '.email',
            listTable + '.status',
            listTable + '.created',
            { name: 'blacklisted', raw: 'not isnull(blacklist.email)' }
        ];
        const extraColumns = [];
        let listFldIdx = columns.length;
        const idxMap = {};

        for (const listFld of listFlds) {
            const fldKey = getFieldKey(listFld);
            const fld = groupedFieldsMap[fldKey];

            if (fld.column) {
                columns.push(listTable + '.' + fld.column);
            } else {
                columns.push({
                    name: listTable + '.' + fldKey,
                    raw: 0
                })
            }

            idxMap[fldKey] = listFldIdx;
            listFldIdx += 1;
        }

        for (const fldKey in groupedFieldsMap) {
            const fld = groupedFieldsMap[fldKey];

            if (fld.column) {
                if (!(fldKey in idxMap)) {
                    extraColumns.push(listTable + '.' + fld.column);
                    idxMap[fldKey] = listFldIdx;
                    listFldIdx += 1;
                }

            } else {
                for (const optionColumn in fld.groupedOptions) {
                    extraColumns.push(listTable + '.' + optionColumn);
                    idxMap[optionColumn] = listFldIdx;
                    listFldIdx += 1;
                }
            }
        }

        const addSegmentQuery = segmentId ? await segments.getQueryGeneratorTx(tx, listId, segmentId) : () => {};

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => {
                const query = builder
                    .from(listTable)
                    .leftOuterJoin('blacklist', listTable + '.email', 'blacklist.email')
                ;
                query.where(function() {
                    addSegmentQuery(this);
                });
                return query;
            },
            columns,
            {
                mapFun: data => {
                    const entity = {};
                    for (const fldKey in idxMap) {
                        // This is a bit of hacking. We rely on the fact that if a field has a column, then the column is the field key.
                        // Then it has the group id with value 0. groupSubscription will be able to process the fields that have a column
                        // and it will assign values to the fields that don't have a value (i.e. those that currently have the group id and value 0).
                        entity[fldKey] = data[idxMap[fldKey]];
                    }

                    groupSubscription(groupedFieldsMap, entity);

                    for (const listFld of listFlds) {
                        const fldKey = getFieldKey(listFld);
                        const fld = groupedFieldsMap[fldKey];
                        data[idxMap[fldKey]] = fieldTypes[fld.type].listRender(fld, entity[fldKey]);
                    }
                },

                extraColumns
            }
        );
    });
}

async function list(context, listId, grouped = true, offset, limit) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const count = await tx(getSubscriptionTableName(listId)).count('* as count').first().count;

        const entitiesQry = tx(getSubscriptionTableName(listId)).orderBy('id', 'asc');

        if (Number.isInteger(offset)) {
            entitiesQry.offset(offset);
        }

        if (Number.isInteger(limit)) {
            entitiesQry.limit(limit);
        }

        const entities = await entitiesQry;

        if (grouped) {
            const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);

            for (const entity of entities) {
                groupSubscription(groupedFieldsMap, entity);
            }
        }

        return {
            subscriptions: entities,
            total: count
        };
    });
}

async function serverValidate(context, listId, data) {
    return await knex.transaction(async tx => {
        const result = {};
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        if (data.email) {
            const existingKeyQuery = tx(getSubscriptionTableName(listId)).where('email', data.email);

            if (data.id) {
                existingKeyQuery.whereNot('id', data.id);
            }

            const existingKey = await existingKeyQuery.first();
            result.key = {
                exists: !!existingKey
            };
        }

        return result;
    });
}

async function _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, meta, isCreate) {
    enforce(entity.email, 'Email must be set');

    const existingWithKeyQuery = tx(getSubscriptionTableName(listId)).where('email', entity.email);

    if (!isCreate) {
        existingWithKeyQuery.whereNot('id', entity.id);
    }
    const existingWithKey = await existingWithKeyQuery.first();
    if (existingWithKey) {
        if (meta && (meta.updateAllowed || (meta.updateOfUnsubscribedAllowed && existingWithKey.status === SubscriptionStatus.UNSUBSCRIBED))) {
            meta.update = true;
            meta.existing = existingWithKey;
        } else {
            throw new interoperableErrors.DuplicitEmailError();
        }
    } else {
        // This is here because of the API, which allows one to send subscriptions without caring about whether they already exist, what their status is, etc.
        // In the case, the subscription is existing, we should not change the status. If it does not exist, we are fine with changing the status
        if (meta.subscribeIfNoExisting && !entity.status) {
            entity.status = SubscriptionStatus.SUBSCRIBED;
        }
    }

    if ((isCreate && !(meta && meta.update)) || 'status' in entity) {
        enforce(entity.status >= SubscriptionStatus.MIN && entity.status <= SubscriptionStatus.MAX, 'Invalid status');
    }

    for (const key in groupedFieldsMap) {
        const fld = groupedFieldsMap[key];

        fieldTypes[fld.type].afterJSON(fld, entity);
    }
}

function updateSourcesAndHash(subscription, source, groupedFieldsMap) {
    if ('email' in subscription) {
        subscription.hash_email = crypto.createHash('sha512').update(subscription.email).digest("base64");
        subscription.source_email = source;
    }

    for (const fldKey in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldKey];

        const fieldType = fields.getFieldType(fld.type);
        if (fieldType.grouped) {
            for (const optionKey in fld.groupedOptions) {
                const option = fld.groupedOptions[optionKey];

                if (option.column in subscription) {
                    subscription['source_' + option.column] = source;
                }
            }
        } else {
            if (fldKey in subscription) {
                subscription['source_' + fldKey] = source;
            }
        }
    }
}

async function _update(tx, listId, existing, filteredEntity) {
    if ('status' in filteredEntity) {
        if (existing.status !== filteredEntity.status) {
            filteredEntity.status_change = new Date();
        }
    }

    await tx(getSubscriptionTableName(listId)).where('id', existing.id).update(filteredEntity);

    if ('status' in filteredEntity) {
        let countIncrement = 0;
        if (existing.status === SubscriptionStatus.SUBSCRIBED && filteredEntity.status !== SubscriptionStatus.SUBSCRIBED) {
            countIncrement = -1;
        } else if (existing.status !== SubscriptionStatus.SUBSCRIBED && filteredEntity.status === SubscriptionStatus.SUBSCRIBED) {
            countIncrement = 1;
        }

        if (countIncrement) {
            await tx('lists').where('id', listId).increment('subscribers', countIncrement);
        }
    }
}

async function _create(tx, listId, filteredEntity) {
    const ids = await tx(getSubscriptionTableName(listId)).insert(filteredEntity);
    const id = ids[0];

    if (filteredEntity.status === SubscriptionStatus.SUBSCRIBED) {
        await tx('lists').where('id', listId).increment('subscribers', 1);
    }

    return id;
}

/*
    Adds a new subscription. Returns error if a subscription with the same email address is already present and is not unsubscribed.
    If it is unsubscribed and meta.updateOfUnsubscribedAllowed, the existing subscription is changed based on the provided data.
    If meta.updateAllowed is true, it updates even an active subscription.
 */
async function create(context, listId, entity, source, meta /* meta is provided when called from /confirm/subscribe/:cid */) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);

        await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, meta, true);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.status_change = new Date();

        ungroupSubscription(groupedFieldsMap, filteredEntity);

        updateSourcesAndHash(filteredEntity, source, groupedFieldsMap);

        filteredEntity.opt_in_ip = meta && meta.ip;
        filteredEntity.opt_in_country = meta && meta.country;
        filteredEntity.imported = meta && !!meta.imported;

        if (meta && meta.update) { // meta.update is set by _validateAndPreprocess
            await _update(tx, listId, meta.existing, filteredEntity);
            meta.cid = meta.existing.cid; // The cid is needed by /confirm/subscribe/:cid
            return meta.existing.id;
        } else {
            filteredEntity.cid = shortid.generate();

            if (meta) {
                meta.cid = filteredEntity.cid; // The cid is needed by /confirm/subscribe/:cid
            }

            return await _create(tx, listId, filteredEntity);
        }
    });
}

async function updateWithConsistencyCheck(context, listId, entity, source) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getSubscriptionTableName(listId)).where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);

        groupSubscription(groupedFieldsMap, existing);

        const existingHash = hashByAllowedKeys(allowedKeys, existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, null, false);

        const filteredEntity = filterObject(entity, allowedKeys);

        ungroupSubscription(groupedFieldsMap, filteredEntity);

        updateSourcesAndHash(filteredEntity, source, groupedFieldsMap);

        await _update(tx, listId, existing, filteredEntity);
    });
}

async function _removeAndGetTx(tx, context, listId, existing) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    await tx(getSubscriptionTableName(listId)).where('id', id).del();

    if (existing.status === SubscriptionStatus.SUBSCRIBED) {
        await tx('lists').where('id', listId).decrement('subscribers', 1);
    }
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('id', id).first();
        await _removeAndGetTx(tx, context, listId, existing);
    });
}

async function removeByEmailAndGet(context, listId, email) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('email', email).first();
        return await _removeAndGetTx(tx, context, listId, existing);
    });
}


async function _unsubscribeAndGetTx(tx, context, listId, existingSubscription, campaignCid) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    if (!(existingSubscription && existingSubscription.status === SubscriptionStatus.SUBSCRIBED)) {
        throw new interoperableErrors.NotFoundError();
    }

    existingSubscription.status = SubscriptionStatus.UNSUBSCRIBED;

    await tx(getSubscriptionTableName(listId)).where('id', existingSubscription.id).update({
        status: SubscriptionStatus.UNSUBSCRIBED
    });

    await tx('lists').where('id', listId).decrement('subscribers', 1);

    if (campaignCid) {
        const campaign = await tx('campaigns').where('cid', campaignCid);
        const subscriptionInCampaign = await tx(getCampaignTableName(campaign.id)).where({subscription: existingSubscription.id, list: listId});

        if (!subscriptionInCampaign) {
            throw new Error('Invalid campaign.')
        }

        if (subscriptionInCampaign.status === SubscriptionStatus.SUBSCRIBED) {
            await tx('campaigns').where('id', campaign.id).increment('unsubscribed', 1);
            await tx(getCampaignTableName(campaign.id)).where({subscription: existingSubscription.id, list: listId}).update({
                status: SubscriptionStatus.UNSUBSCRIBED
            });
        }
    }

    return existingSubscription;
}


async function unsubscribeByIdAndGet(context, listId, subscriptionId) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).first();
        return _unsubscribeAndGetTx(tx, context, listId, existing);
    });
}

async function unsubscribeByCidAndGet(context, listId, subscriptionCid, campaignCid) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('cid', subscriptionCid).first();
        return _unsubscribeAndGetTx(tx, context, listId, existing, campaignCid);
    });
}

async function unsubscribeByEmailAndGet(context, listId, email) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('email', email).first();
        return _unsubscribeAndGetTx(tx, context, listId, existing);
    });
}

async function updateAddressAndGet(context, listId, subscriptionId, emailNew) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        if (existing.email !== emailNew) {
            await tx(getSubscriptionTableName(listId)).where('email', emailNew).del();

            await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).update({
                email: emailNew
            });

            existing.email = emailNew;
        }

        return existing;
    });
}

async function updateManaged(context, listId, cid, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);

        const update = {};
        for (const key in groupedFieldsMap) {
            const fld = groupedFieldsMap[key];

            if (fld.order_manage) {
                update[key] = entity[key];
            }

            fieldTypes[fld.type].afterJSON(fld, update);
        }

        ungroupSubscription(groupedFieldsMap, update);

        await tx(getSubscriptionTableName(listId)).where('cid', cid).update(update);
    });
}


async function getListsWithEmail(context, email) {
    // FIXME - this methods is rather suboptimal if there are many lists. It quite needs permission caching in shares.js

    return await knex.transaction(async tx => {
        const lists = await tx('lists').select(['id', 'name']);
        const result = [];

        for (const list of lists) {
            await shares.enforceEntityPermissionTx(tx, context, 'list', list.id, 'viewSubscriptions');
            const entity = await tx(getSubscriptionTableName(list.id)).where('email', email).first();
            if (entity) {
                result.push(list);
            }
        }

        return result;
    });
}

module.exports = {
    hashByList,
    getById,
    getByCid,
    getByEmail,
    list,
    listDTAjax,
    serverValidate,
    create,
    updateWithConsistencyCheck,
    remove,
    removeByEmailAndGet,
    unsubscribeByCidAndGet,
    unsubscribeByIdAndGet,
    unsubscribeByEmailAndGet,
    updateAddressAndGet,
    updateManaged,
    getListsWithEmail
};