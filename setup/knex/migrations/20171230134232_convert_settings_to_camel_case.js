"use strict";

function fromDbKey(key) {
    let prefix = '';
    if (key.startsWith('_')) {
        key = key.substring(1);
        prefix = '_';

    }
    return prefix + key.replace(/[_-]([a-z])/g, (m, c) => c.toUpperCase());
}

exports.up = (knex, Promise) => (async() => {
    const rows = await knex('settings');

    for (const row of rows) {
        await knex('settings').where('id', row.id).update('key', fromDbKey(row.key))
    }

})();


exports.down = (knex, Promise) => (async() => {
})();