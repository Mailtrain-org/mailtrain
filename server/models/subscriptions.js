'use strict';

const config = require('../lib/config');
const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const shortid = require('shortid');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const fields = require('./fields');
const { SubscriptionSource, SubscriptionStatus, getFieldColumn } = require('../../shared/lists');
const { CampaignMessageStatus } = require('../../shared/campaigns');
const segments = require('./segments');
const { enforce, filterObject, hashEmail, normalizeEmail } = require('../lib/helpers');
const moment = require('moment');
const { formatDate, formatBirthday } = require('../../shared/date');
const campaigns = require('./campaigns');
const lists = require('./lists');

const allowedKeysBase = new Set(['email', 'tz', 'is_test', 'status']);

const TEST_USERS_LIST_LIMIT = 1000;

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
        const key = getFieldColumn(groupedField);
        if (key in entity) {
            entity[key] = entity[key] ? moment(entity[key]).toISOString() : null;
        }
    },
    listRender: (groupedField, value) => formatDate(groupedField.settings.dateFormat, value)
};

fieldTypes.birthday = {
    afterJSON: (groupedField, entity) => {
        const key = getFieldColumn(groupedField);
        if (key in entity) {
            entity[key] = entity[key] ? moment(entity[key]).toISOString() : null;
        }
    },
    listRender: (groupedField, value) => formatBirthday(groupedField.settings.dateFormat, value)
};

fieldTypes.option = {
    afterJSON: (groupedField, entity) => {},
    listRender: (groupedField, value) => value ? groupedField.settings.checkedLabel : groupedField.settings.uncheckedLabel
};


function getSubscriptionTableName(listId) {
    return `subscription__${listId}`;
}

async function getGroupedFieldsMapTx(tx, listId) {
    const groupedFields = await fields.listGroupedTx(tx, listId);
    const result = {};
    for (const fld of groupedFields) {
        result[getFieldColumn(fld)] = fld;
    }
    return result;
}

function groupSubscription(groupedFieldsMap, entity) {
    for (const fldCol in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldCol];
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

            entity[fldCol] = value;

        } else if (fieldType.enumerated) {
            // This is enum-xxx type. We just make sure that the options we give out match the field settings.
            // If the field settings gets changed, there can be discrepancies between the field and the subscription data.

            const allowedKeys = new Set(fld.settings.options.map(x => x.key));

            if (!allowedKeys.has(entity[fldCol])) {
                entity[fldCol] = null;
            }
        }
    }
}

function ungroupSubscription(groupedFieldsMap, entity) {
    for (const fldCol in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldCol];

        const fieldType = fields.getFieldType(fld.type);
        if (fieldType.grouped) {

            if (fieldType.cardinality === fields.Cardinality.SINGLE) {
                const value = entity[fldCol];
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];
                    entity[option.column] = option.column === value;
                }

            } else {
                const values = entity[fldCol] || []; // The default (empty array) is here because create may be called with an entity that has some fields not filled in
                for (const optionKey in fld.groupedOptions) {
                    const option = fld.groupedOptions[optionKey];
                    entity[option.column] = values.includes(option.column);
                }
            }

            delete entity[fldCol];

        } else if (fieldType.enumerated) {
            // This is enum-xxx type. We just make sure that the options we give out match the field settings.
            // If the field settings gets changed, there can be discrepancies between the field and the subscription data.

            const allowedKeys = new Set(fld.settings.options.map(x => x.key));

            if (!allowedKeys.has(entity[fldCol])) {
                entity[fldCol] = null;
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
        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);
        return hashByAllowedKeys(allowedKeys, entity);
    });
}

async function _getByTx(tx, context, listId, key, value, grouped, isTest) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, isTest ? 'viewTestSubscriptions' : 'viewSubscriptions');

    const entity = await tx(getSubscriptionTableName(listId)).where(key, value).first();

    if (isTest && (!entity || !entity.is_test)) {
        shares.throwPermissionDenied();
    }

    if (!entity) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }

    const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);

    if (grouped) {
        groupSubscription(groupedFieldsMap, entity);
    }

    return entity;
}

async function _getBy(context, listId, key, value, grouped, isTest) {
    return await knex.transaction(async tx => {
        return _getByTx(tx, context, listId, key, value, grouped, isTest);
    });
}

async function getById(context, listId, id, grouped = true) {
    return await _getBy(context, listId, 'id', id, grouped, false);
}

async function getByEmail(context, listId, email, grouped = true) {
    const result = await _getBy(context, listId, 'hash_email', hashEmail(email), grouped, false);
    if (result.email === null) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }
    enforce(normalizeEmail(email) === normalizeEmail(result.email));
    return result;
}

async function getByCid(context, listId, cid, grouped = true, isTest = false) {
    return await _getBy(context, listId, 'cid', cid, grouped, isTest);
}

async function getByCidTx(tx, context, listId, cid, grouped = true, isTest = false) {
    return await _getByTx(tx, context, listId, 'cid', cid, grouped, isTest);
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

        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);
        const listFlds = await fields.listByOrderListTx(tx, listId, ['column', 'id']);

        const columns = [
            listTable + '.id',
            listTable + '.cid',
            listTable + '.email',
            listTable + '.status',
            listTable + '.created',
            { name: 'blacklisted', raw: 'not isnull(blacklist.email) as `blacklisted`' }
        ];
        const extraColumns = [];
        let listFldIdx = columns.length;
        const idxMap = {};

        for (const listFld of listFlds) {
            const fldCol = getFieldColumn(listFld);
            const fld = groupedFieldsMap[fldCol];

            if (fld.column) {
                columns.push(listTable + '.' + fld.column);
            } else {
                const colName = listTable + '.' + fldCol;

                columns.push({
                    name: colName,
                    raw: '? as `' + colName + '`',
                    data: [0]
                })
            }

            idxMap[fldCol] = listFldIdx;
            listFldIdx += 1;
        }

        for (const fldCol in groupedFieldsMap) {
            const fld = groupedFieldsMap[fldCol];

            if (fld.column) {
                if (!(fldCol in idxMap)) {
                    extraColumns.push(listTable + '.' + fld.column);
                    idxMap[fldCol] = listFldIdx;
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
                    for (const fldCol in idxMap) {
                        // This is a bit of hacking. We rely on the fact that if a field has a column, then the column is the field key.
                        // Then it has the group id with value 0. groupSubscription will be able to process the fields that have a column
                        // and it will assign values to the fields that don't have a value (i.e. those that currently have the group id and value 0).
                        entity[fldCol] = data[idxMap[fldCol]];
                    }

                    groupSubscription(groupedFieldsMap, entity);

                    for (const listFld of listFlds) {
                        const fldCol = getFieldColumn(listFld);
                        const fld = groupedFieldsMap[fldCol];
                        data[idxMap[fldCol]] = fieldTypes[fld.type].listRender(fld, entity[fldCol]);
                    }
                },

                extraColumns
            }
        );
    });
}

async function listTestUsersDTAjax(context, listCid, params) {
    return await knex.transaction(async tx => {
        const list = await lists.getByCidTx(tx, context, listCid);
        await shares.enforceEntityPermissionTx(tx, context, 'list', list.id, 'viewTestSubscriptions');

        const listTable = getSubscriptionTableName(list.id);

        const columns = [
            listTable + '.id',
            listTable + '.cid',
            listTable + '.email',
            listTable + '.status',
            listTable + '.created'
        ];

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from(listTable)
                .where('is_test', true),
            columns,
            {}
        );
    });
}

async function list(context, listId, grouped, offset, limit) {
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
            const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);

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

async function listTestUsersTx(tx, context, listId, segmentId, grouped) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewTestSubscriptions');

    let entitiesQry = tx(getSubscriptionTableName(listId)).orderBy('id', 'asc').where('is_test', true).limit(TEST_USERS_LIST_LIMIT);

    if (segmentId) {
        const addSegmentQuery = await segments.getQueryGeneratorTx(tx, listId, segmentId);

        entitiesQry = entitiesQry.where(function() {
            addSegmentQuery(this);
        });
    }

    const entities = await entitiesQry;

    if (grouped) {
        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);

        for (const entity of entities) {
            groupSubscription(groupedFieldsMap, entity);
        }
    }

    return entities;
}

// Note that this does not do all the work in the transaction. Thus it is prone to fail if the list is deleted in during the run of the function
async function* listIterator(context, listId, segmentId, grouped = true) {
    let groupedFieldsMap;
    let addSegmentQuery;

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        if (grouped) {
            groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);
        }

        addSegmentQuery = segmentId ? await segments.getQueryGeneratorTx(tx, listId, segmentId) : () => {};
    });

    let lastId = 0;

    while (true) {
        const entities = await knex(getSubscriptionTableName(listId))
            .orderBy('id', 'asc')
            .where('id', '>', lastId)
            .where(function() {
                addSegmentQuery(this);
            })
            .limit(500);

        if (entities.length > 0) {
            for (const entity of entities) {
                if (grouped) {
                    groupSubscription(groupedFieldsMap, entity);
                }

                yield entity;
            }

            lastId = entities[entities.length - 1].id;
        } else {
            break;
        }
    }
}

async function serverValidate(context, listId, data) {
    return await knex.transaction(async tx => {
        const result = {};
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        if (data.email) {
            const existingKeyQuery = tx(getSubscriptionTableName(listId)).where('hash_email', hashEmail(data.email)).whereNotNull('email');

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

    const existingWithKeyQuery = tx(getSubscriptionTableName(listId)).where('hash_email', hashEmail(entity.email)).forUpdate();

    if (!isCreate) {
        existingWithKeyQuery.whereNot('id', entity.id);
    }
    const existingWithKey = await existingWithKeyQuery.first();
    if (existingWithKey) {
        if (existingWithKey.email === null || meta.updateAllowed || (meta.updateOfUnsubscribedAllowed && existingWithKey.status === SubscriptionStatus.UNSUBSCRIBED)) {
            meta.update = true;
            meta.existing = existingWithKey;
        } else {
            throw new interoperableErrors.DuplicitEmailError();
        }
    } else {
        // This is here because of the API endpoint, which allows one to submit subscriptions without caring about whether they already exist, what their status is, etc.
        // The same for import where we need to subscribed only those (existing and new) that have not been unsubscribed already.
        // In the case, the subscription is existing, we should not change the status. If it does not exist, we are fine with changing the status to SUBSCRIBED

        if (meta.subscribeIfNoExisting && !entity.status) {
            entity.status = SubscriptionStatus.SUBSCRIBED;
        }
    }

    if ((isCreate && !meta.update) || 'status' in entity) {
        enforce(entity.status >= SubscriptionStatus.MIN && entity.status <= SubscriptionStatus.MAX, 'Invalid status');
    }

    for (const key in groupedFieldsMap) {
        const fld = groupedFieldsMap[key];

        fieldTypes[fld.type].afterJSON(fld, entity);
    }
}

function updateSourcesAndHashEmail(subscription, source, groupedFieldsMap) {
    if ('email' in subscription) {
        subscription.hash_email = hashEmail(subscription.email);
        subscription.source_email = source;
    }

    for (const fldCol in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldCol];

        const fieldType = fields.getFieldType(fld.type);
        if (fieldType.grouped) {
            for (const optionKey in fld.groupedOptions) {
                const option = fld.groupedOptions[optionKey];

                if (option.column in subscription) {
                    subscription['source_' + option.column] = source;
                }
            }
        } else {
            if (fldCol in subscription) {
                subscription['source_' + fldCol] = source;
            }
        }
    }
}



function purgeSensitiveData(subscription, groupedFieldsMap) {
    subscription.email = null;

    for (const fldCol in groupedFieldsMap) {
        const fld = groupedFieldsMap[fldCol];

        const fieldType = fields.getFieldType(fld.type);
        if (fieldType.grouped) {
            for (const optionKey in fld.groupedOptions) {
                const option = fld.groupedOptions[optionKey];
                subscription[option.column] = null;
                subscription['source_' + option.column] = SubscriptionSource.ERASED;
            }
        } else {
            subscription[fldCol] = null;
            subscription['source_' + fldCol] = SubscriptionSource.ERASED;
        }
    }
}

async function _update(tx, listId, groupedFieldsMap, existing, filteredEntity) {
    if ('status' in filteredEntity) {
        if (existing.status !== filteredEntity.status) {
            filteredEntity.status_change = new Date();
        }
    }

    if (filteredEntity.status === SubscriptionStatus.UNSUBSCRIBED || filteredEntity.status === SubscriptionStatus.COMPLAINED) {
        if (existing.unsubscribed === null) {
            filteredEntity.unsubscribed = new Date();
        }

        if (config.gdpr.deleteSubscriptionAfterUnsubscribe.enabled && config.gdpr.deleteSubscriptionAfterUnsubscribe.secondsAfterUnsubscribe === 0) {
            filteredEntity = null;
        } else if (config.gdpr.deleteDataAfterUnsubscribe.enabled && config.gdpr.deleteDataAfterUnsubscribe.secondsAfterUnsubscribe === 0) {
            purgeSensitiveData(filteredEntity, groupedFieldsMap);
        }
    } else if (filteredEntity.status === SubscriptionStatus.SUBSCRIBED) {
        filteredEntity.unsubscribed = null;
    }

    if (filteredEntity) {
        filteredEntity.updated = new Date();
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
    } else {
        await tx(getSubscriptionTableName(listId)).where('id', existing.id).del();

        if (existing.status === SubscriptionStatus.SUBSCRIBED) {
            await tx('lists').where('id', listId).decrement('subscribers', 1);
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
async function createTxWithGroupedFieldsMap(tx, context, listId, groupedFieldsMap, entity, source, meta) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    const allowedKeys = getAllowedKeys(groupedFieldsMap);

    await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, meta, true);

    const filteredEntity = filterObject(entity, allowedKeys);
    filteredEntity.status_change = new Date();

    ungroupSubscription(groupedFieldsMap, filteredEntity);

    updateSourcesAndHashEmail(filteredEntity, source, groupedFieldsMap);

    filteredEntity.opt_in_ip = meta.ip;
    filteredEntity.opt_in_country = meta.country;

    if (meta.update) { // meta.update is set by _validateAndPreprocess
        await _update(tx, listId, groupedFieldsMap, meta.existing, filteredEntity);
        meta.cid = meta.existing.cid; // The cid is needed by /confirm/subscribe/:cid
        return meta.existing.id;

    } else {
        filteredEntity.cid = shortid.generate();
        meta.cid = filteredEntity.cid; // The cid is needed by /confirm/subscribe/:cid
        return await _create(tx, listId, filteredEntity);
    }
}

async function create(context, listId, entity, source, meta) {
    return await knex.transaction(async tx => {
        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);
        return await createTxWithGroupedFieldsMap(tx, context, listId, groupedFieldsMap, entity, source, meta);
    });
}

async function updateWithConsistencyCheck(context, listId, entity, source) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getSubscriptionTableName(listId)).where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);

        groupSubscription(groupedFieldsMap, existing);

        const existingHash = hashByAllowedKeys(allowedKeys, existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, {}, false);

        const filteredEntity = filterObject(entity, allowedKeys);

        ungroupSubscription(groupedFieldsMap, filteredEntity);

        updateSourcesAndHashEmail(filteredEntity, source, groupedFieldsMap);

        await _update(tx, listId, groupedFieldsMap, existing, filteredEntity);
    });
}

async function _removeAndGetTx(tx, context, listId, existing) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    await tx(getSubscriptionTableName(listId)).where('id', existing.id).del();

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
        const existing = await tx(getSubscriptionTableName(listId)).where('hash_email', hashEmail(email)).first();
        return await _removeAndGetTx(tx, context, listId, existing);
    });
}


async function _changeStatusTx(tx, context, listId, existing, newStatus) {
    enforce(newStatus !== SubscriptionStatus.SUBSCRIBED);

    const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);

    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    await _update(tx, listId, groupedFieldsMap, existing, {
        status: newStatus
    });
}

async function _unsubscribeExistingAndGetTx(tx, context, listId, existing) {
    if (!(existing && existing.status === SubscriptionStatus.SUBSCRIBED)) {
        throw new interoperableErrors.NotFoundError();
    }

    await _changeStatusTx(tx, context, listId, existing, SubscriptionStatus.UNSUBSCRIBED);

    existing.status = SubscriptionStatus.SUBSCRIBED;

    return existing;
}

async function unsubscribeByIdAndGet(context, listId, subscriptionId) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).first();
        return await _unsubscribeExistingAndGetTx(tx, context, listId, existing);
    });
}

async function unsubscribeByCidAndGet(context, listId, subscriptionCid, campaignCid) {
    return await knex.transaction(async tx => {
        const existing = await tx(getSubscriptionTableName(listId)).where('cid', subscriptionCid).first();

        if (campaignCid) {
            await campaigns.changeStatusByCampaignCidAndSubscriptionIdTx(tx, context, campaignCid, listId, existing.id, CampaignMessageStatus.UNSUBSCRIBED);
        }

        return await _unsubscribeExistingAndGetTx(tx, context, listId, existing);
    });
}

async function unsubscribeByEmailAndGetTx(tx, context, listId, email) {
    const existing = await tx(getSubscriptionTableName(listId)).where('hash_email', hashEmail(email)).first();
    return await _unsubscribeExistingAndGetTx(tx, context, listId, existing);
}

async function unsubscribeByEmailAndGet(context, listId, email) {
    return await knex.transaction(async tx => {
        return await unsubscribeByEmailAndGetTx(tx, context, listId, email);
    });
}

async function changeStatusTx(tx, context, listId, subscriptionId, subscriptionStatus) {
    const existing = await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).first();
    await _changeStatusTx(tx, context, listId, existing, subscriptionStatus);
}



async function updateAddressAndGet(context, listId, subscriptionId, emailNew) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getSubscriptionTableName(listId)).where('id', subscriptionId).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        if (existing.email !== emailNew) {
            await tx(getSubscriptionTableName(listId)).where('hash_email', hashEmail(emailNew)).del();

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

        const groupedFieldsMap = await getGroupedFieldsMapTx(tx, listId);

        const update = {};
        for (const key in groupedFieldsMap) {
            const fld = groupedFieldsMap[key];

            if (fld.order_manage !== null) {
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
        const lsts = await tx('lists').select(['id', 'cid', 'name']);
        const result = [];

        for (const list of lsts) {
            await shares.enforceEntityPermissionTx(tx, context, 'list', list.id, 'viewSubscriptions');
            const entity = await tx(getSubscriptionTableName(list.id)).where('hash_email', hashEmail(email)).whereNotNull('email').first();
            if (entity) {
                result.push(list);
            }
        }

        return result;
    });
}

module.exports.getSubscriptionTableName = getSubscriptionTableName;
module.exports.hashByList = hashByList;
module.exports.getById = getById;
module.exports.getByCidTx = getByCidTx;
module.exports.getByCid = getByCid;
module.exports.getByEmail = getByEmail;
module.exports.list = list;
module.exports.listIterator = listIterator;
module.exports.listDTAjax = listDTAjax;
module.exports.listTestUsersTx = listTestUsersTx;
module.exports.listTestUsersDTAjax = listTestUsersDTAjax;
module.exports.serverValidate = serverValidate;
module.exports.create = create;
module.exports.getGroupedFieldsMapTx = getGroupedFieldsMapTx;
module.exports.createTxWithGroupedFieldsMap = createTxWithGroupedFieldsMap;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.removeByEmailAndGet = removeByEmailAndGet;
module.exports.unsubscribeByCidAndGet = unsubscribeByCidAndGet;
module.exports.unsubscribeByIdAndGet = unsubscribeByIdAndGet;
module.exports.unsubscribeByEmailAndGet = unsubscribeByEmailAndGet;
module.exports.unsubscribeByEmailAndGetTx = unsubscribeByEmailAndGetTx;
module.exports.updateAddressAndGet = updateAddressAndGet;
module.exports.updateManaged = updateManaged;
module.exports.getListsWithEmail = getListsWithEmail;
module.exports.changeStatusTx = changeStatusTx;
module.exports.purgeSensitiveData = purgeSensitiveData;
