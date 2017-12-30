"use strict";

exports.up = (knex, Promise) => (async() => {
    await knex('settings').where('key', 'dbSchemaVersion').del();
})();


exports.down = (knex, Promise) => (async() => {
})();