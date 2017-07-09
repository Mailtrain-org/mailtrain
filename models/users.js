'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const passwordValidator = require('../shared/password-validator')();
const validators = require('../shared/validators');
const dtHelpers = require('../lib/dt-helpers');
const tools = require('../lib/tools-async');
let crypto = require('crypto');
const settings = require('./settings');
const urllib = require('url');
const _ = require('../lib/translate')._;

const bluebird = require('bluebird');

const bcrypt = require('bcrypt-nodejs');
const bcryptHash = bluebird.promisify(bcrypt.hash);
const bcryptCompare = bluebird.promisify(bcrypt.compare);

const mailer = require('../lib/mailer');
const mailerSendMail = bluebird.promisify(mailer.sendMail);

const allowedKeys = new Set(['username', 'name', 'email', 'password']);
const allowedKeysExternal = new Set(['username']);
const ownAccountAllowedKeys = new Set(['name', 'email', 'password']);
const hashKeys = new Set(['username', 'name', 'email']);

const passport = require('../lib/passport');


function hash(user) {
    return hasher.hash(filterObject(user, hashKeys));
}

async function _getBy(key, value, extraColumns) {
    const columns = ['id', 'username', 'name', 'email'];

    if (extraColumns) {
        columns.push(...extraColumns);
    }

    const user = await knex('users').select(columns).where(key, value).first();

    if (!user) {
        throw new interoperableErrors.NotFoundError();
    }

    return user;
}

async function getById(userId) {
    return await _getBy('id', userId);
}

async function serverValidate(data, isOwnAccount) {
    const result = {};

    if (!isOwnAccount && data.username) {
        const query = knex('users').select(['id']).where('username', data.username);

        if (data.id) {
            // Id is not set in entity creation form
            query.andWhereNot('id', data.id);
        }

        const user = await query.first();
        result.username = {
            exists: !!user
        };
    }

    if (isOwnAccount && data.currentPassword) {
        const user = await knex('users').select(['id', 'password']).where('id', data.id).first();

        result.currentPassword = {};
        result.currentPassword.incorrect = !await bcryptCompare(data.currentPassword, user.password);
    }

    if (data.email) {
        const query = knex('users').select(['id']).where('email', data.email);

        if (data.id) {
            // Id is not set in entity creation form
            query.andWhereNot('id', data.id);
        }

        const user = await query.first();

        result.email = {};
        result.email.invalid = await tools.validateEmail(data.email) !== 0;
        result.email.exists = !!user;
    }

    return result;
}

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('users'), ['users.id', 'users.username', 'users.name']);
}

async function _validateAndPreprocess(tx, user, isCreate, isOwnAccount) {
    enforce(await tools.validateEmail(user.email) === 0, 'Invalid email');

    const otherUserWithSameEmailQuery = tx('users').where('email', user.email);
    if (user.id) {
        otherUserWithSameEmailQuery.andWhereNot('id', user.id);
    }

    const otherUserWithSameUsername = await otherUserWithSameEmailQuery.first();
    if (otherUserWithSameUsername) {
        throw new interoperableErrors.DuplicitEmailError();
    }


    if (!isOwnAccount) {
        enforce(validators.usernameValid(user.username), 'Invalid username');

        const otherUserWithSameUsernameQuery = tx('users').where('username', user.username);
        if (user.id) {
            otherUserWithSameUsernameQuery.andWhereNot('id', user.id);
        }

        const otherUserWithSameUsername = await otherUserWithSameUsernameQuery.first();
        if (otherUserWithSameUsername) {
            throw new interoperableErrors.DuplicitNameError();
        }
    }


    enforce(!isCreate || user.password.length > 0, 'Password not set');

    if (user.password) {
        const passwordValidatorResults = passwordValidator.test(user.password);
        if (passwordValidatorResults.errors.length > 0) {
            // This is not an interoperable error because this is not supposed to happen unless the client is tampered with.
            throw new Error('Invalid password');
        }

        user.password = await bcryptHash(user.password, null, null);
    } else {
        delete user.password;
    }
}

async function create(user) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');

    await knex.transaction(async tx => {
        await _validateAndPreprocess(tx, user, true);
        const userId = await tx('users').insert(filterObject(user, allowedKeys));
        return userId;
    });
}

async function createExternal(user) {
    enforce(!passport.isAuthMethodLocal, 'External user management is required');

    const userId = await knex('users').insert(filterObject(user, allowedKeysExternal));
    return userId;
}

async function updateWithConsistencyCheck(user, isOwnAccount) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');

    await knex.transaction(async tx => {
        await _validateAndPreprocess(tx, user, false, isOwnAccount);

        const existingUser = await tx('users').select(['id', 'username', 'name', 'email', 'password']).where('id', user.id).first();
        if (!user) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingUserHash = hash(existingUser);
        if (existingUserHash !== user.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        if (isOwnAccount && user.password) {
            if (!await bcryptCompare(user.currentPassword, existingUser.password)) {
                throw new interoperableErrors.IncorrectPasswordError();
            }
        }

        await tx('users').where('id', user.id).update(filterObject(user, isOwnAccount ? ownAccountAllowedKeys : allowedKeys));
    });
}

async function remove(context, userId) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');
    enforce(userId !== 1, 'Admin cannot be deleted');
    enforce(context.user.id !== userId, 'User cannot delete himself/herself');

    await knex('users').where('id', userId).del();
}

async function getByAccessToken(accessToken) {
    return await _getBy('access_token', accessToken);
}

async function getByUsername(username) {
    return await _getBy('username', username);
}

async function getByUsernameIfPasswordMatch(username, password) {
    try {
        const user = await _getBy('username', username, ['password']);

        if (!await bcryptCompare(password, user.password)) {
            throw new interoperableErrors.IncorrectPasswordError();
        }

        return user;

    } catch (err) {
        if (err instanceof interoperableErrors.NotFoundError) {
            throw new interoperableErrors.IncorrectPasswordError();
        }

        throw err;
    }
}

async function getAccessToken(userId) {
    const user = await _getBy('id', userId, ['access_token']);
    return user.access_token;
}

async function resetAccessToken(userId) {
    const token = crypto.randomBytes(20).toString('hex').toLowerCase();

    const affectedRows = await knex('users').where({id: userId}).update({access_token: token});

    if (!affectedRows) {
        throw new interoperableErrors.NotFoundError();
    }

    return token;
}

async function sendPasswordReset(usernameOrEmail) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');

    await knex.transaction(async tx => {
        const user = await tx('users').where('username', usernameOrEmail).orWhere('email', usernameOrEmail).select(['id', 'username', 'email', 'name']).first();

        if (user) {
            const resetToken = crypto.randomBytes(16).toString('base64').replace(/[^a-z0-9]/gi, '');

            await tx('users').where('id', user.id).update({
                reset_token: resetToken,
                reset_expire: new Date(Date.now() + 60 * 60 * 1000)
            });

            const { serviceUrl, adminEmail } = await settings.get(['serviceUrl', 'adminEmail']);

            await mailerSendMail({
                from: {
                    address: adminEmail
                },
                to: {
                    address: user.email
                },
                subject: _('Mailer password change request')
            }, {
                html: 'emails/password-reset-html.hbs',
                text: 'emails/password-reset-text.hbs',
                data: {
                    title: 'Mailtrain',
                    username: user.username,
                    name: user.name,
                    confirmUrl: urllib.resolve(serviceUrl, `/account/reset/${encodeURIComponent(user.username)}/${encodeURIComponent(resetToken)}`)
                }
            });
        }
        // We intentionally silently ignore the situation when user is not found. This is not to reveal if a user exists in the system.
    });
}

async function isPasswordResetTokenValid(username, resetToken) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');

    const user = await knex('users').select(['id']).where({username, reset_token: resetToken}).andWhere('reset_expire', '>', new Date()).first();
    return !!user;
}

async function resetPassword(username, resetToken, password) {
    enforce(passport.isAuthMethodLocal, 'Local user management is required');

    await knex.transaction(async tx => {
        const user = await tx('users').select(['id']).where({
            username,
            reset_token: resetToken
        }).andWhere('reset_expire', '>', new Date()).first();

        if (user) {
            const passwordValidatorResults = passwordValidator.test(password);
            if (passwordValidatorResults.errors.length > 0) {
                // This is not an interoperable error because this is not supposed to happen unless the client is tampered with.
                throw new Error('Invalid password');
            }

            password = await bcryptHash(password, null, null);

            await tx('users').where({username}).update({
                password,
                reset_token: null,
                reset_expire: null
            });
        } else {
            throw new interoperableErrors.InvalidToken();
        }
    });
}


module.exports = {
    listDTAjax,
    remove,
    updateWithConsistencyCheck,
    create,
    createExternal,
    hash,
    getById,
    serverValidate,
    getByAccessToken,
    getByUsername,
    getByUsernameIfPasswordMatch,
    getAccessToken,
    resetAccessToken,
    sendPasswordReset,
    isPasswordResetTokenValid,
    resetPassword
};