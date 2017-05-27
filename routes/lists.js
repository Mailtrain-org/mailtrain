'use strict';

let config = require('config');
let openpgp = require('openpgp');
let passport = require('../lib/passport');
let express = require('express');
let router = new express.Router();
let lists = require('../lib/models/lists');
let subscriptions = require('../lib/models/subscriptions');
let fields = require('../lib/models/fields');
let forms = require('../lib/models/forms');
let tools = require('../lib/tools');
let striptags = require('striptags');
let htmlescape = require('escape-html');
let multer = require('multer');
let os = require('os');
let humanize = require('humanize');
let mkdirp = require('mkdirp');
let pathlib = require('path');
let log = require('npmlog');
let _ = require('../lib/translate')._;
let util = require('util');

let uploadStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        log.verbose('tmpdir', os.tmpdir());
        let tmp = config.www.tmpdir || os.tmpdir();
        let dir = pathlib.join(tmp, 'mailtrain');
        mkdirp(dir, err => {
            if (err) {
                log.error('Upload', err);
                log.verbose('Upload', 'Storing upload to <%s>', tmp);
                return callback(null, tmp);
            }
            log.verbose('Upload', 'Storing upload to <%s>', dir);
            callback(null, dir);
        });
    }
});
let uploads = multer({
    storage: uploadStorage
});

let csvparse = require('csv-parse');
let fs = require('fs');
let moment = require('moment-timezone');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('lists');
    next();
});

router.get('/', (req, res) => {
    res.render('lists/lists', {
        title: _('Lists')
    });
});

router.get('/create', passport.csrfProtection, (req, res) => {
    let data = tools.convertKeys(req.query, {
        skip: ['layout']
    });

    data.csrfToken = req.csrfToken();

    if (!('publicSubscribe' in data)) {
        data.publicSubscribe = true;
    }

    res.render('lists/create', data);
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.create(req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create list'));
            return res.redirect('/lists/create?' + tools.queryParams(req.body));
        }
        req.flash('success', _('List created'));
        res.redirect('/lists/view/' + id);
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        forms.list(list.id, (err, customForms) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/lists');
            }

            list.customForms = customForms.map(row => {
                row.selected = list.defaultForm === row.id;
                return row;
            });

            list.csrfToken = req.csrfToken();
            res.render('lists/edit', list);
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.update(req.body.id, req.body, (err, updated) => {

        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('List settings updated'));
        } else {
            req.flash('info', _('List settings not updated'));
        }

        if (req.query.next) {
            return res.redirect(req.query.next);
        } else if (req.body.id) {
            return res.redirect('/lists/edit/' + encodeURIComponent(req.body.id));
        } else {
            return res.redirect('/lists');
        }
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('List deleted'));
        } else {
            req.flash('info', _('Could not delete specified list'));
        }

        return res.redirect('/lists');
    });
});

router.post('/ajax', (req, res) => {
    lists.filter(req.body, Number(req.query.parent) || false, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                '<span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> <a href="/lists/view/' + row.id + '">' + htmlescape(row.name || '') + '</a>',
                '<code>' + row.cid + '</code>',
                row.subscribers,
                htmlescape(striptags(row.description) || ''),
                '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/lists/edit/' + row.id + '">' + _('Edit') + '</a>' ]
            )
        });
    });
});


router.post('/ajax/:id', (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            return res.json({
                error: err && err.message || err || _('List not found'),
                data: []
            });
        }

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            let columns = ['#', 'email', 'first_name', 'last_name'].concat(fieldList.filter(field => field.visible).map(field => field.column)).concat(['status', 'created']);

            subscriptions.filter(list.id, req.body, columns, req.query.segment, (err, data, total, filteredTotal) => {
                if (err) {
                    return res.json({
                        error: err.message || err,
                        data: []
                    });
                }

                data.forEach(row => {
                    row.subscriptionStatus = row.status === 1 ? true : false;
                    row.customFields = fields.getRow(fieldList, row);
                });

                let statuses = [_('Unknown'), _('Subscribed'), _('Unsubscribed'), _('Bounced'), _('Complained')];

                res.json({
                    draw: req.body.draw,
                    recordsTotal: total,
                    recordsFiltered: filteredTotal,
                    data: data.map((row, i) => [
                        (Number(req.body.start) || 0) + 1 + i,
                        htmlescape(row.email || ''),
                        htmlescape(row.firstName || ''),
                        htmlescape(row.lastName || '')
                    ].concat(fields.getRow(fieldList, row).map(cRow => {
                        if (cRow.type === 'number') {
                            return htmlescape(cRow.value && humanize.numberFormat(cRow.value, 0) || '');
                        } else if (cRow.type === 'longtext') {
                            let value = (cRow.value || '');
                            if (value.length > 50) {
                                value = value.substr(0, 47).trim() + '…';
                            }
                            return htmlescape(value);
                        } else if (cRow.type === 'gpg') {
                            let value = (cRow.value || '').trim();
                            try {
                                value = openpgp.key.readArmored(value);
                                if (value) {

                                    let keys = value.keys;
                                    for (let i = 0; i < keys.length; i++) {
                                        let key = keys[i];
                                        switch (key.verifyPrimaryKey()) {
                                            case 0:
                                                return _('Invalid key');
                                            case 1:
                                                return _('Expired key');
                                            case 2:
                                                return _('Revoked key');
                                        }
                                    }

                                    value = value.keys && value.keys[0] && value.keys[0].primaryKey.fingerprint;
                                    if (value) {
                                        value = '0x' + value.substr(-16).toUpperCase();
                                    }
                                }
                            } catch (E) {
                                value = 'parse error';
                            }
                            return htmlescape(value || '');
                        } else {
                            return htmlescape(cRow.value || '');
                        }
                    })).concat(statuses[row.status]).concat(row.created && row.created.toISOString ? '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>' : 'N/A').concat('<a href="/lists/subscription/' + list.id + '/edit/' + row.cid + '">' + _('Edit') + '</a>'))
                });
            });
        });
    });
});

router.get('/view/:id', passport.csrfProtection, (req, res) => {
    if (Number(req.query.segment) === -1) {
        return res.redirect('/segments/' + encodeURIComponent(req.params.id) + '/create');
    }

    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.listImports(list.id, (err, imports) => {
            if (err) {
                // not important, ignore
                imports = [];
            }

            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                list.imports = imports.map((entry, i) => {
                    entry.index = i + 1;
                    entry.importType = entry.type === 1 ? _('Subscribe') : _('Unsubscribe');
                    switch (entry.status) {
                        case 0:
                            entry.importStatus = _('Initializing');
                            break;
                        case 1:
                            entry.importStatus = _('Initialized');
                            break;
                        case 2:
                            entry.importStatus = _('Importing') + '…';
                            break;
                        case 3:
                            entry.importStatus = _('Finished');
                            break;
                        default:
                            entry.importStatus = _('Errored') + (entry.error ? ' (' + entry.error + ')' : '');
                            entry.error = true;
                    }
                    entry.created = entry.created && entry.created.toISOString();
                    entry.finished = entry.finished && entry.finished.toISOString();
                    entry.updated = entry.processed - entry.new;
                    entry.processed = humanize.numberFormat(entry.processed, 0);
                    return entry;
                });
                list.csrfToken = req.csrfToken();
                list.customFields = fieldList.filter(field => field.visible);
                list.customSort = list.customFields.length ? ',' + list.customFields.map(() => '0').join(',') : '';

                list.showSubscriptions = req.query.tab === 'subscriptions' || !req.query.tab;
                list.showImports = req.query.tab === 'imports';

                list.segments.forEach(segment => {
                    if (segment.id === (Number(req.query.segment) || 0)) {
                        segment.selected = true;
                        list.useSegment = req.query.segment;
                        list.segment = segment.id;
                    }
                });

                res.render('lists/view', list);
            });
        });
    });
});

router.get('/subscription/:id/add', passport.csrfProtection, (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            let data = tools.convertKeys(req.query, {
                skip: ['layout']
            });

            data.list = list;
            data.csrfToken = req.csrfToken();

            data.customFields = fields.getRow(fieldList, data, false, true);
            data.useEditor = true;

            data.timezones = moment.tz.names().map(tz => {
                let selected = false;
                if (tz.toLowerCase().trim() === (data.tz || 'UTC').toLowerCase().trim()) {
                    selected = true;
                }
                return {
                    key: tz,
                    value: tz,
                    selected
                };
            });

            res.render('lists/subscription/add', data);
        });
    });
});

router.get('/subscription/:id/edit/:cid', passport.csrfProtection, (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.get(list.id, req.params.cid, (err, subscription) => {
            if (err || !subscription) {
                req.flash('danger', err && err.message || err || _('Could not find subscriber with specified ID'));
                return res.redirect('/lists/view/' + req.params.id);
            }

            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                subscription.list = list;
                subscription.csrfToken = req.csrfToken();

                subscription.customFields = fields.getRow(fieldList, subscription, false, true);
                subscription.useEditor = true;
                subscription.isSubscribed = subscription.status === 1;

                let tzfound = false;
                subscription.timezones = moment.tz.names().map(tz => {
                    let selected = false;
                    if (tz.toLowerCase().trim() === (subscription.tz || '').toLowerCase().trim()) {
                        selected = true;
                        tzfound = true;
                    }
                    return {
                        key: tz,
                        value: tz,
                        selected
                    };
                });
                if (!tzfound && subscription.tz) {
                    subscription.timezones.push({
                        key: subscription.tz,
                        value: subscription.tz,
                        selected: true
                    });
                }

                res.render('lists/subscription/edit', subscription);
            });
        });
    });
});

router.post('/subscription/add', passport.parseForm, passport.csrfProtection, (req, res) => {
    subscriptions.insert(req.body.list, false, req.body, (err, response) => {
        if (err) {
            req.flash('danger', err && err.message || err || _('Could not add subscription'));
            return res.redirect('/lists/subscription/' + encodeURIComponent(req.body.list) + '/add?' + tools.queryParams(req.body));
        }

        if (response.entryId) {
            req.flash('success', util.format(_('%s was successfully added to your list'), req.body.email));
        } else {
            req.flash('warning', util.format(_('%s was not added to your list'), req.body.email));
        }

        res.redirect('/lists/subscription/' + encodeURIComponent(req.body.list) + '/add');
    });
});

router.post('/subscription/unsubscribe', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.body.list, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.get(list.id, req.body.cid, (err, subscription) => {
            if (err || !subscription) {
                req.flash('danger', err && err.message || err || _('Could not find subscriber with specified ID'));
                return res.redirect('/lists/view/' + list.id);
            }

            subscriptions.unsubscribe(list.id, subscription.email, false, err => {
                if (err) {
                    req.flash('danger', err && err.message || err || _('Could not unsubscribe user'));
                    return res.redirect('/lists/subscription/' + list.id + '/edit/' + subscription.cid);
                }
                req.flash('success', util.format(_('%s was successfully unsubscribed from your list'), subscription.email));
                res.redirect('/lists/view/' + list.id);
            });
        });
    });
});

router.post('/subscription/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.body.list, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.delete(list.id, req.body.cid, (err, email) => {
            if (err || !email) {
                req.flash('danger', err && err.message || err || _('Could not find subscriber with specified ID'));
                return res.redirect('/lists/view/' + list.id);
            }

            req.flash('success', util.format(_('%s was successfully removed from your list'), email));
            res.redirect('/lists/view/' + list.id);
        });
    });
});

router.post('/subscription/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    req.body['is-test'] = req.body['is-test'] ? '1' : '0';
    subscriptions.update(req.body.list, req.body.cid, req.body, true, (err, updated) => {

        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                req.flash('danger', util.format(_('Another subscriber with email address %s already exists'), req.body.email));
                return res.redirect('/lists/subscription/' + encodeURIComponent(req.body.list) + '/edit/' + req.body.cid);
            } else {
                req.flash('danger', err.message || err);
            }

        } else if (updated) {
            req.flash('success', _('Subscription settings updated'));
        } else {
            req.flash('info', _('Subscription settings not updated'));
        }

        if (req.body.list) {
            return res.redirect('/lists/view/' + encodeURIComponent(req.body.list));
        } else {
            return res.redirect('/lists');
        }
    });
});

router.get('/subscription/:id/import', passport.csrfProtection, (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        let data = tools.convertKeys(req.query, {
            skip: ['layout']
        });

        if (!('delimiter' in data)) {
            data.delimiter = ',';
        }

        data.list = list;
        data.csrfToken = req.csrfToken();

        res.render('lists/subscription/import', data);
    });
});

router.get('/subscription/:id/import/:importId', passport.csrfProtection, (req, res) => {
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.getImport(req.params.id, req.params.importId, (err, data) => {
            if (err || !data) {
                req.flash('danger', err && err.message || err || _('Could not find import data with specified ID'));
                return res.redirect('/lists');
            }

            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                data.list = list;
                data.csrfToken = req.csrfToken();

                data.customFields = fields.getRow(fieldList, data);

                res.render('lists/subscription/import-preview', data);
            });
        });
    });
});

router.post('/subscription/import', uploads.single('listimport'), passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.body.list, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        let delimiter = (req.body.delimiter || '').trim().charAt(0) || ',';

        getPreview(req.file.path, req.file.size, delimiter, (err, rows) => {
            if (err) {
                req.flash('danger', err && err.message || err || _('Could not process CSV'));
                return res.redirect('/lists');
            } else {

                subscriptions.createImport(list.id, req.body.type === 'subscribed' ? 1 : 2, req.file.path, req.file.size, delimiter, req.body.emailcheck === 'enabled' ? 1 : 0, {
                    columns: rows[0],
                    example: rows[1] || []
                }, (err, importId) => {
                    if (err) {
                        req.flash('danger', err && err.message || err || _('Could not create importer'));
                        return res.redirect('/lists');
                    }

                    return res.redirect('/lists/subscription/' + list.id + '/import/' + importId);
                });
            }
        });
    });
});

function getPreview(path, size, delimiter, callback) {
    delimiter = (delimiter || '').trim().charAt(0) || ',';
    size = Number(size);

    fs.open(path, 'r', (err, fd) => {
        if (err) {
            return callback(err);
        }

        let bufLen = size;
        let maxReadSize = 10 * 1024;

        if (size > maxReadSize) {
            bufLen = maxReadSize;
        }

        let buffer = new Buffer(bufLen);
        fs.read(fd, buffer, 0, buffer.length, 0, (err, bytesRead, buffer) => {
            if (err) {
                return callback(err);
            }

            let input = buffer.toString().trim();


            if (size !== bufLen) {
                // remove last incomplete line
                input = input.split(/\r?\n/);
                input.pop();
                input = input.join('\n');
            }

            csvparse(input, {
                comment: '#',
                delimiter
            }, (err, data) => {
                fs.close(fd, () => {
                    // just ignore
                });
                if (!data || !data.length) {
                    return callback(null, new Error(_('Empty file')));
                }
                callback(err, data);
            });
        });
    });
}

router.post('/subscription/import-confirm', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.body.list, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.getImport(list.id, req.body.import, (err, data) => {
            if (err || !list) {
                req.flash('danger', err && err.message || err || _('Could not find import data with specified ID'));
                return res.redirect('/lists');
            }

            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                let allowedColumns = ['email', 'first_name', 'last_name', 'tz'];
                fieldList.forEach(field => {
                    if (field.column) {
                        allowedColumns.push(field.column);
                    }
                    if (field.options) {
                        field.options.forEach(subField => {
                            if (subField.column) {
                                allowedColumns.push(subField.column);
                            }
                        });
                    }
                });

                data.mapping.mapping = {};
                data.mapping.columns.forEach((column, i) => {
                    let colIndex = allowedColumns.indexOf(req.body['column-' + i]);
                    if (colIndex >= 0) {
                        data.mapping.mapping[allowedColumns[colIndex]] = i;
                    }
                });

                subscriptions.updateImport(list.id, req.body.import, {
                    status: 1,
                    mapping: JSON.stringify(data.mapping)
                }, (err, importer) => {
                    if (err || !importer) {
                        req.flash('danger', err && err.message || err || _('Could not find import data with specified ID'));
                        return res.redirect('/lists');
                    }

                    req.flash('success', _('Import started'));
                    res.redirect('/lists/view/' + list.id + '?tab=imports');
                });
            });
        });
    });
});

router.post('/subscription/import-restart', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.body.list, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.updateImport(list.id, req.body.import, {
            status: 1,
            error: null,
            finished: null,
            processed: 0,
            new: 0,
            failed: 0
        }, (err, importer) => {
            if (err || !importer) {
                req.flash('danger', err && err.message || err || _('Could not find import data with specified ID'));
                return res.redirect('/lists');
            }

            req.flash('success', _('Import restarted'));
            res.redirect('/lists/view/' + list.id + '?tab=imports');
        });
    });
});

router.get('/subscription/:id/import/:importId/failed', (req, res) => {
    let start = 0;
    lists.get(req.params.id, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find list with specified ID'));
            return res.redirect('/lists');
        }

        subscriptions.getImport(req.params.id, req.params.importId, (err, data) => {
            if (err || !data) {
                req.flash('danger', err && err.message || err || _('Could not find import data with specified ID'));
                return res.redirect('/lists');
            }
            subscriptions.getFailedImports(req.params.importId, (err, rows) => {
                if (err) {
                    req.flash('danger', err && err.message || err);
                    return res.redirect('/lists');
                }

                data.rows = rows.map((row, i) => {
                    row.index = start + i + 1;
                    return row;
                });
                data.list = list;

                res.render('lists/subscription/import-failed', data);
            });
        });
    });
});

router.post('/quicklist/ajax', (req, res) => {
    lists.filterQuicklist(req.body, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => ({
                "0": (Number(req.body.start) || 0) + 1 + i,
                "1": '<span class="glyphicon glyphicon-inbox" aria-hidden="true"></span> <a href="/lists/view/' + row.id + '">' + htmlescape(row.name || '') + '</a>',
                "2": row.subscribers,
                "DT_RowId": row.id
            }))
        });
    });
});

module.exports = router;
