exports.up = (knex, Promise) => (async() => {
    await knex.schema.table('users', table => {
        // name and password can be null in case of LDAP login
        table.string('name');
        table.string('password').alter();
    });

    await knex('users').where('id', 1 /* Admin user id */).update({
        name: 'Administrator'
    });
})();

exports.down = (knex, Promise) => (async() => {
})();