'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const { enforce, filterObject } = require('../lib/helpers');
const hasher = require('node-object-hash')();
const moment = require('moment');
const fields = require('./fields');
const subscriptions = require('./subscriptions');
const dependencyHelpers = require('../lib/dependency-helpers');
const {ListActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');
const {SubscriptionStatus} = require('../../shared/lists');

const allowedKeys = new Set(['name', 'settings']);



const predefColumns = [
    {
        column: 'email',
        type: 'text'
    },
    {
        column: 'opt_in_country',
        type: 'text'
    },
    {
        column: 'created',
        type: 'date'
    },
    {
        column: 'latest_open',
        type: 'date'
    },
    {
        column: 'latest_click',
        type: 'date'
    },
    {
        column: 'is_test',
        type: 'option'
    },
    {
        column: 'status',
        type: 'dropdown-static',
        options: {
            subscribed: 1,
            unsubscribed: 2,
            bounced: 3,
            complained: 4
        }
    }
];


const compositeRuleTypes = {
    all: {
        addQuery: (query, rules, addSubQuery) => {
            for (const rule of rules) {
                query.where(function() {
                    addSubQuery(this, rule);
                });
            }
        }
    },
    some: {
        addQuery: (query, rules, addSubQuery) => {
            for (const rule of rules) {
                query.orWhere(function() {
                    addSubQuery(this, rule);
                });
            }
        }
    },
    none: {
        addQuery: (query, rules, addSubQuery) => {
            for (const rule of rules) {
                query.whereNot(function() {
                    addSubQuery(this, rule);
                });
            }
        }
    },
};



const primitiveRuleTypes = {
    text: {},
    website: {},
    number: {},
    date: {},
    birthday: {},
    option: {},
    'dropdown-enum': {},
    'radio-enum': {},
    'dropdown-static': {}
};


function stringValueSettings(sqlOperator, allowEmpty) {
    return {
        validate: (rule, fldDef) => {
            enforce(typeof rule.value === 'string', 'Invalid value type in rule');
            enforce(allowEmpty || rule.value, 'Value in rule must not be empty');
        },
        addQuery: (subsTableName, query, rule, fldDef) => query.where(subsTableName + '. ' + rule.column, sqlOperator, rule.value)
    };
}

function numberValueSettings(sqlOperator) {
    return {
        validate: (rule, fldDef) => {
            enforce(typeof rule.value === 'number', 'Invalid value type in rule');
        },
        addQuery: (subsTableName, query, rule, fldDef) => query.where(subsTableName + '. ' + rule.column, sqlOperator, rule.value)
    };
}

function dateValueSettings(thisDaySqlOperator, nextDaySqlOperator) {
    return {
        validate: (rule, fldDef) => {
            const date = moment.utc(rule.value);
            enforce(date.isValid(), 'Invalid date value');
        },
        addQuery: (subsTableName, query, rule, fldDef) => {
            const thisDay = moment.utc(rule.value).startOf('day');
            const nextDay = moment(thisDay).add(1, 'days');

            if (thisDaySqlOperator) {
                query.where(subsTableName + '. ' + rule.column, thisDaySqlOperator, thisDay.toDate())
            }

            if (nextDaySqlOperator) {
                query.where(subsTableName + '. ' + rule.column, nextDaySqlOperator, nextDay.toDate());
            }
        }
    };
}

function dateRelativeValueSettings(todaySqlOperator, tomorrowSqlOperator) {
    return {
        validate: (rule, fldDef) => {
            enforce(typeof rule.value === 'number', 'Invalid value type in rule');
        },
        addQuery: (subsTableName, query, rule, fldDef) => {
            const todayWithOffset = moment.utc().startOf('day').add(rule.value, 'days');
            const tomorrowWithOffset = moment(todayWithOffset).add(1, 'days');

            if (todaySqlOperator) {
                query.where(subsTableName + '. ' + rule.column, todaySqlOperator, todayWithOffset.toDate())
            }

            if (tomorrowSqlOperator) {
                query.where(subsTableName + '. ' + rule.column, tomorrowSqlOperator, tomorrowWithOffset.toDate());
            }
        }
    };
}

function optionValueSettings(value) {
    return {
        validate: (rule, fldDef) => {},
        addQuery: (subsTableName, query, rule, fldDef) => query.where(subsTableName + '. ' + rule.column, value)
    };
}

function staticEnumValueSettings(sqlOperator) {
    return {
        validate: (rule, fldDef) => {
            enforce(rule.value, 'Value in rule must not be empty');
            enforce(rule.value in fldDef.options, 'Value is not permitted')
        },
        addQuery: (subsTableName, query, rule, fldDef) => query.where(subsTableName + '. ' + rule.column, sqlOperator, fldDef.options[rule.value])
    };
}


primitiveRuleTypes.text.eq = stringValueSettings('=', true);
primitiveRuleTypes.text.like = stringValueSettings('LIKE', true);
primitiveRuleTypes.text.re = stringValueSettings('REGEXP', true);
primitiveRuleTypes.text.lt = stringValueSettings('<', false);
primitiveRuleTypes.text.le = stringValueSettings('<=', false);
primitiveRuleTypes.text.gt = stringValueSettings('>', false);
primitiveRuleTypes.text.ge = stringValueSettings('>=', false);

primitiveRuleTypes.website.eq = stringValueSettings('=', true);
primitiveRuleTypes.website.like = stringValueSettings('LIKE', true);
primitiveRuleTypes.website.re = stringValueSettings('REGEXP', true);

primitiveRuleTypes.number.eq = numberValueSettings('=');
primitiveRuleTypes.number.lt = numberValueSettings('<');
primitiveRuleTypes.number.le = numberValueSettings('<=');
primitiveRuleTypes.number.gt = numberValueSettings('>');
primitiveRuleTypes.number.ge = numberValueSettings('>=');

primitiveRuleTypes.date.eq = dateValueSettings('>=', '<');
primitiveRuleTypes.date.lt = dateValueSettings('<', null);
primitiveRuleTypes.date.le = dateValueSettings(null, '<');
primitiveRuleTypes.date.gt = dateValueSettings(null, '>=');
primitiveRuleTypes.date.ge = dateValueSettings('>=', null);

primitiveRuleTypes.date.eqTodayPlusDays = dateRelativeValueSettings('>=', '<');
primitiveRuleTypes.date.ltTodayPlusDays = dateRelativeValueSettings('<', null);
primitiveRuleTypes.date.leTodayPlusDays = dateRelativeValueSettings(null, '<');
primitiveRuleTypes.date.gtTodayPlusDays = dateRelativeValueSettings(null, '>=');
primitiveRuleTypes.date.geTodayPlusDays = dateRelativeValueSettings('>=', null);

primitiveRuleTypes.birthday.eq = dateValueSettings('>=', '<');
primitiveRuleTypes.birthday.lt = dateValueSettings('<', null);
primitiveRuleTypes.birthday.le = dateValueSettings(null, '<');
primitiveRuleTypes.birthday.gt = dateValueSettings(null, '>=');
primitiveRuleTypes.birthday.ge = dateValueSettings('>=', null);

primitiveRuleTypes.option.isTrue = optionValueSettings(true);
primitiveRuleTypes.option.isFalse = optionValueSettings(false);

primitiveRuleTypes['dropdown-enum'].eq = stringValueSettings('=', true);
primitiveRuleTypes['dropdown-enum'].like = stringValueSettings('LIKE', true);
primitiveRuleTypes['dropdown-enum'].re = stringValueSettings('REGEXP', true);
primitiveRuleTypes['dropdown-enum'].lt = stringValueSettings('<', false);
primitiveRuleTypes['dropdown-enum'].le = stringValueSettings('<=', false);
primitiveRuleTypes['dropdown-enum'].gt = stringValueSettings('>', false);
primitiveRuleTypes['dropdown-enum'].ge = stringValueSettings('>=', false);

primitiveRuleTypes['radio-enum'].eq = stringValueSettings('=', true);
primitiveRuleTypes['radio-enum'].like = stringValueSettings('LIKE', true);
primitiveRuleTypes['radio-enum'].re = stringValueSettings('REGEXP', true);
primitiveRuleTypes['radio-enum'].lt = stringValueSettings('<', false);
primitiveRuleTypes['radio-enum'].le = stringValueSettings('<=', false);
primitiveRuleTypes['radio-enum'].gt = stringValueSettings('>', false);
primitiveRuleTypes['radio-enum'].ge = stringValueSettings('>=', false);

primitiveRuleTypes['radio-enum'].eq = stringValueSettings('=', true);
primitiveRuleTypes['radio-enum'].like = stringValueSettings('LIKE', true);
primitiveRuleTypes['radio-enum'].re = stringValueSettings('REGEXP', true);
primitiveRuleTypes['radio-enum'].lt = stringValueSettings('<', false);
primitiveRuleTypes['radio-enum'].le = stringValueSettings('<=', false);
primitiveRuleTypes['radio-enum'].gt = stringValueSettings('>', false);
primitiveRuleTypes['radio-enum'].ge = stringValueSettings('>=', false);

primitiveRuleTypes['dropdown-static'].eq = staticEnumValueSettings('=', true);


function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function listDTAjax(context, listId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSegments');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('segments')
                .where('list', listId),
            ['id', 'name']
        );
    });
}

async function listIdName(context, listId) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, ['viewSegments']);

        return await tx('segments').select(['id', 'name']).where('list', listId).orderBy('name', 'asc');
    });
}

async function getByIdTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewSegments');
    const entity = await tx('segments').where({id, list: listId}).first();

    if (!entity) {
        throw new interoperableErrors.NotFoundError();
    }

    entity.settings = JSON.parse(entity.settings);
    return entity;
}

async function getById(context, listId, id) {
    return await knex.transaction(async tx => {
        return getByIdTx(tx, context, listId, id);
    });
}

async function _validateAndPreprocess(tx, listId, entity, isCreate) {
    enforce(entity.name, 'Name must be present');
    enforce(entity.settings, 'Settings must be present');
    enforce(entity.settings.rootRule, 'Root rule must be present in setting');
    enforce(entity.settings.rootRule.type in compositeRuleTypes, 'Root rule must be composite');


    const flds = await fields.listTx(tx, listId);
    const allowedFlds = [
        ...predefColumns,
        ...flds.filter(fld => fld.type in primitiveRuleTypes)
    ];

    const fieldsByColumn = {};
    for (const fld of allowedFlds) {
        fieldsByColumn[fld.column] = fld;
    }

    function validateRule(rule) {
        if (rule.type in compositeRuleTypes) {
            for (const childRule of rule.rules) {
                validateRule(childRule);
            }
        } else {
            const fldDef = fieldsByColumn[rule.column];
            const colType = fldDef.type;
            primitiveRuleTypes[colType][rule.type].validate(rule, fldDef);
        }
    }


    validateRule(entity.settings.rootRule);

    entity.settings = JSON.stringify(entity.settings);
}

async function create(context, listId, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

        await _validateAndPreprocess(tx, listId, entity, true);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.list = listId;

        const ids = await tx('segments').insert(filteredEntity);
        const id = ids[0];

        await activityLog.logEntityActivity('list', ListActivityType.CREATE_SEGMENT, listId, {segmentId: id});

        return id;
    });
}

async function updateWithConsistencyCheck(context, listId, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

        const existing = await tx('segments').where({list: listId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.settings = JSON.parse(existing.settings);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, listId, entity, false);

        await tx('segments').where({list: listId, id: entity.id}).update(filterObject(entity, allowedKeys));

        await activityLog.logEntityActivity('list', ListActivityType.UPDATE_SEGMENT, listId, {segmentId: entity.id});
    });
}


async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

    await dependencyHelpers.ensureNoDependencies(tx, context, id, [
        {
            entityTypeId: 'campaign',
            query: tx => tx('campaign_lists')
                .where('campaign_lists.segment', id)
                .innerJoin('campaigns', 'campaign_lists.campaign', 'campaigns.id')
                .select(['campaigns.id', 'campaigns.name'])
        }
    ]);

    // The listId "where" is here to prevent deleting segment of a list for which a user does not have permission
    await tx('segments').where({list: listId, id}).del();

    await activityLog.logEntityActivity('list', ListActivityType.REMOVE_SEGMENT, listId, {segmentId: id});
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, listId, id);
    });
}

async function removeAllByListIdTx(tx, context, listId) {
    const entities = await tx('segments').where('list', listId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, listId, entity.id);
    }
}

async function removeRulesByColumnTx(tx, context, listId, column) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageSegments');

    function pruneChildRules(rule) {
        if (rule.type in compositeRuleTypes) {

            const newRules = [];

            for (const childRule of rule.rules) {
                if (childRule.column !== column) {
                    pruneChildRules(childRule);
                    newRules.push(childRule);
                }
            }

            rule.rules = newRules;
        }
    }

    const entities = await tx('segments').where({list: listId});
    for (const entity of entities) {
        const settings = JSON.parse(entity.settings);

        pruneChildRules(settings.rootRule);

        await tx('segments').where({list: listId, id: entity.id}).update('settings', JSON.stringify(settings));
    }
}

async function getQueryGeneratorTx(tx, listId, id) {
    const flds = await fields.listTx(tx, listId);
    const allowedFlds = [
        ...predefColumns,
        ...flds.filter(fld => fld.type in primitiveRuleTypes)
    ];

    const fieldsByColumn = {};
    for (const fld of allowedFlds) {
        fieldsByColumn[fld.column] = fld;
    }

    const entity = await tx('segments').where({id, list: listId}).first();
    const settings = JSON.parse(entity.settings);

    const subsTableName = subscriptions.getSubscriptionTableName(listId);

    function processRule(query, rule) {
        if (rule.type in compositeRuleTypes) {
            compositeRuleTypes[rule.type].addQuery(query, rule.rules, (subQuery, childRule) => {
                processRule(subQuery, childRule);
            });
        } else {
            const fldDef = fieldsByColumn[rule.column];
            const colType = fldDef.type;
            primitiveRuleTypes[colType][rule.type].addQuery(subsTableName, query, rule, fldDef);
        }
    }

    return query => processRule(query, settings.rootRule);
} 

// This is to handle circular dependency with fields.js
module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listIdName = listIdName;
module.exports.getById = getById;
module.exports.getByIdTx = getByIdTx;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.removeAllByListIdTx = removeAllByListIdTx;
module.exports.removeRulesByColumnTx = removeRulesByColumnTx;
module.exports.getQueryGeneratorTx = getQueryGeneratorTx;
