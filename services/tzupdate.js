'use strict';

// This script re-calculates timezone offsets once a day

let moment = require('moment-timezone');
let db = require('../lib/db');

function updateTimezoneOffsets(callback) {
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

updateTimezoneOffsets(console.log);
