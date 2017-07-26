exports.up = function(knex, Promise) {
    return knex.schema.table('users', table => {
        table.string('role');
    });
    /* The user role is set automatically in rebuild permissions, which is called upon every start */
};

exports.down = function(knex, Promise) {
};