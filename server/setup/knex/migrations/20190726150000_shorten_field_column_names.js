const shortid = require('shortid');

exports.up = (knex, Promise) => (async() => {
    const fields = await knex('custom_fields').whereNotNull('column');

    for (const field of fields) {
        const listId = field.list;
        const oldName = field.column;
        const newName = ('custom_' + '_' + shortid.generate()).toLowerCase().replace(/[^a-z0-9_]/g, '_');

        await knex('custom_fields').where('id', field.id).update('column', newName);

        await knex.schema.table('subscription__' + listId, table => {
            table.renameColumn(oldName, newName);
            table.renameColumn('source_' + oldName, 'source_' + newName);
        });
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
