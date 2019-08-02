exports.up = (knex, Promise) => (async() => {
    await knex.schema.raw('ALTER TABLE `campaign_messages` ADD `hash_email` char(88) CHARACTER SET ascii');
    await knex.schema.raw('ALTER TABLE `campaign_messages` ADD UNIQUE KEY `campaign_hash_email` (`campaign`, `hash_email`)');
    await knex.schema.raw('ALTER TABLE `campaign_messages` DROP KEY `created`');
    await knex.schema.raw('ALTER TABLE `campaign_links` DROP KEY `created_index`');

    const lists = await knex('lists');
    for (const list of lists) {
        await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` MODIFY `hash_email` char(88) CHARACTER SET ascii');
        await knex.raw('update `campaign_messages` inner join `subscription__' + list.id + '` on `campaign_messages`.`list`=' + list.id + ' and `campaign_messages`.`subscription`=`subscription__' + list.id + '`.`id` set `campaign_messages`.`hash_email`=`subscription__' + list.id + '`.`hash_email`');
    }

    await knex('campaign_messages').whereNull('hash_email').del();
})();

exports.down = (knex, Promise) => (async() => {
})();
