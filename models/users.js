'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const passwordValidator = require('../shared/password-validator')();
const dtHelpers = require('../lib/dt-helpers');
const bcrypt = require('bcrypt-nodejs');
const tools = require('../lib/tools');

const allowedKeys = new Set(['username', 'name', 'email', 'password']);

function hash(user) {
    return hasher.hash(filterObject(user, allowedKeys));
}

async function getById(userId) {
    const user = await knex('users').select(['id', 'username', 'name', 'email']).where('id', userId).first();
    if (!user) {
        throw new interoperableErrors.NotFoundError();
    }

    user.hash = hash(user);

    return user;
}

async function getByUsername(username) {
    const user = await knex('users').select(['id', 'username', 'name', 'email']).where('username', username).first();
    if (!user) {
        throw new interoperableErrors.NotFoundError();
    }

    user.hash = hash(user);

    return user;
}

async function listDTAjax(params) {
    return await dtHelpers.ajaxList(params, tx => tx('users'), ['users.id', 'users.username', 'users.name']);
}

async function create(user) {
    const userId = await knex('users').insert(filterObject(user, allowedKeys));
    return userId;
}

async function updateWithConsistencyCheck(user) {
    await knex.transaction(async tx => {
        const existingUser = await tx('users').where('id', user.id).first();
        if (!user) {
            throw new interoperableErrors.NotFoundError();
        }

        const existingUserHash = hash(existingUser);
        if (existingUserHash != user.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        const otherUserWithSameUsername = await tx('users').whereNot('id', user.id).andWhere('username', user.username).first();
        if (otherUserWithSameUsername) {
            throw new interoperableErrors.DuplicitNameError();
        }

        if (user.password) {
            const passwordValidatorResults = passwordValidator.test(user.password);
            if (passwordValidatorResults.errors.length > 0) {
                // This is not an interoperable error because this is not supposed to happen unless the client is tampered with.
                throw new Error('Invalid password');
            }

            bcrypt.hash(updates.password, null, null, (err, hash) => {
                if (err) {
                    return callback(err);
                }

                keys.push('password');
                values.push(hash);

                finalize();
            });

            tools.validateEmail(updates.email, false)

        } else {
            delete user.password;
        }

        await tx('users').where('id', user.id).update(filterObject(user, allowedKeys));
    });
}

async function remove(userId) {
    // FIXME: enforce that userId is not the current user
    await knex('users').where('id', userId).del();
}

module.exports = {
    listDTAjax,
    remove,
    updateWithConsistencyCheck,
    create,
    hash,
    getById,
    getByUsername
};