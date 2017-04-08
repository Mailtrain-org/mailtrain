'use strict';

let log = require('npmlog');

let db = require('../lib/db');
let tools = require('../lib/tools');
let _ = require('../lib/translate')._;

let fields = require('../lib/models/fields');
let subscriptions = require('../lib/models/subscriptions');
let fs = require('fs');
let csvparse = require('csv-parse');

const process_timout = 5 * 1000;

function findUnprocessed(callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let query = 'SELECT * FROM importer WHERE `status`=1 LIMIT 1';
        connection.query(query, (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            if (!rows || !rows.length) {
                connection.release();
                return callback(null, false);
            }

            let importer = rows[0];

            let query = 'UPDATE importer SET `status`=2, `processed`=0 WHERE id=? AND `status`=1 LIMIT 1';
            connection.query(query, [importer.id], (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                if (!result.affectedRows) {
                    // check next one
                    return findUnprocessed(callback);
                }

                let importer = tools.convertKeys(rows[0]);
                try {
                    importer.mapping = JSON.parse(importer.mapping);
                } catch (E) {
                    importer.mapping = {
                        columns: [],
                        mapping: {}
                    };
                }

                return callback(null, importer);
            });
        });
    });
}

function processImport(data, callback) {
    let parser = csvparse({
        comment: '#',
        delimiter: data.delimiter
    });

    let listId = data.list;

    fields.list(data.list, (err, fieldList) => {
        if (err && !fieldList) {
            fieldList = [];
        }

        let firstRow;
        let finished = false;
        let inputStream = fs.createReadStream(data.path);
        let fieldTypes = {};

        fieldList.forEach(field => {
            if (field.column) {
                fieldTypes[field.column] = field.type;
            }
            if (field.options) {
                field.options.forEach(subField => {
                    if (subField.column) {
                        fieldTypes[subField.column] = subField.type;
                    }
                });
            }
        });

        inputStream.on('error', err => {
            if (finished) {
                return;
            }
            log.error('Import', err.stack);
            finished = true;
            return callback(err);
        });

        parser.on('error', err => {
            if (finished) {
                return;
            }
            log.error('Import', err.stack);
            finished = true;
            return callback(err);
        });

        let processing = false;
        let processRows = () => {
            let record = parser.read();
            if (record === null) {
                processing = false;
                return;
            }
            processing = true;

            if (!firstRow) {
                firstRow = record;
                return setImmediate(processRows);
            }

            let entry = {};
            Object.keys(data.mapping.mapping || {}).forEach(key => {
                // TODO: process all data types
                if (fieldTypes[key] === 'option') {
                    entry[key] = ['', '0', 'false', 'no', 'null'].indexOf((record[data.mapping.mapping[key]] || '').toString().toLowerCase().trim()) < 0 ? 1 : 0;
                } else if (fieldTypes[key] === 'number') {
                    entry[key] = Number(record[data.mapping.mapping[key]]) || 0;
                } else {
                    entry[key] = (record[data.mapping.mapping[key]] || '').toString().trim() || null;
                }
            });

            if (!entry.email) {
                log.verbose('Import', 'Failed processing row, email missing');
                return setImmediate(processRows);
            }

            function insertToSubscription() {
              subscriptions.insert(listId, {
                  imported: data.id,
                  status: data.type,
                  partial: true
              }, entry, (err, response) => {
                  if (err) {
                      // ignore
                      log.error('Import', err.stack);
                  } else if (response.entryId) {
                      //log.verbose('Import', 'Inserted %s as %s', entry.email, entryId);
                  }

                  db.getConnection((err, connection) => {
                      if (err) {
                          log.error('Import', err.stack);
                          return setImmediate(processRows);
                      }

                      let query;
                      if (response.inserted) {
                          // this record did not exist before, count as new
                          query = 'UPDATE importer SET `processed`=`processed`+1, `new`=`new`+1 WHERE `id`=? LIMIT 1';
                      } else {
                          // it's an existing record
                          query = 'UPDATE importer SET `processed`=`processed`+1 WHERE `id`=? LIMIT 1';
                      }

                      connection.query(query, [data.id], () => {
                          connection.release();
                          return setImmediate(processRows);
                      });
                  });
              });
            }

            if (data.emailcheck === 1) {
            tools.validateEmail(entry.email, true, err => {
                if (err) {
                    let reason = (err.message || '').toString().trim().replace(/^[a-z]Error:\s*/i, '');
                    log.verbose('Import', 'Failed processing row %s: %s', entry.email, reason);
                    db.getConnection((err, connection) => {
                        if (err) {
                            log.error('Import', err.stack);
                            return setImmediate(processRows);
                        }

                        let query = 'INSERT INTO import_failed (`import`, `email`, `reason`) VALUES(?,?,?)';
                        connection.query(query, [data.id, entry.email, reason], err => {
                            if (err) {
                                connection.release();
                                return setImmediate(processRows);
                            }
                            let query = 'UPDATE importer SET `failed`=`failed`+1 WHERE `id`=? LIMIT 1';
                            connection.query(query, [data.id], () => {
                                connection.release();
                                return setImmediate(processRows);
                            });
                        });
                    });
                    return;
                }
                insertToSubscription();
            });
          } else {
            insertToSubscription();
          }
        };

        parser.on('readable', () => {
            if (finished || processing) {
                return;
            }
            processRows();
        });

        parser.on('finish', () => {
            if (finished) {
                return;
            }
            finished = true;
            callback(null, true);
        });

        inputStream.pipe(parser);
    });
}

let importLoop = () => {
    let getNext = () => {
        // find an unsent message
        findUnprocessed((err, data) => {
            if (err) {
                log.error('Import', err.stack);
                setTimeout(getNext, process_timout);
                return;
            }
            if (!data) {
                setTimeout(getNext, process_timout);
                return;
            }

            processImport(data, err => {
                let failed = null;
                if (err) {
                    if (err.code === 'ENOENT') {
                        failed = _('Could not access import file');
                    } else {
                        failed = err.message || err;
                    }
                }

                db.getConnection((err, connection) => {
                    if (err) {
                        log.error('Import', err.stack);
                        return setTimeout(getNext, process_timout);
                    }

                    let query = 'UPDATE importer SET `status`=?, `error`=?, `finished`=NOW() WHERE `id`=? AND `status`=2 LIMIT 1';

                    connection.query(query, [!failed ? 3 : 4, failed, data.id], () => {
                        connection.release();

                        getNext();
                    });
                });
            });
        });
    };
    getNext();
};

module.exports = callback => {
    importLoop();
    setImmediate(callback);
};
