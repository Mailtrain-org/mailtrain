"use strict";

exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_fields', table => {
        table.json('settings');
    });

    await knex.schema.table('custom_fields', table => {
        table.dropForeign('list', 'custom_fields_ibfk_1');
        table.foreign('list').references('lists.id');
    });

    const fields = await knex('custom_fields');

    for (const field of fields) {
        const settings = {};
        let type = field.type;

        if (type === 'json') {
            settings.groupTemplate = field.group_template;
        }

        if (type === 'checkbox') {
            settings.groupTemplate = field.group_template;
        }

        if (['dropdown', 'radio'].includes(type)) {
            settings.groupTemplate = field.group_template;
            type = type + '-grouped';
        }

        if (type === 'date-eur') {
            type = 'date';
            settings.dateFormat = 'eur';
        }

        if (type === 'date-us') {
            type = 'date';
            settings.dateFormat = 'us';
        }

        if (type === 'birthday-eur') {
            type = 'birthday';
            settings.dateFormat = 'eur';
        }

        if (type === 'birthday-us') {
            type = 'birthday';
            settings.dateFormat = 'us';
        }

        await knex('custom_fields').where('id', field.id).update({type, settings: JSON.stringify(settings)});
    }

    await knex.schema.table('custom_fields', table => {
        table.dropColumn('group_template');
    });
})();


exports.down = (knex, Promise) => (async() => {
})();