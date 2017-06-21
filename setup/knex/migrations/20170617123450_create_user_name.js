exports.up = function(knex, Promise) {
    return knex.schema.table('users', table => {
        table.string('name');
    })
};

exports.down = function(knex, Promise) {
};