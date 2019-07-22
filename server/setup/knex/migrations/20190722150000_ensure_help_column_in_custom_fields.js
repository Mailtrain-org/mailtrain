exports.up = (knex, Promise) => (async() => {
    // This is to provide upgrade path to stable to those that already have beta installed.
    await knex.schema.raw('ALTER TABLE `custom_fields` ADD COLUMN `help` text AFTER `name`');
})();

exports.down = (knex, Promise) => (async() => {
})();
