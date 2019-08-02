'use strict';

const knex = require('../lib/knex');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const tools = require('../lib/tools');
const { enforce } = require('../lib/helpers');

const {BlacklistActivityType} = require('../../shared/activity-log');
const activityLog = require('../lib/activity-log');


async function listDTAjax(context, params) {
    shares.enforceGlobalPermission(context, 'manageBlacklist');

    return await dtHelpers.ajaxList(
        params,
        builder => builder
            .from('blacklist'),
        ['blacklist.email']
    );
}

async function search(context, offset, limit, search) {
    return await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'manageBlacklist');

        search = '%' + search + '%';

        const count = await tx('blacklist').where('email', 'like', search).count('* as count').first().count;

        const rows = await tx('blacklist').where('email', 'like', search).offset(offset).limit(limit);

        return {
            emails: rows.map(row => row.email),
            total: count
        };
    });
}

async function add(context, email) {
    enforce(email, 'Email has to be set');

    shares.enforceGlobalPermission(context, 'manageBlacklist');

    try {
        await knex('blacklist').insert({email});
        await activityLog.logBlacklistActivity(BlacklistActivityType.ADD, email);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
        } else {
            throw err;
        }
    }
}

async function remove(context, email) {
    enforce(email, 'Email has to be set');

    return await knex.transaction(async tx => {
        shares.enforceGlobalPermission(context, 'manageBlacklist');

        await tx('blacklist').where('email', email).del();

        await activityLog.logBlacklistActivity(BlacklistActivityType.REMOVE, email);
    });
}

async function isBlacklisted(email) {
    enforce(email, 'Email has to be set');

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

module.exports.listDTAjax = listDTAjax;
module.exports.add = add;
module.exports.remove = remove;
module.exports.search = search;
module.exports.isBlacklisted = isBlacklisted;
module.exports.serverValidate = serverValidate;
