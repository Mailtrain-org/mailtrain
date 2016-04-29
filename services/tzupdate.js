'use strict';

// This script re-calculates timezone offsets once a day

let moment = require('moment-timezone');
let db = require('../lib/db');
let lastCheck = false;
let log = require('npmlog');

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
                    setTimeout(checkLoop, 60 * 60 * 1000);
                });
            } else {
                setTimeout(checkLoop, 60 * 60 * 1000);
            }
            lastCheck = curUtcDate;
        };
        setTimeout(checkLoop, 60 * 60 * 1000);
        callback(null, true);
    });
};
