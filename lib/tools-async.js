'use strict';

const _ = require('./translate')._;
const util = require('util');
const isemail = require('isemail')

module.exports = {
    validateEmail
};

async function validateEmail(address, checkBlocked) {
    let user = (address || '').toString().split('@').shift().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (checkBlocked && blockedUsers.indexOf(user) >= 0) {
        throw new new Error(util.format(_('Blocked email address "%s"'), address));
    }

    const result = await new Promise(resolve => {
        const result = isemail.validate(address, {
            checkDNS: true,
            errorLevel: 1
        }, resolve);
    });

    return result;
}
