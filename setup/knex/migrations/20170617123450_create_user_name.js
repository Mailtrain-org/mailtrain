exports.up = function(knex, Promise) {
    return knex.schema.table('users', table => {
        table.string('name').notNullable().default('');
    })
    .then(() => knex('users').where('id', 1).update({
        name: 'Administrator'
    }));
};

exports.down = function(knex, Promise) {
};