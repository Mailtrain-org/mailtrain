'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const validators = require('../../shared/validators');
const shortid = require('shortid');
const slugify = require('slugify');
const segments = require('./segments');
const { formatDate, formatBirthday, parseDate, parseBirthday } = require('../../shared/date');
const { getFieldColumn } = require('../../shared/lists');
const { cleanupFromPost } = require('../lib/helpers');
const Handlebars = require('handlebars');
const { getTrustedUrl, getSandboxUrl, getPublicUrl } = require('../lib/urls');
const { getMergeTagsForBases } = require('../../shared/templates');
const {ListActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');


const allowedKeysCreate = new Set(['name', 'help', 'key', 'default_value', 'type', 'group', 'settings']);
const allowedKeysUpdate = new Set(['name', 'help', 'key', 'default_value', 'group', 'settings']);
const hashKeys = allowedKeysCreate;

const fieldTypes = {};

const Cardinality = {
    SINGLE: 0,
    MULTIPLE: 1
};

function render(template, options) {
    const renderer = Handlebars.compile(template || '');
    return renderer(options);
}

fieldTypes.text = {
    validate: field => {},
    addColumn: (table, name) => table.string(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeText',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => value,
    render: (field, value) => value
};

fieldTypes.website = {
    validate: field => {},
    addColumn: (table, name) => table.string(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeWebsite',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => value,
    render: (field, value) => value
};

fieldTypes.longtext = {
    validate: field => {},
    addColumn: (table, name) => table.text(name),
    indexed: false,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeLongtext',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => value,
    render: (field, value) => value
};

fieldTypes.gpg = {
    validate: field => {},
    addColumn: (table, name) => table.text(name),
    indexed: false,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeGpg',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => value,
    render: (field, value) => value
};

fieldTypes.json = {
    validate: field => {},
    addColumn: (table, name) => table.text(name),
    indexed: false,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeJson',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => value,
    render: (field, value) => {
        try {
            if (value === null || value.trim() === '') {
                return '';
            }

            let parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                parsed = {
                    values: parsed
                };
            }
            return render(field.settings.renderTemplate, parsed);
        } catch (err) {
            return err.message;
        }
    }
};

fieldTypes.number = {
    validate: field => {},
    addColumn: (table, name) => table.integer(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeNumber',
    forHbs: (field, value) => value,
    parsePostValue: (field, value) => Number(value),
    render: (field, value) => value
};

fieldTypes['checkbox-grouped'] = {
    validate: field => {},
    indexed: true,
    grouped: true,
    enumerated: false,
    cardinality: Cardinality.MULTIPLE,
    getHbsType: field => 'typeCheckboxGrouped',
    render: (field, value) => {
        const subItems = (value || []).map(col => field.groupedOptions[col].name);

        if (field.settings.groupTemplate) {
            return render(field.settings.groupTemplate, {
                values: subItems
            });
        } else {
            return subItems.join(', ');
        }
    }
};

fieldTypes['radio-grouped'] = {
    validate: field => {},
    indexed: true,
    grouped: true,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeRadioGrouped',
    render: (field, value) => {
        const fld = field.groupedOptions[value];
        return fld ? fld.name : '';
    }
};

fieldTypes['dropdown-grouped'] = {
    validate: field => {},
    indexed: true,
    grouped: true,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeDropdownGrouped',
    render: (field, value) => {
        const fld = field.groupedOptions[value];
        return fld ? fld.name : '';
    }
};

fieldTypes['radio-enum'] = {
    validate: field => {
        enforce(field.settings.options, 'Options missing in settings');
        enforce(field.default_value === null || field.settings.options.find(x => x.key === field.default_value), 'Default value not present in options');
    },
    addColumn: (table, name) => table.string(name),
    indexed: true,
    grouped: false,
    enumerated: true,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeRadioEnum',
    render: (field, value) => {
        const fld = field.settings.options[value];
        return fld ? fld.name : '';
    }
};

fieldTypes['dropdown-enum'] = {
    validate: field => {
        enforce(field.settings.options, 'Options missing in settings');
        enforce(field.default_value === null || field.settings.options.find(x => x.key === field.default_value), 'Default value not present in options');
    },
    addColumn: (table, name) => table.string(name),
    indexed: true,
    grouped: false,
    enumerated: true,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeDropdownEnum',
    render: (field, value) => {
        const fld = field.settings.options[value];
        return fld ? fld.name : '';
    }
};

fieldTypes.option = {
    validate: field => {},
    addColumn: (table, name) => table.boolean(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    parsePostValue: (field, value) => {
        if (Array.isArray(value)) {
            // HTML checkbox does not provide any value when not checked. To detect the presence of the checkbox, we add a hidden field with the same name (see subscription-custom-fields.hbs:130).
            // When the checkbox is selected, two values are returned and "value" is an array instead of a string. We assume the hidden field always comes after the actual value and thus take
            // the first value in the array
            value = value[0]
        }
        return !(['false', 'no', '0', ''].indexOf((value || '').toString().trim().toLowerCase()) >= 0)
    },
    getHbsType: field => 'typeOption',
    forHbs: (field, value) => value ? 1 : 0,
    render: (field, value) => value ? field.settings.checkedLabel : field.settings.uncheckedLabel

};

fieldTypes['date'] = {
    validate: field => {
        enforce(['eur', 'us'].includes(field.settings.dateFormat), 'Date format incorrect');
    },
    addColumn: (table, name) => table.dateTime(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeDate' + field.settings.dateFormat.charAt(0).toUpperCase() + field.settings.dateFormat.slice(1),
    forHbs: (field, value) => formatDate(field.settings.dateFormat, value),
    parsePostValue: (field, value) => parseDate(field.settings.dateFormat, value),
    render: (field, value) => value !== null ? formatDate(field.settings.dateFormat, value) : ''
};

fieldTypes['birthday'] = {
    validate: field => {
        enforce(['eur', 'us'].includes(field.settings.dateFormat), 'Date format incorrect');
    },
    addColumn: (table, name) => table.dateTime(name),
    indexed: true,
    grouped: false,
    enumerated: false,
    cardinality: Cardinality.SINGLE,
    getHbsType: field => 'typeBirthday' + field.settings.dateFormat.charAt(0).toUpperCase() + field.settings.dateFormat.slice(1),
    forHbs: (field, value) => formatBirthday(field.settings.dateFormat, value),
    parsePostValue: (field, value) => parseBirthday(field.settings.dateFormat, value),
    render: (field, value) => value !== null ? formatBirthday(field.settings.dateFormat, value) : ''
};

const groupedTypes = Object.keys(fieldTypes).filter(key => fieldTypes[key].grouped);

function getFieldType(type) {
    return fieldTypes[type];
}

function hash(entity) {
    return hasher.hash(filterObject(entity, hashKeys));
}

async function getById(context, listId, id) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewFields');

        const entity = await tx('custom_fields').where({list: listId, id}).first();

        entity.settings = JSON.parse(entity.settings);

        const orderFields = {
            order_list: 'orderListBefore',
            order_subscribe: 'orderSubscribeBefore',
            order_manage: 'orderManageBefore'
        };

        for (const key in orderFields) {
            if (entity[key] !== null) {
                const orderIdRow = await tx('custom_fields').where('list', listId).where(key, '>', entity[key]).orderBy(key, 'asc').select(['id']).first();
                if (orderIdRow) {
                    entity[orderFields[key]] = orderIdRow.id;
                } else {
                    entity[orderFields[key]] = 'end';
                }
            } else {
                entity[orderFields[key]] = 'none';
            }
        }

        return entity;
    });
}

async function listTx(tx, listId) {
    return await tx('custom_fields').where({list: listId}).select(['id', 'name', 'type', 'help', 'key', 'column', 'settings', 'group', 'default_value', 'order_list', 'order_subscribe', 'order_manage']).orderBy(knex.raw('-order_list'), 'desc').orderBy('id', 'asc');
}

async function list(context, listId) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, ['viewFields']);
        const flds = await listTx(tx, listId);

        return flds.map(fld => {
            fld.settings = JSON.parse(fld.settings);
            return fld;
        });
    });
}

async function listGroupedTx(tx, listId) {
    const flds = await listTx(tx, listId);

    const fldsById = {};
    for (const fld of flds) {
        fld.settings = JSON.parse(fld.settings);

        fldsById[fld.id] = fld;

        if (fieldTypes[fld.type].grouped) {
            fld.settings.options = [];
            fld.groupedOptions = {};
        }
    }

    for (const fld of flds) {
        if (fld.group) {
            const group = fldsById[fld.group];
            group.settings.options.push({ key: fld.column, label: fld.name });
            group.groupedOptions[fld.column] = fld;
        }
    }

    const groupedFlds = flds.filter(fld => !fld.group);

    for (const fld of flds) {
        delete fld.group;
    }

    return groupedFlds;
}

async function listGrouped(context, listId) {
    return await knex.transaction(async tx => {
        // It may seem odd why there is not 'viewFields' here. Simply, at this point this function is needed only in managing subscriptions.
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, ['manageSubscriptions']);
        return await listGroupedTx(tx, listId);
    });
}

async function listByOrderListTx(tx, listId, extraColumns = []) {
    return await tx('custom_fields').where({list: listId}).whereNotNull('order_list').select(['name', 'type', ...extraColumns]).orderBy('order_list', 'asc');
}

async function listDTAjax(context, listId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewFields');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('custom_fields')

                // This self join is to provide 'option' fields a reference to their parent grouped field. If the field is not an option, it refers to itself
                // All this is to show options always below their group parent
                .innerJoin('custom_fields AS parent_fields', function() {
                    this.on(function() {
                        this.onNotNull('custom_fields.group')
                            .on('custom_fields.group', '=', 'parent_fields.id');
                    }).orOn(function() {
                        this.orOnNull('custom_fields.group')
                            .on('custom_fields.id', '=', 'parent_fields.id');
                    });
                })
                .where('custom_fields.list', listId),
            [ 'custom_fields.id', 'custom_fields.name', 'custom_fields.type', 'custom_fields.key', 'custom_fields.order_list', 'custom_fields.group' ],
            {
                orderByBuilder: (builder, orderColumn, orderDir) => {
                    // We use here parent_fields to keep options always below their parent group
                    if (orderColumn === 'custom_fields.order_list') {
                        builder
                            .orderBy(knex.raw('-parent_fields.order_list'), orderDir === 'asc' ? 'desc' : 'asc') // This is MySQL speciality. It sorts the rows in ascending order with NULL values coming last
                            .orderBy('parent_fields.name', orderDir)
                            .orderBy(knex.raw('custom_fields.group is not null'), 'asc')
                    } else {
                        const parentColumn = orderColumn.replace(/^custom_fields/, 'parent_fields');
                        builder
                            .orderBy(parentColumn, orderDir)
                            .orderBy('parent_fields.name', orderDir)
                            .orderBy(knex.raw('custom_fields.group is not null'), 'asc');
                    }
                }
            }
        );
    });
}

async function listGroupedDTAjax(context, listId, params) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'viewFields');

        return await dtHelpers.ajaxListTx(
            tx,
            params,
            builder => builder
                .from('custom_fields')
                .where('custom_fields.list', listId)
                .whereIn('custom_fields.type', groupedTypes),
            ['custom_fields.id', 'custom_fields.name', 'custom_fields.type', 'custom_fields.key', 'custom_fields.order_list'],
            {
                orderByBuilder: (builder, orderColumn, orderDir) => {
                    if (orderColumn === 'custom_fields.order_list') {
                        builder
                            .orderBy(knex.raw('-custom_fields.order_list'), orderDir === 'asc' ? 'desc' : 'asc') // This is MySQL speciality. It sorts the rows in ascending order with NULL values coming last
                            .orderBy('custom_fields.name', orderDir);
                    } else {
                        builder
                            .orderBy(orderColumn, orderDir)
                            .orderBy('custom_fields.name', orderDir);
                    }
                }
            }
        );
    });
}

async function serverValidate(context, listId, data) {
    return await knex.transaction(async tx => {
        const result = {};
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageFields');

        if (data.key) {
            const existingKeyQuery = tx('custom_fields').where({
                list: listId,
                key: data.key
            });

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

async function _validateAndPreprocess(tx, listId, entity, isCreate) {
    enforce(entity.type === 'option' || !entity.group, 'Only option may have a group assigned');
    enforce(!entity.group || (entity.orderListBefore === 'none' && entity.orderSubscribeBefore === 'none' && entity.orderManageBefore === 'none'), 'Field with a group assigned cannot be made visible');

    enforce(!entity.group || await tx('custom_fields').where({list: listId, id: entity.group}).first(), 'Group field does not exist');
    enforce(entity.name, 'Name must be present');

    const fieldType = fieldTypes[entity.type];
    enforce(fieldType, 'Unknown field type');

    const validateErrs = fieldType.validate(entity);

    enforce(validators.mergeTagValid(entity.key), 'Merge tag is not valid.');

    const existingWithKeyQuery = tx('custom_fields').where({
        list: listId,
        key: entity.key
    });
    if (!isCreate) {
        existingWithKeyQuery.whereNot('id', entity.id);
    }
    const existingWithKey = await existingWithKeyQuery.first();
    if (existingWithKey) {
        throw new interoperableErrors.DuplicitKeyError();
    }

    entity.settings = JSON.stringify(entity.settings);
}

async function _sortIn(tx, listId, entityId, orderListBefore, orderSubscribeBefore, orderManageBefore) {
    const flds = await tx('custom_fields').where('list', listId).whereNot('id', entityId);

    const order = {};
    for (const row of flds) {
        order[row.id] = {
            order_list: null,
            order_subscribe: null,
            order_manage: null
        };
    }

    order[entityId] = {
        order_list: null,
        order_subscribe: null,
        order_manage: null
    };

    function computeOrder(fldName, sortInBefore) {
        flds.sort((x, y) => x[fldName] - y[fldName]);
        const ids = flds.filter(x => x[fldName] !== null).map(x => x.id);

        let sortedIn = false;
        let idx = 1;
        for (const id of ids) {
            if (sortInBefore === id) {
                order[entityId][fldName] = idx;
                sortedIn = true;
                idx += 1;
            }

            order[id][fldName] = idx;
            idx += 1;
        }

        if (!sortedIn && sortInBefore !== 'none') {
            order[entityId][fldName] = idx;
        }
    }

    computeOrder('order_list', orderListBefore);
    computeOrder('order_subscribe', orderSubscribeBefore);
    computeOrder('order_manage', orderManageBefore);

    for (const id in order) {
        await tx('custom_fields').where({list: listId, id}).update(order[id]);
    }
}

async function createTx(tx, context, listId, entity) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageFields');

    await _validateAndPreprocess(tx, listId, entity, true);

    const fieldType = fieldTypes[entity.type];

    let columnName;
    if (!fieldType.grouped) {
        columnName = ('custom_' + slugify(entity.name, '_').substring(0, 32) + '_' + shortid.generate()).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }

    const filteredEntity = filterObject(entity, allowedKeysCreate);
    filteredEntity.list = listId;
    filteredEntity.column = columnName;

    const ids = await tx('custom_fields').insert(filteredEntity);
    const id = ids[0];

    await _sortIn(tx, listId, id, entity.orderListBefore, entity.orderSubscribeBefore, entity.orderManageBefore);

    if (columnName) {
        await knex.schema.table('subscription__' + listId, table => {
            fieldType.addColumn(table, columnName);
            if (fieldType.indexed) {
                table.index(columnName);
            }
        });

        // Altough this is a reference to an import, it is represented as signed int(11). This is because we use negative values for constant from SubscriptionSource
        await knex.schema.raw('ALTER TABLE `subscription__' + listId + '` ADD `source_' + columnName +'` int(11) DEFAULT NULL');
    }

    await activityLog.logEntityActivity('list', ListActivityType.CREATE_FIELD, listId, {fieldId: id});

    return id;
}

async function create(context, listId, entity) {
    return await knex.transaction(async tx => {
        return await createTx(tx, context, listId, entity);
    });
}

async function updateWithConsistencyCheck(context, listId, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageFields');

        const existing = await tx('custom_fields').where({list: listId, id: entity.id}).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.settings = JSON.parse(existing.settings);
        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        enforce(entity.type === existing.type, 'Field type cannot be changed');
        await _validateAndPreprocess(tx, listId, entity, false);

        await tx('custom_fields').where({list: listId, id: entity.id}).update(filterObject(entity, allowedKeysUpdate));
        await _sortIn(tx, listId, entity.id, entity.orderListBefore, entity.orderSubscribeBefore, entity.orderManageBefore);

        await activityLog.logEntityActivity('list', ListActivityType.UPDATE_FIELD, listId, {fieldId: entity.id});
    });
}

async function removeTx(tx, context, listId, id) {
    await shares.enforceEntityPermissionTx(tx, context, 'list', listId, 'manageFields');

    const existing = await tx('custom_fields').where({list: listId, id: id}).first();
    if (!existing) {
        throw new interoperableErrors.NotFoundError();
    }

    const fieldType = fieldTypes[existing.type];

    await tx('custom_fields').where({list: listId, id}).del();

    if (fieldType.grouped) {
        await tx('custom_fields').where({list: listId, group: id}).del();

    } else {
        await knex.schema.table('subscription__' + listId, table => {
            table.dropColumn(existing.column);
            table.dropColumn('source_' + existing.column);
        });

        await segments.removeRulesByColumnTx(tx, context, listId, existing.column);
    }

    await activityLog.logEntityActivity('list', ListActivityType.REMOVE_FIELD, listId, {fieldId: id});
}

async function remove(context, listId, id) {
    await knex.transaction(async tx => {
        await removeTx(tx, context, listId, id);
    });
}

async function removeAllByListIdTx(tx, context, listId) {
    const entities = await tx('custom_fields').where('list', listId).select(['id']);
    for (const entity of entities) {
        await removeTx(tx, context, listId, entity.id);
    }
}

function forHbsWithFieldsGrouped(fieldsGrouped, subscription) { // assumes grouped subscription
    const customFields = [{
        name: 'Email Address',
        column: 'email',
        key: 'EMAIL',
        typeSubscriptionEmail: true,
        value: subscription ? subscription.email : '',
        order_subscribe: -1,
        order_manage: -1
    }];

    for (const fld of fieldsGrouped) {
        const type = fieldTypes[fld.type];
        const fldCol = getFieldColumn(fld);

        const entry = {
            name: fld.name,
            key: fld.key,
            help: fld.help,
            field: fld,
            [type.getHbsType(fld)]: true,
            order_subscribe: fld.order_subscribe,
            order_manage: fld.order_manage
        };

        if (!type.grouped && !type.enumerated) {
            // subscription[fldCol] may not exists because we are getting the data from "fromPost"
            entry.value = (subscription ? type.forHbs(fld, subscription[fldCol]) : null) || '';

        } else if (type.grouped) {
            const options = [];
            const value = (subscription ? subscription[fldCol] : null) || (type.cardinality === Cardinality.SINGLE ? null : []);

            for (const optCol in fld.groupedOptions) {
                const opt = fld.groupedOptions[optCol];

                let isEnabled;
                if (type.cardinality === Cardinality.SINGLE) {
                    isEnabled = value === opt.column;
                } else {
                    isEnabled = value.includes(opt.column);
                }

                options.push({
                    key: opt.key,
                    name: opt.name,
                    help: opt.help,
                    value: isEnabled
                });
            }

            entry.options = options;

        } else if (type.enumerated) {
            const options = [];
            const value = (subscription ? subscription[fldCol] : null) || null;

            for (const opt of fld.settings.options) {
                options.push({
                    key: opt.key,
                    name: opt.label,
                    help: opt.help,
                    value: value === opt.key
                });
            }

            entry.options = options;

        }

        customFields.push(entry);
    }

    return customFields;
}

// Returns an array that can be used for rendering by Handlebars
async function forHbs(context, listId, subscription) { // assumes grouped subscription
    const flds = await listGrouped(context, listId);
    return forHbsWithFieldsGrouped(flds, subscription);
}

function getMergeTags(fieldsGrouped, subscription, extraTags = {}) { // assumes grouped subscription
    const mergeTags = {
        'EMAIL': subscription.email,
        ...getMergeTagsForBases(getTrustedUrl(), getSandboxUrl(), getPublicUrl()),
        ...extraTags
    };

    for (const fld of fieldsGrouped) {
        const type = fieldTypes[fld.type];
        const fldCol = getFieldColumn(fld);

        mergeTags[fld.key] = type.render(fld, subscription[fldCol]);
    }

    return mergeTags;
}


// Converts subscription data received via (1) POST request from subscription form, (2) via subscribe request to API v1 to subscription structure supported by subscriptions model,
// or (3) from import.
// If a field is not specified in the POST data, it is also omitted in the returned subscription
function _fromText(listId, data, flds, isGrouped, keyName, singleCardUsesKeyName) {

    const subscription = {};

    if (isGrouped) {
        for (const fld of flds) {
            const fldKey = fld[keyName];

            if (fldKey && fldKey in data) {
                const type = fieldTypes[fld.type];
                const fldCol = getFieldColumn(fld);

                let value = null;

                if (!type.grouped && !type.enumerated) {
                    value = type.parsePostValue(fld, cleanupFromPost(data[fldKey]));

                } else if (type.grouped) {
                    if (type.cardinality === Cardinality.SINGLE) {
                        for (const optCol in fld.groupedOptions) {
                            const opt = fld.groupedOptions[optCol];
                            const optKey = opt[keyName];

                            // This handles two different formats for grouped dropdowns and radios.
                            // The first part of the condition handles the POST requests from the subscription form, while the
                            // second part handles the subscribe request to API v1
                            if (singleCardUsesKeyName) {
                                if (data[fldKey] === optKey) {
                                    value = opt.column
                                }
                            } else {
                                const optType = fieldTypes[opt.type];
                                const optValue = optType.parsePostValue(fld, cleanupFromPost(data[optKey]));
                                if (optValue) {
                                    value = opt.column
                                }
                            }
                        }
                    } else {
                        value = [];

                        for (const optCol in fld.groupedOptions) {
                            const opt = fld.groupedOptions[optCol];
                            const optKey = opt[keyName];
                            const optType = fieldTypes[opt.type];
                            const optValue = optType.parsePostValue(fld, cleanupFromPost(data[optKey]));

                            if (optValue) {
                                value.push(opt.column);
                            }
                        }
                    }

                } else if (type.enumerated) {
                    value = data[fldKey];
                }

                subscription[fldCol] = value;
            }
        }

    } else {
        for (const fld of flds) {
            const fldKey = fld[keyName];
            if (fldKey && fldKey in data) {
                const type = fieldTypes[fld.type];
                const fldCol = getFieldColumn(fld);

                subscription[fldCol] = type.parsePostValue(fld, cleanupFromPost(data[fldKey]));
            }
        }
    }

    return subscription;
}

async function fromPost(context, listId, data) { // assumes grouped subscription and indexation by merge key
    const flds = await listGrouped(context, listId);
    return _fromText(listId, data, flds, true, 'key', true);
}

async function fromAPI(context, listId, data) { // assumes grouped subscription and indexation by merge key
    const flds = await listGrouped(context, listId);
    return _fromText(listId, data, flds, true, 'key', false);
}

function fromImport(listId, flds, data) { // assumes ungrouped subscription and indexation by column
    return _fromText(listId, data, flds, true, 'column', false);
}

module.exports.Cardinality = Cardinality;
module.exports.getFieldType = getFieldType;
module.exports.hash = hash;
module.exports.getById = getById;
module.exports.list = list;
module.exports.listTx = listTx;
module.exports.listGrouped = listGrouped;
module.exports.listGroupedTx = listGroupedTx;
module.exports.listByOrderListTx = listByOrderListTx;
module.exports.listDTAjax = listDTAjax;
module.exports.listGroupedDTAjax = listGroupedDTAjax;
module.exports.create = create;
module.exports.createTx = createTx;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.removeAllByListIdTx = removeAllByListIdTx;
module.exports.serverValidate = serverValidate;
module.exports.forHbs = forHbs;
module.exports.forHbsWithFieldsGrouped = forHbsWithFieldsGrouped;
module.exports.fromPost = fromPost;
module.exports.fromAPI = fromAPI;
module.exports.fromImport = fromImport;
module.exports.getMergeTags = getMergeTags;
