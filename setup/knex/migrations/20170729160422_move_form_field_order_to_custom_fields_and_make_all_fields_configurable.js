"use strict";

exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('custom_fields', table => {
        table.integer('order_subscribe');
        table.integer('order_manage');
        table.integer('order_list');
    });

    await knex.schema.table('subscription', table => {
        table.dropColumn('first_name');
        table.dropColumn('last_name');
    });

    const lists = await knex('lists')
        .leftJoin('custom_forms', 'lists.default_form', 'custom_forms.id')
        .select(['lists.id', 'lists.default_form', 'custom_forms.fields_shown_on_subscribe', 'custom_forms.fields_shown_on_manage']);

    for (const list of lists) {
        const fields = await knex('custom_fields').where('list', list.id).orderBy('id', 'asc');

        const [firstNameFieldId] = await knex('custom_fields').insert({
            list: list.id,
            name: 'First Name',
            key: 'FIRST_NAME',
            type: 'text',
            column: 'first_name',
            visible: 1 // FIXME - Revise the need for this field
        });

        const [lastNameFieldId] = await knex('custom_fields').insert({
            list: list.id,
            name: 'Last Name',
            key: 'LAST_NAME',
            type: 'text',
            column: 'last_name',
            visible: 1 // FIXME - Revise the need for this field
        });

        let orderSubscribe;
        let orderManage;

        const replaceNames = x => {
            if (x === 'firstname') {
                return firstNameFieldId;
            } else if (x === 'lastname') {
                return lastNameFieldId;
            } else {
                return x;
            }
        };

        if (list.default_form) {
            orderSubscribe = list.fields_shown_on_subscribe.split(',').map(replaceNames);
            orderManage = list.fields_shown_on_subscribe.split(',').map(replaceNames);
        } else {
            orderSubscribe = [firstNameFieldId, lastNameFieldId];
            orderManage = [firstNameFieldId, lastNameFieldId];

            for (const fld of fields) {
                if (fld.visible && fld.type !== 'option') {
                    orderSubscribe.push(fld.id);
                    orderManage.push(fld.id);
                }
            }
        }

        const orderList = [firstNameFieldId, lastNameFieldId];

        let idx = 0;
        for (const fldId of orderSubscribe) {
            await knex('custom_fields').where('id', fldId).update({order_subscribe: idx});
            idx += 1;
        }

        idx = 0;
        for (const fldId of orderManage) {
            await knex('custom_fields').where('id', fldId).update({order_manage: idx});
            idx += 1;
        }

        idx = 0;
        for (const fldId of orderList) {
            await knex('custom_fields').where('id', fldId).update({order_list: idx});
            idx += 1;
        }
    }

    await knex.schema.table('custom_forms', table => {
        table.dropColumn('fields_shown_on_subscribe');
        table.dropColumn('fields_shown_on_manage');
    });
})();


exports.down = function(knex, Promise) {
};