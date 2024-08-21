exports.up = (knex, Promise) => (async() => {

    const templatesWithUnsupportedType = await knex('templates').whereNotIn('type', ['codeeditor', 'mosaico', 'mosaicoWithFsTemplate']);
    if (templatesWithUnsupportedType.length) {
        throw new Error("Only the following template types are supported in v3: codeeditor, mosaico, mosaicoWithFsTemplate. Templates of other types found. Migration not possible. Check all \"templates\" that have other \"type\" than the three listed using an SQL statement: SELECT id FROM `templates` where `type` not in ('codeeditor', 'mosaico', 'mosaicoWithFsTemplate');");
    }

    const campaignsWithSourceURL = await knex('campaigns').where('source', 5);
    if (campaignsWithSourceURL.length) {
        throw new Error('Campaigns with source type "URL" have been deprecated. Migration not possible. Check all "campaigns" that have "source" equal to 5 using an SQL statement: SELECT id FROM `campaigns` where `source` = 5;');
    }

    const campaignsNotRegular = await knex('campaigns').where('type', '<>', 1);
    if (campaignsNotRegular.length) {
        throw new Error('Only regular campaigns are supported in v3. Campaigns of other types found. Migration not possible. Check all "campaigns" that have "type" not equal to 1 using an SQL statement: SELECT id FROM `campaigns` where `type` <> 1;');
    }

    const campaignsWithIncorrectStatus = await knex('campaigns').whereIn('status', [5, 6]);
    if (campaignsWithIncorrectStatus.length) {
        throw new Error('Campaigns with status belonging to RSS and Triggered campaigns found. Migration not possible. Check all "campaigns" that have "status" equal to 5 or 6 using an SQL statement: SELECT id FROM `campaigns` where `status` IN (5, 6);');
    }

    await knex('campaigns').where('status', 7).update({ status: 5 }); // SENDING
    await knex('campaigns').where('status', 8).update({ status: 6 }); // PAUSING

    const messagesWithIncorrectType = await knex('queued').where('type', 1);
    if (messagesWithIncorrectType.length) {
        throw new Error('Queued message with type TRIGGERRED found. Migration not possible. Check all "queued" messages that have "type" equal to 1 using an SQL statement: SELECT id FROM `queued` where `type` = 1;');
    }

    await knex('queued').where('type', 2).update({ type: 1 }); // TEST
    await knex('queued').where('type', 3).update({ type: 2 }); // SUBSCRIPTION
    await knex('queued').where('type', 4).update({ type: 3 }); // API_TRANSACTIONAL

    await knex.schema.table('campaigns', table => {
        table.dropColumn('parent');
        table.dropColumn('last_check');
        table.dropColumn('type');
    });

    await knex.schema.dropTableIfExists('shares_report');
    await knex.schema.dropTableIfExists('shares_report_template');
    await knex.schema.dropTableIfExists('permissions_report');
    await knex.schema.dropTableIfExists('permissions_report_template');
    await knex.schema.dropTableIfExists('reports');
    await knex.schema.dropTableIfExists('report_templates');
    await knex.schema.dropTableIfExists('trigger_messages');
    await knex.schema.dropTableIfExists('triggers');
    await knex.schema.dropTableIfExists('rss');
})();

exports.down = (knex, Promise) => (async() => {
})();
