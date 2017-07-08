'use strict';

'use strict';

const knex = require('../lib/knex');
const tools = require('../lib/tools');

async function get(keyOrKeys) {
    let keys;
    if (!Array.isArray(keyOrKeys)) {
        keys = [ keys ];
    } else {
        keys = keyOrKeys;
    }

    keys = keys.map(key => tools.toDbKey(key));

    const result = await knex('settings').whereIn('key', keys);

    const settings = {};
    for (const key of keys) {
        settings[tools.fromDbKey(key)] = result[key];
    }

    if (!Array.isArray(keyOrKeys)) {
        return settings[keyOrKeys];
    } else {
        return settings;
    }
}

async function set(key, value) {
    try {
        await knex('settings').insert({key, value});
    } catch (err) {
        await knex('settings').where('key', key).update('value', value);
    }
}

module.exports = {
    get,
    set
};

