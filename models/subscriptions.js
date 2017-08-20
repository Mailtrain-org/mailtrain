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

const allowedKeysBase = new Set(['email', 'tz', 'is_test', 'status']);

function getTableName(listId) {
    return `subscription__${listId}`;
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
                const values = entity[fldKey];
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

async function getById(context, listId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const entity = await tx(getTableName(listId)).where('id', id).first();

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        groupSubscription(groupedFieldsMap, entity);

        return entity;
    });
}

async function listDTAjax(context, listId, segmentId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const flds = await fields.listByOrderListTx(tx, listId, ['column']);
        const addSegmentQuery = segmentId ? await segments.getQueryGeneratorTx(tx, listId, segmentId) : () => {};

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => {
                const query = builder.from(getTableName(listId));
                query.where(function() {
                    addSegmentQuery(this);
                });
                return query;
            },
            ['id', 'cid', 'email', 'status', 'created', ...flds.map(fld => fld.column)]
            // FIXME - adapt data in custom columns to render them properly
        );
    });
}

async function list(context, listId) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSubscriptions');

        const entities = await tx(getTableName(listId));

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);

        for (const entity of entities) {
            groupSubscription(groupedFieldsMap, entity);
        }

        return entities;
    });
}

async function serverValidate(context, listId, data) {
    return await knex.transaction(async tx => {
        const result = {};
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        if (data.email) {
            const existingKeyQuery = tx(getTableName(listId)).where('email', data.email);

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

async function _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, isCreate) {
    enforce(entity.email, 'Email must be set');

    const existingWithKeyQuery = tx(getTableName(listId)).where('email', entity.email);

    if (!isCreate) {
        existingWithKeyQuery.whereNot('id', entity.id);
    }
    const existingWithKey = await existingWithKeyQuery.first();
    if (existingWithKey) {
        throw new interoperableErrors.DuplicitEmailError();
    }

    enforce(entity.status >= 0 && entity.status < SubscriptionStatus.MAX, 'Invalid status');

    for (const key in groupedFieldsMap) {
        const fld = groupedFieldsMap[key];
        if (fld.type === 'date' || fld.type === 'birthday') {
            entity[getFieldKey(fld)] = moment(entity[getFieldKey(fld)]).toDate();
        }
    }
}

async function create(context, listId, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const groupedFieldsMap = await getGroupedFieldsMap(tx, listId);
        const allowedKeys = getAllowedKeys(groupedFieldsMap);

        await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, true);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.cid = shortid.generate();
        filteredEntity.status_change = new Date();

        ungroupSubscription(groupedFieldsMap, filteredEntity);

        // FIXME - process:
        // filteredEntity.opt_in_ip =
        // filteredEntity.opt_in_country =
        // filteredEntity.imported =

        const ids = await tx(getTableName(listId)).insert(filteredEntity);
        const id = ids[0];

        if (entity.status === SubscriptionStatus.SUBSCRIBED) {
            await tx('lists').where('id', listId).increment('subscribers', 1);
        }

        return id;
    });
}

async function updateWithConsistencyCheck(context, listId, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getTableName(listId)).where('id', entity.id).first();
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

        await _validateAndPreprocess(tx, listId, groupedFieldsMap, entity, false);

        const filteredEntity = filterObject(entity, allowedKeys);

        ungroupSubscription(groupedFieldsMap, filteredEntity);

        if (existing.status !== entity.status) {
            filteredEntity.status_change = new Date();
        }

        await tx(getTableName(listId)).where('id', entity.id).update(filteredEntity);


        let countIncrement = 0;
        if (existing.status === SubscriptionStatus.SUBSCRIBED && entity.status !== SubscriptionStatus.SUBSCRIBED) {
            countIncrement = -1;
        } else if (existing.status !== SubscriptionStatus.SUBSCRIBED && entity.status === SubscriptionStatus.SUBSCRIBED) {
            countIncrement = 1;
        }

        if (countIncrement) {
            await tx('lists').where('id', listId).increment('subscribers', countIncrement);
        }
    });
}

async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

    const existing = await tx(getTableName(listId)).where('id', id).first();
    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    await tx(getTableName(listId)).where('id', id).del();

    if (existing.status === SubscriptionStatus.SUBSCRIBED) {
        await tx('lists').where('id', listId).decrement('subscribers', 1);
    }
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, listId, id);
    });
}

async function unsubscribe(context, listId, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSubscriptions');

        const existing = await tx(getTableName(listId)).where('id', id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        if (existing.status === SubscriptionStatus.SUBSCRIBED) {
            await tx(getTableName(listId)).where('id', id).update({
                status: SubscriptionStatus.UNSUBSCRIBED
            });

            await tx('lists').where('id', listId).decrement('subscribers', 1);
        }
    });
}



module.exports = {
    hashByList,
    getById,
    list,
    listDTAjax,
    serverValidate,
    create,
    updateWithConsistencyCheck,
    remove,
    unsubscribe
};