'use strict';

const log = require('../lib/log');
const {initDb} = require('../lib/dbupdate');
const knex = require('../lib/knex');
const {getAdminId} = require("../../shared/users");
const bcrypt = require('bcrypt');

async function init() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        log.error('Usage: NODE_ENV=production node setup/docker-entrypoint-db-setup.js <admin password> <admin access token>')
        return;
    }

    const passwd = args[0];
    const accessToken = args[1];

    const initialized = await knex.schema.hasTable('users');
    await initDb();

    // Environment credentials bootstrap a new database only. Preserve account
    // changes made through Mailtrain when the container restarts.
    if (initialized) {
        process.exit(0);
    }

    const hashedPasswd = await bcrypt.hash(passwd, 10);
    await knex('users').where({id: getAdminId()}).update({password: hashedPasswd});

    if (accessToken !== '') {
        await knex('users').where({id: getAdminId()}).update({access_token: accessToken});
    }

    process.exit(0);
}

init().catch(err => {log.error('', err); process.exit(1); });


