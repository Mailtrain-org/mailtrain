'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const tools = require('../lib/tools-async');

async function listDTAjax(context, params) {
    shares.enforceGlobalPermission(context, 'manageBlacklist');

    return await dtHelpers.ajaxList(
        params,
        builder => builder
            .from('blacklist'),
        ['blacklist.email']
    );
}

/*
module.exports.get = (start, limit, search, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        search = '%' + search + '%';
        connection.query('SELECT SQL_CALC_FOUND_ROWS `email` FROM blacklist WHERE `email` LIKE ? ORDER BY `email` LIMIT ? OFFSET ?', [search, limit, start], (err, rows) => {
            if (err) {
                return callback(err);
            }

            connection.query('SELECT FOUND_ROWS() AS total', (err, total) => {
                connection.release();
                if (err) {
                    return callback(err);
                }
                let emails = [];
                rows.forEach(email => {
                    emails.push(email.email);
                });
                return callback(null, emails, total && total[0] && total[0].total);
            });
        });
    });
};
*/

async function search(context, start, limit, search) {
    return await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'manageBlacklist');

        search = '%' + search + '%';

        const count = await tx('blacklist').where('email', 'like', search).count();
        // FIXME - the count won't likely work;
        console.log(count);

        const rows = await tx('blacklist').where('email', 'like', search).offset(start).limit(limit);

        return {
            emails: rows.map(row => row.email),
            total: count
        };
    });
}

async function add(context, email) {
    return await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'manageBlacklist');

        const existing = await tx('blacklist').where('email', email).first();
        if (!existing) {
            await tx('blacklist').insert({email});
        }
    });
}

async function remove(context, email) {
    shares.enforceGlobalPermission(context, 'manageBlacklist');
    await knex('blacklist').where('email', email).del();
}

async function isBlacklisted(email) {
    const existing = await knex('blacklist').where('email', email).first();
    return !!existing;
}

async function serverValidate(context, data) {
    shares.enforceGlobalPermission(context, 'manageBlacklist');
    const result = {};

    if (data.email) {
        const user = await knex('blacklist').where('email', data.email).first();

        result.email = {};
        result.email.invalid = await tools.validateEmail(data.email) !== 0;
        result.email.exists = !!user;
    }

    return result;
}

module.exports = {
    listDTAjax,
    add,
    remove,
    search,
    isBlacklisted,
    serverValidate
};