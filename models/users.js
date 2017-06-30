'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const passwordValidator = require('../shared/password-validator')();
const validators = require('../shared/validators');
const dtHelpers = require('../lib/dt-helpers');
const tools = require('../lib/tools-async');
const Promise = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

const allowedKeys = new Set(['username', 'name', 'email', 'password']);
const ownAccountAllowedKeys = new Set(['name', 'email', 'password']);

function hash(user) {
    return hasher.hash(filterObject(user, allowedKeys));
}

async function getById(userId) {
    const user = await knex('users').select(['id', 'username', 'name', 'email', 'password']).where('id', userId).first();
    if (!user) {
        throw new interoperableErrors.NotFoundError();
    }

    user.hash = hash(user);

    delete(user.password);

    return user;
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
    await knex.transaction(async tx => {
        await _validateAndPreprocess(tx, user, true);
        const userId = await tx('users').insert(filterObject(user, allowedKeys));
        return userId;
    });
}

async function updateWithConsistencyCheck(user, isOwnAccount) {
    await knex.transaction(async tx => {
        await _validateAndPreprocess(tx, user, false, isOwnAccount);

        const existingUser = await tx('users').select(['id', 'username', 'name', 'email', 'password']).where('id', user.id).first();
        if (!user) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingUserHash = hash(existingUser);
        if (existingUserHash != user.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        if (isOwnAccount && user.password) {
            console.log(user.currentPassword);
            console.log(existingUser.password);

            if (!await bcryptCompare(user.currentPassword, existingUser.password)) {
                // This is not an interoperable error because current password is verified in account-validate.
                // A change of password between account-validate and submit would be signalled by ChangedError
                throw new Error('Incorrect password');
            }
        }

        await tx('users').where('id', user.id).update(filterObject(user, isOwnAccount ? ownAccountAllowedKeys : allowedKeys));
    });
}

async function remove(userId) {
    // FIXME: enforce that userId is not the current user
    enforce(userId !== 1, 'Admin cannot be deleted');
    await knex('users').where('id', userId).del();
}

module.exports = {
    listDTAjax,
    remove,
    updateWithConsistencyCheck,
    create,
    hash,
    getById,
    serverValidate
};