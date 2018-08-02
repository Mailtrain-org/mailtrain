exports.up = (knex, Promise) => (async() => {
/* This is shows what it would look like when we specify the "users" table with Knex.
   In some sense, this is probably the most complicated table we have in Mailtrain.

    return knex.schema.hasTable('users'))
        .then(exists => {
            if (!exists) {
                return knex.schema.createTable('users', table => {
                    table.increments('id').primary();
                    table.string('username').notNullable();
                    table.string('password').notNullable();
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

    // Original Mailtrain migration is executed before this one. So here we check that the original migration
    // ended where it should have and we take it from here.
    const row = await knex('settings').where({key: 'db_schema_version'}).first('value');
    if (!row || Number(row.value) !== 29) {
        throw new Error('Unsupported DB schema version: ' + row.value);
    }

    // We have to update data types of primary keys and related foreign keys. Mailtrain uses unsigned int(11), while
    // Knex uses unsigned int (which is unsigned int(10) ).
    await knex.schema
        .raw('ALTER TABLE `attachments` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `attachments` MODIFY `campaign` int unsigned not null')

        .raw('ALTER TABLE `campaign` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `campaign` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaign` MODIFY `segment` int unsigned not null')
        .raw('ALTER TABLE `campaign` MODIFY `subscription` int unsigned not null')

        .raw('ALTER TABLE `campaign_tracker` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaign_tracker` MODIFY `subscriber` int unsigned not null')

        .raw('ALTER TABLE `campaigns` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `campaigns` MODIFY `parent` int unsigned default null')
        .raw('ALTER TABLE `campaigns` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaigns` MODIFY `segment` int unsigned default null')
        .raw('ALTER TABLE `campaigns` MODIFY `template` int unsigned not null')

        .raw('ALTER TABLE `confirmations` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `confirmations` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `custom_fields` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_fields` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `custom_fields` MODIFY `group` int unsigned default null')

        .raw('ALTER TABLE `custom_forms` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_forms` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `custom_forms_data` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_forms_data` MODIFY `form` int unsigned not null')

        .raw('ALTER TABLE `import_failed` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `import_failed` MODIFY `import` int unsigned not null')

        .raw('ALTER TABLE `importer` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `importer` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `links` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `links` MODIFY `campaign` int unsigned not null')

        .raw('ALTER TABLE `lists` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `queued` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `queued` MODIFY `campaign` int unsigned not null')
        .raw('ALTER TABLE `queued` MODIFY `subscriber` int unsigned not null')

        .raw('ALTER TABLE `reports` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `reports` MODIFY `report_template` int unsigned not null')

        .raw('ALTER TABLE `report_templates` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `rss` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `rss` MODIFY `parent` int unsigned not null')
        .raw('ALTER TABLE `rss` MODIFY `campaign` int unsigned default null')

        .raw('ALTER TABLE `segment_rules` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `segment_rules` MODIFY `segment` int unsigned not null')

        .raw('ALTER TABLE `segments` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `segments` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `subscription` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `templates` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `trigger` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `trigger` MODIFY `subscription` int unsigned not null')

        .raw('ALTER TABLE `triggers` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `triggers` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `triggers` MODIFY `source_campaign` int unsigned default null')
        .raw('ALTER TABLE `triggers` MODIFY `dest_campaign` int unsigned default null')

        .raw('ALTER TABLE `users` MODIFY `id` int unsigned not null auto_increment');
})();

exports.down = (knex, Promise) => (async() => {
})();