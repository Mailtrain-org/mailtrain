exports.up = (knex, Promise) => (async() => {

    // initDb and the Knex CLI admit v2 data before any migration writes.
    await require('../../../lib/migrations').prepareMigrations(knex);

    const shares = require('../../../models/shares');
    const roleUpdates = shares.getV2RoleUpdates(await knex('users').select('id', 'username', 'role'));
    for (const update of roleUpdates) {
        await knex('users').where('id', update.id).update({role: update.role});
    }

    await knex('campaigns').where('status', 7).update({status: 5}); // SENDING
    await knex('campaigns').where('status', 8).update({status: 6}); // PAUSING

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
