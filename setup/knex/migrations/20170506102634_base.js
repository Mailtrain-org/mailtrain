exports.up = function(knex, Promise) {
/* This is shows what it would look like when we specify the "users" table with Knex.
   In some sense, this is probably the most complicated table we have in Mailtrain.

    return knex.schema.hasTable('users'))
        .then(exists => {
            if (!exists) {
                return knex.schema.createTable('users', table => {
                    table.increments('id').primary();
                    table.string('username').notNullable().defaultTo('');
                    table.string('password').notNullable().defaultTo('');
                    table.string('email').notNullable();
                    table.string('access_token', 40).index();
                    table.string('reset_token').index();
                    table.dateTime('reset_expire');
                    table.timestamp('created').defaultTo(knex.fn.now());
                })

                // INNODB tables have the limit of 767 bytes for an index.
                // Combined with the charset used, this poses limits on the size of keys. Knex does not offer API
                // for such settings, thus we resort to raw queries.
                .raw('ALTER TABLE `users` MODIFY `email` VARCHAR(255) CHARACTER SET utf8 NOT NULL')
                .raw('ALTER TABLE `users` ADD UNIQUE KEY `email` (`email`)')
                .raw('ALTER TABLE `users` ADD KEY `username` (`username`(191))')
                .raw('ALTER TABLE `users` ADD KEY `check_reset` (`username`(191),`reset_token`,`reset_expire`)')

                .then(() => knex('users').insert({
                    id: 1,
                    username: 'admin',
                    password: '$2a$10$FZV.tFT252o4iiHoZ9b2sOZOc.EBDOcY2.9HNCtNwshtSLf21mB1i',
                    email: 'hostmaster@sathyasai.org'
                }));
            }
        });
*/

    // We should check here if the tables already exist and upgrade them to db_schema_version 28, which is the baseline.
    // For now, we just check whether our DB is up-to-date based on the existing SQL migration infrastructure in Mailtrain.
    return knex('settings').where({key: 'db_schema_version'}).first('value')
        .then(row => {
            if (!row || Number(row.value) !== 29) {
                throw new Error('Unsupported DB schema version: ' + row.value);
            }
        })

        // We have to update data types of primary keys and related foreign keys. Mailtrain uses unsigned int(11), while
        // Knex uses unsigned int (which is unsigned int(10) ).
        .then(() => knex.schema
            .raw('ALTER TABLE `users` MODIFY `id` int unsigned not null auto_increment')
            .raw('ALTER TABLE `lists` MODIFY `id` int unsigned not null auto_increment')
                .raw('ALTER TABLE `confirmations` MODIFY `list` int unsigned not null')
                .raw('ALTER TABLE `custom_fields` MODIFY `list` int unsigned not null')
                .raw('ALTER TABLE `importer` MODIFY `list` int unsigned not null')
                .raw('ALTER TABLE `segments` MODIFY `list` int unsigned not null')
                .raw('ALTER TABLE `triggers` MODIFY `list` int unsigned not null')
                .raw('ALTER TABLE `custom_forms` MODIFY `list` int unsigned not null')
        )

/*
    Remaining foreign keys:
    -----------------------

    links campaign campaigns id
    segment_rules segment segments id
    import_failed import importer id
    rss parent campaigns id
    attachments campaign campaigns id
    custom_forms_data form custom_forms id
    report_template report_template report_templates id
*/
};

exports.down = function(knex, Promise) {
    // return knex.schema.dropTable('users');
};