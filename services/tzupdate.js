'use strict';

// This script re-calculates timezone offsets once a day.
// We need this to be able to send messages using subscriber's local time
// The best option would be to use built-in timezone data of MySQL but
// the availability of timezone data is not guaranteed as it's an optional add on.
// So instead we keep a list of timezone offsets in a table that we can use to
// JOIN with subscription table. Subscription table includes timezone name for
// a subscriber and tzoffset table includes offset from UTC in minutes

let moment = require('moment-timezone');
let db = require('../lib/db');
let log = require('npmlog');
let lastCheck = false;

const timezone_timeout = 60 * 60 * 1000;

function updateTimezoneOffsets(callback) {
    log.verbose('UTC', 'Updating timezone offsets');
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let values = [];
        moment.tz.names().forEach(tz => {
            let time = moment();
            values.push('(' + connection.escape(tz.toLowerCase().trim()) + ',' + connection.escape(time.tz(tz).utcOffset()) + ')');
        });

        let query = 'INSERT INTO tzoffset (`tz`, `offset`) VALUES ' + values.join(', ') + ' ON DUPLICATE KEY UPDATE `offset` = VALUES(`offset`)';

        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        });
    });
}

module.exports = callback => {
    updateTimezoneOffsets(err => {
        if (err) {
            return callback(err);
        }
        let checkLoop = () => {
            let curUtcDate = new Date().toISOString().split('T').shift();
            if (curUtcDate !== lastCheck) {
                updateTimezoneOffsets(err => {
                    if (err) {
                        log.error('UTC', err);
                    }
                    setTimeout(checkLoop, timezone_timeout);
                });
            } else {
                setTimeout(checkLoop, timezone_timeout);
            }
            lastCheck = curUtcDate;
        };
        setTimeout(checkLoop, timezone_timeout);
        callback(null, true);
    });
};
