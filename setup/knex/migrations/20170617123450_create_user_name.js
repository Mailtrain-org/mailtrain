exports.up = function(knex, Promise) {
    return knex.schema.table('users', table => {
        // name and password can be null in case of LDAP login
        table.string('name');
        table.string('password').alter();
    })
    .then(() => knex('users').where('id', 1).update({
        name: 'Administrator'
    }));
};

exports.down = function(knex, Promise) {
};