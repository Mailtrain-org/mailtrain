"use strict";

exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('segments', table => {
        table.json('settings');
    });

    await knex.schema.table('segments', table => {
        table.dropForeign('list', 'segments_ibfk_1');
        table.foreign('list').references('lists.id');
    });


    const segments = await knex('segments');

    for (const segment of segments) {
        const oldRules = await knex('segment_rules').where('segment', segment.id);

        let type;
        if (segment.type === 1) {
            type = 'all';
        } else {
            type = 'some';
        }

        const rules = [];
        for (const oldRule of oldRules) {
            const oldSettings = JSON.parse(oldRule.value);

            const predefColumns = {
                email: 'string',
                opt_in_country: 'string',
                created: 'date',
                latest_open: 'date',
                latest_click: 'date'
            };
            // first_name and last_name are not here because they have been already converted to custom fields by 20170731072050_upgrade_custom_fields.js

            let fieldType;
            if (oldRule.column in predefColumns) {
                fieldType = predefColumns[oldRule.column];
            } else {
                const field = await knex('custom_fields').where({list: segment.list, column: oldRule.column}).select(['type']).first();
                if (field) {
                    fieldType = field.type;
                }
            }

            switch (fieldType) {
                case 'text':
                case 'website':
                    rules.push({ column: oldRule.column, value: oldSettings.value });
                    break;
                case 'number':
                    if (oldSettings.range) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'lt', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        {type: 'ge', value: oldSettings.start},
                                        {type: 'lt', value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'lt', column: oldRule.column, value: oldSettings.end  });
                        }
                    } else {
                        rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    }
                    break;
                case 'birthday':
                case 'date':
                    if (oldSettings.relativeRange) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'geNowPlusDays', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'leNowPlusDays', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        { type: 'geNowPlusDays', column: oldRule.column, value: oldSettings.start},
                                        { type: 'leNowPlusDays', column: oldRule.column, value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'geNowPlusDays', column: oldRule.column, value: oldSettings.startDirection ? oldSettings.start : -oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'leNowPlusDays', column: oldRule.column, value: oldSettings.endDirection ? oldSettings.end : -oldSettings.end  });
                        }
                    } else if (oldSettings.range) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        { type: 'ge', column: oldRule.column, value: oldSettings.start},
                                        { type: 'le', column: oldRule.column, value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end  });
                        }
                    } else {
                        rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    }
                    break;
                case 'option':
                    rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    break;
                default:
                    throw new Error(`Unknown rule for column ${oldRule.column} with field type ${fieldType}`);
            }
        }

        const settings = {
            rootRule: {
                type,
                rules
            }
        };

        await knex('segments').where('id', segment.id).update({settings: JSON.stringify(settings)});
    }

    await knex.schema.table('segments', table => {
        table.dropColumn('type');
    });

    await knex.schema.dropTable('segment_rules');
})();


exports.down = (knex, Promise) => (async() => {
})();