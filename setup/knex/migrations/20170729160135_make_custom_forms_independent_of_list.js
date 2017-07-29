exports.up = function(knex, Promise) {
    return knex.schema.table('custom_forms', table => {
        table.dropForeign('list', 'custom_forms_ibfk_1');
        table.dropColumn('list');
    })
};

exports.down = function(knex, Promise) {
};