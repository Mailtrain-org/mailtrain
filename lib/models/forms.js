'use strict';

let db = require('../db');
let fs = require('fs');
let path = require('path');
let tools = require('../tools');
let mjml = require('mjml');
let _ = require('../translate')._;

let allowedKeys = [
    'name',
    'description',
    'fields_shown_on_subscribe',
    'fields_shown_on_manage',
    'layout',
    'form_input_style',
    'mail_confirm_html',
    'mail_confirm_text',
    'mail_subscription_confirmed_html',
    'mail_subscription_confirmed_text',
    'mail_unsubscribe_confirmed_html',
    'mail_unsubscribe_confirmed_text',
    'web_confirm_notice',
    'web_manage_address',
    'web_manage',
    'web_subscribe',
    'web_subscribed',
    'web_unsubscribe_notice',
    'web_unsubscribe',
    'web_updated_notice'
];

module.exports.list = (listId, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing List ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM custom_forms WHERE list=? ORDER BY id', [listId], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let formList = rows && rows.map(row => tools.convertKeys(row)) || [];
            return callback(null, formList);
        });
    });
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Form ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM custom_forms WHERE id=? LIMIT 1', [id], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            let form = rows && rows[0] && tools.convertKeys(rows[0]) || false;

            if (!form) {
                connection.release();
                return callback(new Error('Selected form not found'));
            }

            connection.query('SELECT * FROM custom_forms_data WHERE form=?', [id], (err, data_rows = []) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                data_rows.forEach(data_row => {
                    let modelKey = tools.fromDbKey(data_row.data_key);
                    form[modelKey] = data_row.data_value;
                });

                return callback(null, form);
            });
        });
    });
};


module.exports.create = (listId, form, callback) => {
    listId = Number(listId) || 0;

    if (listId < 1) {
        return callback(new Error(_('Missing Form ID')));
    }

    form = tools.convertKeys(form);
    form = setDefaultValues(form);
    form.name = (form.name || '').toString().trim();

    if (!form.name) {
        return callback(new Error(_('Form Name must be set')));
    }

    let keys = ['list'];
    let values = [listId];

    Object.keys(form).forEach(key => {
        let value = form[key].trim();
        key = tools.toDbKey(key);
        if (key === 'description') {
            value = tools.purifyHTML(value);
        }
        if (allowedKeys.indexOf(key) >= 0) {
            keys.push(key);
            values.push(value);
        }
    });

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let filtered = filterKeysAndValues(keys, values, 'exclude', ['mail_', 'web_']);
        let query = 'INSERT INTO custom_forms (' + filtered.keys.join(', ') + ') VALUES (' + filtered.values.map(() => '?').join(',') + ')';

        connection.query(query, filtered.values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let formId = result && result.insertId;

            if (!formId) {
                return callback(new Error('Invalid custom_forms insertId'));
            }

            let jobs = 1;
            let error = null;

            let done = err => {
                jobs--;
                error = err ? err : error; // One's enough
                jobs === 0 && callback(error, formId);
            };

            filtered = filterKeysAndValues(keys, values, 'include', ['mail_', 'web_']);

            filtered.keys.forEach((key, index) => {
                jobs++;

                db.getConnection((err, connection) => {
                    if (err) {
                        return done(err);
                    }

                    connection.query('INSERT INTO custom_forms_data (form, data_key, data_value) VALUES (?, ?, ?)', [formId, key, filtered.values[index]], err => {
                        connection.release();
                        if (err) {
                            return done(err);
                        }

                        return done(null);
                    });
                });
            });

            done(null);
        });
    });
};

module.exports.update = (id, updates, callback) => {
    updates = updates || {};
    id = Number(id) || 0;

    updates = tools.convertKeys(updates);

    if (id < 1) {
        return callback(new Error(_('Missing Form ID')));
    }

    if (!(updates.name || '').toString().trim()) {
        return callback(new Error(_('Form Name must be set')));
    }

    let keys = [];
    let values = [];

    Object.keys(updates).forEach(key => {
        let value = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
        key = tools.toDbKey(key);
        if (key === 'description') {
            value = tools.purifyHTML(value);
        }
        if (allowedKeys.indexOf(key) >= 0) {
            keys.push(key);
            values.push(value);
        }
    });

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let filtered = filterKeysAndValues(keys, values, 'exclude', ['mail_', 'web_']);
        let query = 'UPDATE custom_forms SET ' + filtered.keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE id=? LIMIT 1';

        connection.query(query, filtered.values.concat(id), (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let affectedRows = result && result.affectedRows;

            let jobs = 1;
            let error = null;

            let done = err => {
                jobs--;
                error = err ? err : error; // One's enough

                if (jobs === 0) {
                    if (error) {
                        return callback(error);
                    }

                    // Save then validate, as otherwise their work get's lost ...
                    err = testForMjmlErrors(keys, values);
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, affectedRows);
                }
            };

            filtered = filterKeysAndValues(keys, values, 'include', ['mail_', 'web_']);

            filtered.keys.forEach((key, index) => {
                jobs++;

                db.getConnection((err, connection) => {
                    if (err) {
                        return done(err);
                    }

                    connection.query('UPDATE custom_forms_data SET data_value=? WHERE data_key=? AND form=?', [filtered.values[index], key, id], err => {
                        connection.release();
                        if (err) {
                            return done(err);
                        }

                        return done(null);
                    });
                });
            });

            done(null);
        });
    });
};

module.exports.delete = (formId, callback) => {
    formId = Number(formId) || 0;

    if (formId < 1) {
        return callback(new Error(_('Missing Form ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM custom_forms WHERE id=? LIMIT 1', [formId], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            if (!rows || !rows.length) {
                connection.release();
                return callback(new Error(_('Custom form not found')));
            }

            connection.query('DELETE FROM custom_forms WHERE id=? LIMIT 1', [formId], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    });
};

function setDefaultValues(form) {
    let getContents = fileName => {
        try {
            let basePath = path.join(__dirname, '..', '..');
            let template = fs.readFileSync(path.join(basePath, fileName), 'utf8');
            return template.replace(/\{\{#translate\}\}(.*?)\{\{\/translate\}\}/g, (m, s) => _(s));
        } catch (err) {
            return false;
        }
    };

    allowedKeys.forEach(key => {
        let modelKey = tools.fromDbKey(key);
        let base = 'views/subscription/' + key.replace(/_/g, '-');

        if (key.startsWith('mail') || key.startsWith('web')) {
            form[modelKey] = getContents(base + '.mjml.hbs') || getContents(base + '.hbs') || '';
        }
    });

    form.layout = getContents('views/subscription/layout.mjml.hbs') || '';
    form.formInputStyle = getContents('public/subscription/form-input-style.css') || '@import url(/subscription/form-input-style.css);';

    return form;
}

function filterKeysAndValues(keysIn, valuesIn, method = 'include', prefixes = []) {
    let values = [];

    let prefixMatch = key => (
        prefixes.some(prefix => key.startsWith(prefix))
    );

    let keys = keysIn.filter((key, index) => {
        if ((method === 'include' && prefixMatch(key)) || (method === 'exclude' && !prefixMatch(key))) {
            values.push(valuesIn[index]);
            return true;
        }
        return false;
    });

    return {
        keys,
        values
    };
}

function testForMjmlErrors(keys, values) {

    let errors = [];
    let testLayout = '<mjml><mj-body><mj-container>{{{body}}}</mj-container></mj-body></mjml>';

    let hasMjmlError = (template, layout = testLayout) => {
        let source = layout.replace(/\{\{\{body\}\}\}/g, template);
        let compiled;

        try {
            compiled = mjml.mjml2html(source);
        } catch (err) {
            return err;
        }

        if (compiled.errors.length) {
            return compiled.errors[0].message || compiled.errors[0];
        }

        return null;
    };

    keys.forEach((key, index) => {
        if (key.startsWith('mail_') || key.startsWith('web_')) {

            let template = values[index];
            let err = hasMjmlError(template);

            err && errors.push(key + ': ' + (err.message || err));
            key === 'mail_confirm_html' && !template.includes('{{confirmUrl}}') && errors.push(key + ': Missing {{confirmUrl}}');

        } else if (key === 'layout') {

            let layout = values[index];
            let err = hasMjmlError('', layout);

            err && errors.push('layout: ' + (err.message || err));
            !layout.includes('{{{body}}}') && errors.push('layout: {{{body}}} not found');
        }
    });


    if (errors.length) {
        errors.forEach((err, index) => {
            errors[index] = (index + 1) + ') ' + err;
        });
        return 'Please fix these MJML errors:\n\n' + errors.join('\n');
    }

    return null;
}
