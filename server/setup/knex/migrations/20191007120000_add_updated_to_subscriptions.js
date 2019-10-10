exports.up = (knex, Promise) => (async() => {
    const lists = await knex('lists');
    for (const list of lists) {
        await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` ADD COLUMN `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created`');
        await knex.schema.raw('CREATE INDEX updated ON `subscription__' + list.id + '` (`updated`)');
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
