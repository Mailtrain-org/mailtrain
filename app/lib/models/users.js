'use strict';

let log = require('npmlog');

let bcrypt = require('bcrypt-nodejs');
let db = require('../db');
let tools = require('../tools');
let mailer = require('../mailer');
let settings = require('./settings');
let crypto = require('crypto');
let urllib = require('url');
let _ = require('../translate')._;

/**
 * Fetches user by ID value
 *
 * @param {Number} id User id
 * @param {Function} callback Return an error or an user object
 */
module.exports.get = (id, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT `id`, `username`, `email`, `access_token` FROM `users` WHERE `id`=? LIMIT 1', [id], (err, rows) => {
            connection.release();

            if (err) {
                return callback(err);
            }

            if (!rows.length) {
                return callback(null, false);
            }

            let user = tools.convertKeys(rows[0]);
            return callback(null, user);
        });
    });
};

module.exports.findByAccessToken = (accessToken, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT `id`, `username`, `email`, `access_token` FROM `users` WHERE `access_token`=? LIMIT 1', [accessToken], (err, rows) => {
            connection.release();

            if (err) {
                return callback(err);
            }

            if (!rows.length) {
                return callback(null, false);
            }

            let user = tools.convertKeys(rows[0]);
            return callback(null, user);
        });
    });
};

module.exports.findByUsername = (username, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT `id`, `username`, `email`, `access_token` FROM `users` WHERE `username`=? LIMIT 1', [username], (err, rows) => {
            connection.release();

            if (err) {
                return callback(err);
            }

            if (!rows.length) {
                return callback(null, false);
            }

            let user = tools.convertKeys(rows[0]);
            return callback(null, user);
        });
    });
};

module.exports.add = (username, password, email, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('INSERT INTO `users` (`username`, `password`, `email`, `created`) VALUES (?, ?, ?, NOW())', [username, password, email], (err, result) => {
            connection.release();

            if (err) {
                return callback(err);
            }

            let id = result && result.insertId;
            if (!id) {
                return callback(new Error(_('Could not store user row')));
            }

            return callback(null, id);
        });
    });
};

/**
 * Fetches user by username and password
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} callback Return an error or authenticated user
 */
module.exports.authenticate = (username, password, callback) => {

    if (password === '') {
        return callback(null, false);
    }

    let login = (connection, callback) => {
        connection.query('SELECT `id`, `password`, `access_token` FROM `users` WHERE `username`=? OR email=? LIMIT 1', [username, username], (err, rows) => {
            if (err) {
                return callback(err);
            }

            if (!rows.length) {
                return callback(null, false);
            }

            bcrypt.compare(password, rows[0].password, (err, result) => {
                if (err) {
                    return callback(err);
                }
                if (!result) {
                    return callback(null, false);
                }

                let user = tools.convertKeys(rows[0]);
                return callback(null, {
                    id: user.id,
                    username
                });
            });

        });
    };

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        login(connection, (err, user) => {
            connection.release();
            callback(err, user);
        });
    });
};

/**
 * Updates user password
 *
 * @param {Object} id User ID
 * @param {Object} updates
 * @param {Function} Return an error or success/fail
 */
module.exports.update = (id, updates, callback) => {

    if (!updates.email) {
        return callback(new Error(_('Email Address must be set')));
    }

    let update = (connection, callback) => {

        connection.query('SELECT password FROM users WHERE id=? LIMIT 1', [id], (err, rows) => {
            if (err) {
                return callback(err);
            }

            if (!rows.length) {
                return callback(_('Failed to check user data'));
            }

            let keys = ['email'];
            let values = [updates.email];

            let finalize = () => {
                values.push(id);
                connection.query('UPDATE users SET ' + keys.map(key => key + '=?').join(', ') + ' WHERE id=? LIMIT 1', values, (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            err = new Error(_('Can\'t change email as another user with the same email address already exists'));
                        }
                        return callback(err);
                    }
                    return callback(null, result.affectedRows);
                });
            };

            if (!updates.password && !updates.password2) {
                return finalize();
            }

            bcrypt.compare(updates.currentPassword, rows[0].password, (err, result) => {
                if (err) {
                    return callback(err);
                }
                if (!result) {
                    return callback(_('Incorrect current password'));
                }

                if (!updates.password) {
                    return callback(new Error(_('New password not set')));
                }

                if (updates.password !== updates.password2) {
                    return callback(new Error(_('Passwords do not match')));
                }

                bcrypt.hash(updates.password, null, null, (err, hash) => {
                    if (err) {
                        return callback(err);
                    }

                    keys.push('password');
                    values.push(hash);

                    finalize();
                });
            });
        });
    };

    tools.validateEmail(updates.email, false, err => {
        if (err) {
            return callback(err);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }
            update(connection, (err, updated) => {
                connection.release();
                callback(err, updated);
            });
        });
    });
};

module.exports.resetToken = (id, callback) => {
    id = Number(id) || 0;

    if (!id) {
        return callback(new Error(_('User ID not set')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let token = crypto.randomBytes(20).toString('hex').toLowerCase();
        let query = 'UPDATE users SET `access_token`=? WHERE id=? LIMIT 1';
        let values = [token, id];

        connection.query(query, values, (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, result.affectedRows);
        });
    });

};


module.exports.sendReset = (username, callback) => {
    username = (username || '').toString().trim();

    if (!username) {
        return callback(new Error(_('Username must be set')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT id, email, username FROM users WHERE username=? OR email=? LIMIT 1', [username, username], (err, rows) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            if (!rows.length) {
                connection.release();
                return callback(null, false);
            }

            let resetToken = crypto.randomBytes(16).toString('base64').replace(/[^a-z0-9]/gi, '');
            connection.query('UPDATE users SET reset_token=?, reset_expire=NOW() + INTERVAL 1 HOUR WHERE id=? LIMIT 1', [resetToken, rows[0].id], err => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                settings.list(['serviceUrl', 'adminEmail'], (err, configItems) => {
                    if (err) {
                        return callback(err);
                    }

                    mailer.sendMail({
                        from: {
                            address: configItems.adminEmail
                        },
                        to: {
                            address: rows[0].email
                        },
                        subject: _('Mailer password change request')
                    }, {
                        html: 'emails/password-reset-html.hbs',
                        text: 'emails/password-reset-text.hbs',
                        data: {
                            title: 'Mailtrain',
                            username: rows[0].username,
                            confirmUrl: urllib.resolve(configItems.serviceUrl, '/users/reset') + '?token=' + encodeURIComponent(resetToken) + '&username=' + encodeURIComponent(rows[0].username)
                        }
                    }, err => {
                        if (err) {
                            log.error('Mail', err); // eslint-disable-line no-console
                        }
                    });

                    callback(null, true);
                });
            });
        });
    });
};

module.exports.checkResetToken = (username, resetToken, callback) => {
    if (!username || !resetToken) {
        return callback(new Error(_('Missing username or reset token')));
    }
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        connection.query('SELECT id FROM users WHERE username=? AND reset_token=? AND reset_expire > NOW() LIMIT 1', [username, resetToken], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, rows && rows.length || false);
        });
    });
};

module.exports.resetPassword = (data, callback) => {
    let updates = tools.convertKeys(data);

    if (!updates.username || !updates.resetToken) {
        return callback(new Error(_('Missing username or reset token')));
    }

    if (!updates.password || !updates.password2 || updates.password !== updates.password2) {
        return callback(new Error(_('Invalid new password')));
    }

    bcrypt.hash(updates.password, null, null, (err, hash) => {
        if (err) {
            return callback(err);
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }
            connection.query('UPDATE users SET password=?, reset_token=NULL, reset_expire=NULL WHERE username=? AND reset_token=? AND reset_expire > NOW() LIMIT 1', [hash, updates.username, updates.resetToken], (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                return callback(null, result.affectedRows);
            });
        });
    });
};
