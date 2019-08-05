exports.up = (knex, Promise) => (async() => {
    // This is to provide upgrade path to stable to those that already have beta installed.
    try {
        await knex.schema.raw('ALTER TABLE `custom_fields` ADD COLUMN `help` text AFTER `name`');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            // The field is already there, so we can ignore this error
        } else {
            throw err;
        }
    }
})();

exports.down = (knex, Promise) => (async() => {
})();
