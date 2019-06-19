'use strict';

// This script re-calculates timezone offsets once a day.
// We need this to be able to send messages using subscriber's local time
// The best option would be to use built-in timezone data of MySQL but
// the availability of timezone data is not guaranteed as it's an optional add on.
// So instead we keep a list of timezone offsets in a table that we can use to
// JOIN with subscription table. Subscription table includes timezone name for
// a subscriber and tzoffset table includes offset from UTC in minutes

const moment = require('moment-timezone');
const knex = require('../lib/knex');
const log = require('../lib/log');
let lastCheck = false;

const timezone_timeout = 60 * 60 * 1000;

async function updateTimezoneOffsets() {
    log.verbose('UTC', 'Updating timezone offsets');
    const values = [];
    for (const tz of moment.tz.names()) {
        values.push({
            tz: tz.toLowerCase().trim(),
            offset: moment.tz(tz).utcOffset()
        });
    }

    await knex.transaction(async tx => {
        await tx('tzoffset').del();
        await tx('tzoffset').insert(values);
    });
}

function start() {
    let curUtcDate = new Date().toISOString().split('T').shift();
    if (curUtcDate !== lastCheck) {
        updateTimezoneOffsets()
            .then(() => {
                setTimeout(start, timezone_timeout)
            })
            .catch(err => {
                log.error('UTC', err);
                setTimeout(start, timezone_timeout);
            });
    } else {
        setTimeout(start, timezone_timeout);
    }
    lastCheck = curUtcDate;
}

module.exports.start = start;
