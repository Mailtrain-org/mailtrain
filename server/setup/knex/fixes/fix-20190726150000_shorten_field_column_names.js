'use strict';

const config = require('../config');
const knex = require('../../../lib/knex');
const shortid = require('../../../lib/shortid');
const slugify = require('slugify');

async function run() {
    const lists = await knex('lists');
    for (const list of lists) {
        console.log(`Processing list ${list.id}`);
        const fields = await knex('custom_fields').whereNotNull('column').where('list', list.id);

        const fieldsMap = new Map();
        const prefixesMap = new Map();

        for (const field of fields) {
            const oldName = field.column;
            const newName = ('custom_' + slugify(field.name, '_').substring(0, 32) + '_' + shortid.generate()).toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const formerPrefix = ('custom_' + slugify(field.name, '_') + '_').toLowerCase().replace(/[^a-z0-9_]/g, '');

            fieldsMap.set(oldName, newName);
            prefixesMap.set(formerPrefix, newName);

            await knex('custom_fields').where('id', field.id).update('column', newName);

            await knex.schema.table('subscription__' + list.id, table => {
                table.renameColumn(oldName, newName);
                table.renameColumn('source_' + oldName, 'source_' + newName);
            });
        }


        function processRule(rule) {
            if (rule.type === 'all' || rule.type === 'some' || rule.type === 'none') {
                for (const childRule of rule.rules) {
                    processRule(childRule);
                }
            } else {
                let newName = fieldsMap.get(rule.column);
                if (newName) {
                    rule.column = newName;
                    return;
                }

                for (const [formerPrefix, newName] of prefixesMap.entries()) {
                    if (rule.column.startsWith(formerPrefix)) {
                        rule.column = newName;
                        return;
                    }
                }
            }
        }

        const segments = await knex('segments').where('list', list.id);
        for (const segment of segments) {
            const settings = JSON.parse(segment.settings);
            processRule(settings.rootRule);
            await knex('segments').where('id', segment.id).update({settings: JSON.stringify(settings)});
        }
    }

    await knex('knex_migrations').where('name', '20190726150000_shorten_field_column_names.js').del();

    console.log('All fixes done');
    process.exit();
}

run().catch(err => console.error(err));
