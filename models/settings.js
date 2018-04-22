'use strict';

const knex = require('../lib/knex');
const shares = require('./shares');

const allowedKeys = new Set(['adminEmail', 'uaCode', 'pgpPassphrase', 'pgpPrivateKey', 'defaultHomepage']);
// defaultHomepage is used as a default to list.homepage - if the list.homepage is not filled in

async function get(context, keyOrKeys) {
    shares.enforceGlobalPermission(context, 'manageSettings');

    let keys;
    if (!keyOrKeys) {
        keys = allowedKeys.values();
    } else if (!Array.isArray(keyOrKeys)) {
        keys = [ keys ];
    } else {
        keys = keyOrKeys;
    }

    const rows = await knex('settings').select(['key', 'value']).whereIn('key', keys);

    const settings = {};
    for (const row of rows) {
        settings[row.key] = row.value;
    }

    if (!Array.isArray(keyOrKeys)) {
        return settings[keyOrKeys];
    } else {
        return settings;
    }
}

async function set(context, data) {
    shares.enforceGlobalPermission(context, 'manageSettings');

    for (const key in data) {
        if (allowedKeys.has(key)) {
            const value = data[key];
            try {
                await knex('settings').insert({key, value});
            } catch (err) {
                await knex('settings').where('key', key).update('value', value);
            }
        }
    }
}

module.exports = {
    get,
    set
};

